/**
 * ==VimperatorPlugin==
 * @name           manipulate-nicofox.js
 * @description    manipulate NicoFox
 * @description-ja NicoFoxを操作する
 * ==/VimperatorPlugin==
 **/

(function(){
  function list(args) {
    var filter = args[0];
    completion.listCompleter(completer.id, filter);
  }

  function openPanel(args) {
    nicofox.overlay.onMenuItemCommand();
  }

  function download(args) {
    var url = args[0];
    if (url) {
      loadAsync(function() {
	if (!allItems().some(function(item) item.getAttribute("sfurl") == url))
	  nicofox.DownloadManager.addDownload(url);
      });
    }
    else
      nicofox.panel.videoTools.download();
  }

  function retry(args) {
    var id = args[0];
    loadAsync(function() {
      var items = id ? [getItemById(id)] : allItems();
      // retry download
      items.forEach(function(item) nicofox.panel.commands.retry(item));
    });
  }

  function clean(args) {
    var id = args[0];
    loadAsync(function() {
      var item = getItemById(id);

      // clean files
      ["sfvideofile", "sfcommentfile", "sfuploadercommentfile", update(new String("thumbnail"), { uri: true })].forEach(function(attr) {
	if (item.hasAttribute(attr)) {
	  var path = item.getAttribute(attr);
	  if (attr.uri) {
	    path = decodeURIComponent(nicofox.Services.io.newURI(path, null, null).path);
	  }
	  var file = new nicofox.panel._fileInstance(path);
	  if (file.exists())
	    file.remove(false);
	}
      });

      // remove item
      nicofox.panel.commands.remove(item);
    });
  }

  // タブ、ブックマークにない項目を全て消す
  function cleanupNoBrowserRef(args) {
    var urls = {};
    liberator.windows.forEach(function(win) {
      win.liberator.modules.tabs.get().forEach(function(tab) { urls[tab[2]] = true; });
    });
    storage["bookmark-cache"].bookmarks.forEach(function(bookmark) { urls[bookmark.url] = true; });
    loadAsync(function() {
      allItems().forEach(function(item) {
	if (!urls[item.getAttribute("sfurl")])
	  clean([item.getAttribute("sfid")]);
      });
    });
  }

  function loadAsync(onComplete, onProgress) {
    if (nicofox.panel.loaded) {
      onComplete();
      return;
    }
    // panelの項目未作成時は項目作成処理に合わせてasyncで動く
    onUpdateDownloadItem = function(listItem) {
      if (onProgress)
	onProgress(listItem);
    };
    onCompleteLoadPanel = function() {
      onUpdateDownloadItem = onCompleteLoadPanel = noop;
      onComplete();
    };
    let (orig = nicofox.panel.dbFail) {
      nicofox.panel.dbFail = function() {
	onCompleteLoadPanel();
	return orig.apply(this, arguments);
      };
    }
    nicofox.panel.load();
  }

  function getItemById(id) document.getElementById("smileFoxListItem" + id)
  function allItems() Array.slice(document.getElementById("nicofoxDownloadList").childNodes)	// childrenだとappendChild直後に取れない
  function noop() {}
  var onUpdateDownloadItem = noop;
  var onCompleteLoadPanel = noop;

  var completer = {
    id: function(context) {
      context.filters = [CompletionContext.Filter.textDescription];
      context.anchored = false;
      context.title = ["ID", "Description"];
      context.keys = {
	text: function(item) item.getAttribute("sfid"),
	description: function(item) item.getAttribute("sfvideotitle")
      };
      let process = context.process;
      process[1] = function(item, text) xml`<img src=${item.item.getAttribute("thumbnail")} style="margin-right: 0.5em; height: 3em; vertical-align: middle;"/><div style="display: inline-block; vertical-align: middle;">${text}<br/>${item.item.getAttribute("sfvideoinfo")}</div>`;
      context.process = process;
      if (nicofox.panel.loaded) {
	context.completions = allItems();
	return;
      }
      // panelの項目未作成時は項目作成処理に合わせてasyncで動く
      context.incomplete = true;
      var completions = [];
      function onProgress(listItem) {
	// setterを通すため直接はpushしない
	completions.push(listItem);
	context.completions = completions;
      };
      function onComplete() {
	context.incomplete = false;
      };
      loadAsync(onComplete, onProgress);
    }
  };

  commands.addUserCommand(
    ["nicofox"],
    "Manipulate NicoFox",
    list,
    {
      subCommands: [
	new Command(["list"], "List items", list, { completer: completer.id }),
	new Command(["openpanel"], "Open panel", openPanel),
	new Command(["download"], "Download current or specified page video", download),
	new Command(["retry"], "Retry download", retry, { completer: completer.id }),
	new Command(["clean"], "Clean item and files", clean, { argCount: "1", completer: completer.id }),
	new Command(["cleanupnobrowserref"], "Cleanup item not in tabs and bookmarks", cleanupNoBrowserRef),
      ]
    }
  );

  let (src) {
    // NicoFoxのtypoなんだけどまあいいか
    src = nicofox.panel.updateDownloadItem.toSource().replace('uploader_commment_file', 'uploader_comment_file');
    nicofox.panel.updateDownloadItem = eval(src);
    src = nicofox.panel.timerEvent.notify.toSource().replace('if (result.end) {', '$&onCompleteLoadPanel();').replace('nicofox.panel.updateDownloadItem(listItem, result);', '$&onUpdateDownloadItem(listItem);');
    nicofox.panel.timerEvent.notify = eval(src);
  }
  /*
  nicofox.Services.prompt.alert = function(parent, title, text) {
    let alertsService = Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
    alertsService.showAlertNotification(null, title, text);
  };
  */
})();
