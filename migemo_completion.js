/**
 * ==VimperatorPlugin==
 * @name           migemo_completion.js
 * @description    replace completion function with using Migemo
 * @description-ja 補完関数をMigemoを使用したものに取り替える
 * @author         Trapezoid
 * @version        0.3
 * ==/VimperatorPlugin==
 *
 * Support commands:
 *  - :buffer
 *  - :sidebar
 *  - :emenu
 *  - :dialog
 *  - :help
 *  - :macros
 *  - :play
 *  and more
 **/

(function(){
  Cu.import("resource://xulmigemo-modules/core/core.js");
  Cu.import("resource://xulmigemo-modules/core/textUtils.js");
  var core = MigemoCoreFactory.get("ja");

  const CompletionContext = liberator.eval("CompletionContext", modules);

  var oldFilter,migemoPattern;
  CompletionContext.prototype.match = function (str){
      var filter = this.filter;
      if (this.anchored || !filter) return this._match(filter, str);
      if (oldFilter != filter) migemoPattern = new RegExp(MigemoTextUtils.sanitize(filter) + "|" + core.getRegExp(filter),"i");

      oldFilter = filter;
      return migemoPattern.test(str);
  };
})();
