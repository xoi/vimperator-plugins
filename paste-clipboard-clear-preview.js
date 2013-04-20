/**
 * ==VimperatorPlugin==
 * @name           paste-clipboard-clear-preview.js
 * @description    clear preview when paste clipboard
 * @description-ja paste clipboard時にpreviewを消す
 * ==/VimperatorPlugin==
 **/

let (orig = editor.pasteClipboard) {
  editor.pasteClipboard = function() {
    var ret = orig.apply(this, arguments);
    if (liberator.focus == commandline._commandWidget.inputField) {
      commandline.onEvent({ type: "input" });
    }
    return ret;
  }
}
