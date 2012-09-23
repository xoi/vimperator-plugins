/**
 * ==VimperatorPlugin==
 * @name           migemo_completion_location.js
 * @description    replace Smart Completions function with using Migemo
 * @description-ja Smart Completions関数をMigemoを使用したものに取り替える
 * ==/VimperatorPlugin==
 **/

(function(){
  function createFromPrototype(prototype) {
    function ctor() {}
    ctor.prototype = prototype;
    return new ctor();
  }

  var bar = createFromPrototype(XMigemoLocationBarOverlay.bar);
  bar.__defineGetter__("disableAutoComplete", function() false);
  bar.openPopup = function() {}
  bar.closePopup = function() {
    this.__proto__.closePopup();
  }
  var result = createFromPrototype(XMigemoLocationBarOverlay.bar.mController);
  result.__defineGetter__("service", function() {
    return service;
  });
  var service = createFromPrototype(XMigemoLocationBarOverlay);
  service.startSearch = function(searchString, extra, lastResult, listener) {
    this.inputValue = XMigemoCore.trimFunctionalInput(searchString);
    if (this.isMigemoActive) {
      this.listener = listener;
      this.onSearchBegin();
    }
    else {
      this.context.incomplete = false;
    }
  }
  service.stopSearch = function() {
    this.clear();
  }
  service.isActive = true;
  service.__defineGetter__("bar", function() {
    return bar;
  });
  service.__defineGetter__("input", function() {
    return this.inputValue;
  });
  service.__defineSetter__("busy", function(value) {
    if (value) {
      result.incomplete = true;
    }
  });
  service._progressiveBuild = service.progressiveBuild;
  service.progressiveBuild = function() {
    this._progressiveBuild();
    this.listener.onSearchResult(undefined, result);
  }
  service._stopProgressiveBuild = service.stopProgressiveBuild;
  service.stopProgressiveBuild = function() {
    this._stopProgressiveBuild();
    if (result.incomplete) {
      result.incomplete = false;
      this.listener.onSearchResult(undefined, result);
    }
  }
  service.buildItemAt = function() {}

  // CHANGE:
  // %s/services.get("autoCompleteSearch")/service/
  // %s/result.searchResult >= result.RESULT_NOMATCH_ONGOING/result.incomplete/
  // %s/result.searchResult <= result.RESULT_SUCCESS/!result.incomplete/
  // /service.startSearch/i
  // service.context = context;
  // .
  function location(context) {
      if (!service)
	  return;

      context.anchored = false;
      context.title = ["Smart Completions"];
      context.keys.icon = 2;
      context.incomplete = true;
      context.hasItems = context.completions.length > 0; // XXX
      context.filterFunc = null;
      context.cancel = function () { service.stopSearch(); context.completions = []; };
      context.compare = CompletionContext.Sort.unsorted;
      service.stopSearch(); // just to make sure we cancel old running completions
      let timer = new Timer(50, 100, function (result) {
	  context.incomplete = result.incomplete;
	  context.completions = [
	      [result.getValueAt(i), result.getCommentAt(i), result.getImageAt(i)]
		  for (i in util.range(0, result.matchCount))
	  ];
      });
      service.context = context;
      service.startSearch(context.filter, "", context.result, {
	  onSearchResult: function onSearchResult(search, result) {
	      timer.tell(result);
	      if (!result.incomplete)
		  timer.flush();
	  }
      });
  }

  completion.urlCompleters.l.completer = location;
})();
