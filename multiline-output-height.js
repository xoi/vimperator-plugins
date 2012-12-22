/**
 * ==VimperatorPlugin==
 * @name           multiline-output-height.js
 * @description    correct the disorder of height of multiline output by image
 * @description-ja 画像によるmultiline outputの高さの乱れを直す
 * ==/VimperatorPlugin==
 **/

{
  // TODO: It might be better to poll.
  let src = commandline._echoMultiline.toSource().replace('commandline.updateOutputHeight(true);', '$&setTimeout(function() {commandline.updateOutputHeight(false);}, 100);');
  commandline._echoMultiline = eval(src);
}
