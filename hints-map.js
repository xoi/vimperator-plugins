// add mapping for hint mode

{
  let orig = hints.canHandleKey;
  hints.canHandleKey = function(key) {
    return orig.apply(this, arguments) || maps[key];
  }
}

{
  let orig = hints.onEvent;
  hints.onEvent = function(event) {
    let key = events.toString(event);
    let action = maps[key];
    if (action) {
      action.call(this, key);
    }
    else {
      return orig.apply(this, arguments);
    }
  }
}

function add(key, action) {
  maps[events.canonicalKeys(key)] = action;
}

let maps = {};
