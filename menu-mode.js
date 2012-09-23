/**
 * ==VimperatorPlugin==
 * @name           menu-mode.js
 * @description    enable key mapping when menu is shown
 * @description-ja メニュー表示中にキーマッピングを有効にする
 * ==/VimperatorPlugin==
 **/

(function(){
  modes.addMode("MENU");
  [
    ["<Esc>", function() true, { route: true }],
    ["<C-[>", function() { events.feedkeys("<Esc>", true); }],
  ].forEach(function([key, action, extra]) {
    mappings.add([modes.MENU], [key], "Close menu", action, extra);
  });
  modes._isMenuShown = false;
  modes.__defineGetter__("isMenuShown", function() {
    return false;
  });
  modes.__defineSetter__("isMenuShown", function(value) {
    if (this._isMenuShown != value) {
      this._isMenuShown = value;
      if (value)
	modes.set(modes.MENU);
      else
	modes.reset();
    }
  });
})();
