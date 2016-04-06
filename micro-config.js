const deepMixin = require('deep-mixin/mutable');

module.exports = new Config(Object.create(null));
module.exports.Config = Config;

function mergeConfig(config, data) {
  if (Object.keys(data).length === 0) return;

  // make sure these are not overwritten....
  const update = config.update;
  const set = config.set;
  const get = config.get;
  const Config = config.Config;

  deepMixin(config, data);

  if (config.update !== update) config.update = update;
  if (config.set !== set) config.set = set;
  if (config.get !== get) config.get = get;
  if (Config && config.Config !== Config) config.Config = Config;
}

function getKey(config, key) {
  const k = String(key);
  const ks = k.split('.');

  var value = config;
  for (var i = 0; i < ks.length; ++i) {
    value = value[ks[i]];

    if (value == null || 'object' !== typeof value)
      return value;
  }

  return value;
}

function setKey(config, key, data, cache, update) {
  var k = String(key);
  const ks = k.split('.');

  var parent = config;
  var child;
  k = '';

  const l = ks.length - 1;
  for (var i = 0; i < ks.length; ++i) {
    var currentKey = ks[i];
    k += currentKey;

    if (parent[currentKey] == null || 'object' !== typeof parent[currentKey]) {
      if (i === l) {
        child = parent[currentKey] = update(null, data);
        if (k in cache) cache[k] = child;
        return;

      } else {
        child = parent[currentKey] = {};
        if (k in cache) cache[k] = child;
      }

      
    } else {

      if (i === l) {
        child = parent[currentKey] = update === onUpdate
          ? update(parent[currentKey], data)
          : update(null, data);

        if (k in cache) cache[k] = child;
        return;
      } else {
        child = parent[currentKey] = update(parent[currentKey], data);
        if (k in cache) cache[k] = child;
      }
    }

    k += '.';
    parent = child;
  }
}

function onUpdate(previous, data) {
  return data && 'object' === typeof data
    ? deepMixin(previous || {}, data)
    : data;
}

function onSet(previous, data) {
  if (previous != null) {
    return previous && 'object' === typeof previous
      ? deepMixin({}, previous)
      : {};
  } else {
    return data && 'object' === typeof data
      ? deepMixin({}, data)
      : data;
  }
}

function Config(config) {
  const self = this;
  var cache = {};
  
  self.update = function update(key, data) {
    if ('object' === typeof key) {
      data = key;
      key = null;
    }
    
    if (key == null) {
      mergeConfig(self, data);
      cache = {};
    } else {
      setKey(self, key, data, cache, onUpdate);
    }
    return self;
  };

  self.set = function set(key, data) {
    if ('string' !== typeof key)
      throw new Error('config.set must be called with a key');

    setKey(self, key, data, cache, onSet);
    return self;
  };

  self.get = function get(k) {
    return (k in cache) ? cache[k] : (cache[k] = getKey(self, k));
  };

  mergeConfig(self, config);
}
