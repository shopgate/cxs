'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rehydrate = exports.addPx = exports.hyphenate = exports.alphaHash = exports.cxs = exports.reset = exports.setOptions = exports.getCss = exports.sheet = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _sheet = require('glamor/lib/sheet');

var sheet = exports.sheet = new _sheet.StyleSheet();

sheet.inject();

var getCss = exports.getCss = function getCss() {
  var css = '';
  var rules = sheet.rules();
  for (var i = 0; i < rules.length; i++) {
    css += rules[i].cssText;
  }
  return css;
};

var count = 0;

var options = {
  prefix: ''
};

var setOptions = exports.setOptions = function setOptions(opts) {
  for (var key in opts) {
    options[key] = opts[key];
  }
};

var reset = exports.reset = function reset() {
  cxs.cache = {};
  sheet.flush();
  count = 0;
};

var cxs = exports.cxs = function cxs(obj) {
  return parse(obj);
};

cxs.cache = {};

var parse = function parse(obj, media) {
  var pseudo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  var className = '';

  for (var key in obj) {
    var value = obj[key];
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

    if (type === 'string' || type === 'number') {
      className += ' ' + createStyle(key, value, media, pseudo);
      continue;
    }

    if (key.charAt(0) === ':') {
      className += ' ' + parse(value, media, pseudo + key);
      continue;
    }

    if (key.charAt(0) === '@') {
      className += ' ' + parse(value, key, pseudo);
      continue;
    }

    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i++) {
        className += ' ' + createStyle(key, value[i], media, pseudo);
      }
      continue;
    }
  }

  return className.trim();
};

var createStyle = function createStyle(key, value, media) {
  var pseudo = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

  var id = key + value + (media || '') + pseudo;
  var dupe = cxs.cache[id];

  if (dupe) return dupe;

  var className = options.prefix + alphaHash(count);
  count++;
  var selector = '.' + className + pseudo;
  var prop = hyphenate(key);
  var val = addPx(key, value);

  var rule = selector + '{' + prop + ':' + val + '}';
  var css = media ? media + '{' + rule + '}' : rule;

  sheet.insert(css);
  cxs.cache[id] = className;

  return className;
};

var alphaHash = exports.alphaHash = function alphaHash(n) {
  if (alpha[n]) return alpha[n];

  var residual = Math.floor(n);
  var result = '';
  var length = alpha.length;

  while (residual !== 0) {
    var i = residual % length;
    result = alpha[i] + result;
    residual = Math.floor(residual / length);
  }

  return result;
};

var alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

var hyphenate = exports.hyphenate = function hyphenate(str) {
  return ('' + str).replace(/[A-Z]|^ms/g, '-$&').toLowerCase();
};

var addPx = exports.addPx = function addPx(prop, value) {
  if (typeof value !== 'number' || unitlessProps[prop]) return value;
  return value + 'px';
};

var rehydrate = exports.rehydrate = function rehydrate(css) {
  var dec = void 0;

  while (dec = RULE_REG.exec(css)) {
    var media = dec[2] || '';
    var className = dec[3];
    var pseudo = dec[4] || '';
    var key = camel(dec[5]);
    var val = removePx(dec[6]);
    var id = key + val + media + pseudo;

    cxs.cache[id] = className;
  }
};

var RULE_REG = /((@media[^{]+){)?.([^:{]+)(:[^{]+)?{([^:]+):([^}]+)}}?/g;

var camel = function camel(str) {
  return str.replace(/-[a-z]/g, function (g) {
    return g[1].toUpperCase();
  });
};

var removePx = function removePx(str) {
  return str.replace(/px$/, '');
};

var unitlessProps = {
  animationIterationCount: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridColumn: 1,
  fontWeight: 1,
  lineClamp: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  fillOpacity: 1,
  stopOpacity: 1,
  strokeDashoffset: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};

cxs.getCss = getCss;
cxs.reset = reset;
cxs.rehydrate = rehydrate;
cxs.setOptions = setOptions;

exports.default = cxs;