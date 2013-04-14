/**
 * ==VimperatorPlugin==
 * @name           fullscreen-autohide.js
 * @description    hide outside content in fullscreen
 * @description-ja フルスクリーン時に内容以外を非表示にする
 * ==/VimperatorPlugin==
 **/

(function(){
  function Hider() {
  }
  Hider.prototype = {
    triggerHiding: function() {
      this.timeoutId = setTimeout(this.hide.bind(this), this.delay);
    },
    clearTimeout: function() {
      if (typeof this.timeoutId == "number") {
	clearTimeout(this.timeoutId);
	this.timeoutId = null;
      }
    },
    display: function() {
      this.clearTimeout();
      this.displayPurely();
      this.triggerHiding();
    },
    hide: function() {
      this.hidePurely();
      this.clearTimeout();
    },
    hidePurely: function() {
      this.target.classList.add(this.hiddenClassName);
    },
    displayPurely: function() {
      this.target.classList.remove(this.hiddenClassName);
    }
  }

  let mainWindow = document.documentElement;

  // :set! browser.fullscreen.autohide=false 前提
  var navHider = update(new Hider(), {
    delay: 1000,
    target: gNavToolbox,
    hiddenClassName: "liberator-hidden"
  });

  var msgHider = update(new Hider(), {
    delay: 5000,
    target: mainWindow,
    hiddenClassName: "liberator-message-hidden"
  });

  function addPreProc(obj, name, proc) {
    var orig = obj[name];
    obj[name] = function() {
      proc();
      return orig.apply(this, arguments);
    }
  }

  function echoLine(str) {
    var funcName = str ? 'display' : 'hide';
    msgHider[funcName]();
  }

  liberator.registerObserver("echoLine", echoLine);

  addPreProc(commandline, "hide", function() { mainWindow.classList.add("liberator-commandline-hidden"); });
  addPreProc(commandline, "show", function() { mainWindow.classList.remove("liberator-commandline-hidden"); });

  autocommands.add('LocationChange', /.*/, function() { navHider.display(); });

  commandline.__defineGetter__("bottombarPosition", function() this._bottomBarWidget.boxObject.height + "px");

  mainWindow.classList.add("liberator-commandline-hidden");
  msgHider.display();

  if (liberator.windows.length > 1)
    return;
  autocommands.add(
    "VimperatorEnter",
    /.*/,
    function() {
      var windowRect = mainWindow.getBoundingClientRect();
      var contentRect = gBrowser.getBoundingClientRect();
      var marginTop = -contentRect.top;
      var marginBottom = contentRect.bottom - windowRect.height;

      styles.addSheet(true, "fullscreen-hidden", "chrome://*", `
	:-moz-any(#navigator-toolbox, #liberator-separator, #liberator-bottombar) {
	  -moz-transition-duration: 0.25s;
	}
	#main-window[inFullscreen] #navigator-toolbox.liberator-hidden, #main-window[inFullscreen].liberator-message-hidden.liberator-commandline-hidden :-moz-any(#liberator-separator, #liberator-bottombar) {
	  opacity: 0;
	}
	#main-window[inFullscreen] #navigator-toolbox {
	  margin-top: ${marginTop}px;
	}
	#main-window[inFullscreen] #navigator-toolbox:not(.liberator-hidden) {
	  -moz-transform: translateY(${-marginTop}px);
	}
	#main-window[inFullscreen].liberator-message-hidden.liberator-commandline-hidden #liberator-bottombar {
	  margin-bottom: ${marginBottom}px;
	}
	#main-window[inFullscreen]:-moz-any(:not(.liberator-message-hidden), :not(.liberator-commandline-hidden)) #liberator-separator {
	  margin-top: ${marginBottom}px;
	  -moz-transform: translate(0);
	}
      `);
    }
  );
})();
