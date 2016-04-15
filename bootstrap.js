/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

Components.utils.import("resource:///modules/imServices.jsm");
Components.utils.import("resource:///modules/imWindows.jsm");

function replaceLogLinks(aOutgoingMessage) {
  let text = aOutgoingMessage.message;
  if (!text.includes("log.bezut.info"))
    return;

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
  text = text.replace(/(log\.bezut\.info\/instantbird\/)(today|yesterday)/,
                            rewriteDate, "gi" /* global, case-insensitive */);
  aOutgoingMessage.message = text;
}

var replaceObserver = {
  observe: function(aSubject, aTopic, aData) {
    if (aTopic != "preparing-message")
      return;
    // aSubject is an imIOutgoingMessage.
    replaceLogLinks(aSubject);
  }
}

var convObserver = {
  observe: function(aSubject, aTopic, aData) {
    aSubject.addObserver(replaceObserver);
  }
}

function startup (data, reason) {
  Conversations._conversations.forEach(aConv =>
    aConv.conv.addObserver(replaceObserver));
  Services.obs.addObserver(convObserver, "new-ui-conversation", false);
}

function shutdown (data, reason) {
  Conversations._conversations.forEach(aConv =>
    aConv.conv.removeObserver(replaceObserver));
  Services.obs.removeObserver(convObserver, "new-ui-conversation");
}

function install (data, reason) {}
function uninstall (data, reason) {}
