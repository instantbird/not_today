/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

Components.utils.import("resource:///modules/imServices.jsm");

var originalAddConversationFunction;

function replaceLogLinks (aString) {
  if (!aString.contains("log.bezut.info"))
    return aString;
  
  let rewriteDate = function (match, ...params) {
     // params[1] is the second parenthesized submatch string here.
    let str = params[1].toLowerCase();

    let timeOffset;
    if(str == "today")
      timeOffset = 0;
    else if (str == "yesterday")
      timeOffset = -24*3600*1000;

    let date = new Date(Date.now() + timeOffset);
    let twoChar = function (aStr) ("0" + aStr).slice(-2);

    return params[0] + twoChar(date.getUTCFullYear()) +
           twoChar(date.getUTCMonth() + 1) + twoChar(date.getUTCDate());
  };
  aString = aString.replace(/(log\.bezut\.info\/instantbird\/)(today|yesterday)/,
                            rewriteDate, "gi" /* global, case-insensitive */);
  return aString;
}

function startup (data, reason) {
  let cs = Services.conversations.wrappedJSObject;
  originalAddConversationFunction = cs.addConversation;
  cs.addConversation = function (aPurpleConversation) {
    let wrapper = {
      __proto__: aPurpleConversation,
      _conv: aPurpleConversation,
      sendMsg: function(aMsg) {
        this._conv.sendMsg(replaceLogLinks(aMsg));
      }
    };
    originalAddConversationFunction.call(cs, wrapper);
  };
}
function shutdown (data, reason) {
  let cs = Services.conversations.wrappedJSObject;
  cs.addConversation = originalAddConversationFunction;
}

function install (data, reason) {}
function uninstall (data, reason) {}