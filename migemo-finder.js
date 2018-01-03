// set migemo find mode

var modes = {
  n: XMigemoUI.FIND_MODE_NATIVE,
  m: XMigemoUI.FIND_MODE_MIGEMO,
  r: XMigemoUI.FIND_MODE_REGEXP
};

let orig = finder.find;
finder.find = function(str) {
  let mode = XMigemoUI.FIND_MODE_MIGEMO;
  let result = /^(\w+)\/(.*)$/.exec(str);
  if (result) {
    let tmp = modes[result[1]];
    if (tmp) {
      mode = tmp;
      str = result[2];
    }
  }
  XMigemoUI.setTemporaryFindMode(mode);
  orig.call(this, str);
}
