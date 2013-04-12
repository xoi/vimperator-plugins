/**
 * ==VimperatorPlugin==
 * @name           map-cond.js
 * @description    map condition
 * @description-ja マップ条件
 * ==/VimperatorPlugin==
 **/

// hack matchingUrls
function MapCond() {
}
MapCond.prototype = {
  get source() this.toString(),
  __proto__: RegExp.prototype,
  toString: function() "?" + this.name
}

function MapCondAll() {
  this.list = Array.slice(arguments);
}
MapCondAll.prototype = {
  __proto__: MapCond.prototype,
  toString: function() "?$all" + this.list.join(),
  test: function(url) this.list.every(function(elem) elem.test(url))
}

function MapCondBool(name, value) {
  this.name = name;
  this.value = value;
}
MapCondBool.prototype = {
  __proto__: MapCond.prototype,
  test: function() this.value,
  toggle: function() this.value = !this.value
}

var activeMapGroups = {};

events._input.watch("buffer", function(id, oldval, newval) {
  if (newval == "") {
    activeMapGroups = {};
  }
  return newval;
});

let (orig = Map.prototype.execute) {
  Map.prototype.execute = function() {
    var ret = orig.apply(this, arguments);
    update(activeMapGroups, this.__group);
    return ret;
  }
}

function MapGroup(name) {
  this.name = name;
}
MapGroup.prototype = {
  add: function(mode, list) {
    var self = this;
    list.forEach(function([cmd, patternOrUrl]) {
      var map = mappings.get(mode, mappings._expandLeader(cmd), patternOrUrl);
      map.__group || (map.__group = {});
      map.__group[self.name] = true;
    });
  }
}

function MapCondGroup(group) {
  this.group = group;
}
MapCondGroup.prototype = {
  __proto__: MapCond.prototype,
  toString: function() "?$group$" + this.group.name,
  test: function() activeMapGroups[this.group.name]
}

function addCondMaps(cond, maps) {
  maps.forEach(function([key, action, extra]) {
    extra || (extra = {});

    if (typeof action == "string") {
      var keys = mappings._expandLeader(action);
      action = /^:/.test(keys)
		 ? let (cmd = keys.replace(/^:/, ""))
		     / $/.test(cmd)
		       ? function() commandline.open("", cmd, modes.EX)
		       : function() liberator.execute(cmd)
		 : function() events.feedkeys(keys, extra.noremap, extra.silent);
    }
    extra.matchingUrls = cond;
    mappings.addUserMap([modes.NORMAL], [key], "Mapping for " + cond, action, extra);
  });
}
