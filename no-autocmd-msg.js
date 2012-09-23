/**
 * ==VimperatorPlugin==
 * @name           no-autocmd-msg.js
 * @description    suppress the message of auto command
 * @description-ja auto commandのメッセージを抑制する
 * ==/VimperatorPlugin==
 **/

{
  let src = autocommands.trigger.toSource()
    .replace('var lastPattern = null;', '')
    .replace('if (!lastPattern || lastPattern.source != autoCmd.pattern.source) {liberator.echomsg("Executing " + event + " Auto commands for \\"" + autoCmd.pattern.source + "\\"");}lastPattern = autoCmd.pattern;', '');
  autocommands.trigger = eval(src);
}
