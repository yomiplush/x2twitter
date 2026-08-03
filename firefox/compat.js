const X2TStorage = (() => {
  const root = (typeof browser !== "undefined" && browser.storage) ? browser : chrome;
  function get(keys, cb) {
    try {
      const p = root.storage.local.get(keys);
      if (p && typeof p.then === "function") {
        p.then(cb).catch(() => cb({}));
      } else {
        root.storage.local.get(keys, cb);
      }
    } catch (e) {
      cb({});
    }
  }
  function set(obj, cb) {
    try {
      const p = root.storage.local.set(obj);
      if (p && typeof p.then === "function") {
        p.then(() => cb && cb()).catch(() => cb && cb());
      } else {
        root.storage.local.set(obj, cb || (() => {}));
      }
    } catch (e) {
      cb && cb();
    }
  }
  return { get, set, onChanged: root.storage.onChanged };
})();
