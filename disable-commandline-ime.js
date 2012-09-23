/**
 * ==VimperatorPlugin==
 * @name           disable-commandline-ime.js
 * @description    disable commandline ime
 * @description-ja コマンドラインのIMEを無効にする
 * ==/VimperatorPlugin==
 **/

(function(){
  var input = commandline._commandWidget.inputField;
  function enableIme() {
    input.style.imeMode = "";
    input.blur();
    // Vimperator focus automatically
  }

  function addPreProc(obj, name, proc) {
    var orig = obj[name];
    obj[name] = function() {
      proc();
      return orig.apply(this, arguments);
    }
  }

  addPreProc(commandline, "show", function() input.style.imeMode = "disabled");

  // TODO:
  mappings.add([modes.COMMAND_LINE], ["<C-j>"], "Enable IME", function() enableIme());
})();
