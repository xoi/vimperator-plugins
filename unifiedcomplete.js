// use unifiedcomplete for Smart Completions

// Exception occurs when calling stopSearch.
// It will be fixed in fix for Bug 1223728.
//services.services.autoCompleteSearch.class_ = "@mozilla.org/autocomplete/search;1?name=unifiedcomplete";

// workaround
{
  services.add("unifiedcomplete", "@mozilla.org/autocomplete/search;1?name=unifiedcomplete", Ci.nsIAutoCompleteSearch);
  let service = services.get("unifiedcomplete");
  services.services.autoCompleteSearch.reference = {
    startSearch: function(...args) {
      service.startSearch(...args);
    },
    stopSearch: function() {
      try {
	service.stopSearch();
      }
      catch (e) {
	// for workaround
      }
    }
  };
}
