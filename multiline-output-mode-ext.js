/**
 * ==VimperatorPlugin==
 * @name           multiline-output-mode-ext.js
 * @description    make unassigned key to quit and handle, and assign help to the "?" key in multiline output mode
 * @description-ja multiline output modeで未割り当てキーを終了して処理するようにし、"?"キーをヘルプに割り当てる
 * ==/VimperatorPlugin==
 **/

{
  let src = commandline.onMultilineOutputEvent.toSource().replace('if (showHelp) {', '$&if (key != "?") {modes.reset();events.feedkeys(key);return;}');
  commandline.onMultilineOutputEvent = eval(src);
}
