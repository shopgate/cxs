'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addPx = exports.hyphenate = exports.reset = exports.getCss = exports.sheet = exports.setOptions = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _sheet = require('glamor/lib/sheet');

var _hash = require('../hash');

var _hash2 = _interopRequireDefault(_hash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var options = {};

var setOptions = exports.setOptions = function setOptions(opts) {
  for (var key in opts) {
    options[key] = opts[key];
  }
};

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

var reset = exports.reset = function reset() {
  cxs.cache = {};
  sheet.flush();
};

var cxs = function cxs(a, b) {
  var selector = void 0;
  if (typeof a === 'string') {
    selector = a;
  }
  var style = selector ? b : a;

  var className = (0, _hash2.default)(JSON.stringify(style), options.prefix);

  selector = selector || '.' + className;

  if (cxs.cache[selector]) return className;

  var rules = parse(selector, style);

  rules.forEach(function (rule) {
    return sheet.insert(rule);
  });

  cxs.cache[selector] = className;

  return className;
};

var parse = function parse(selector, styles, media) {
  var decs = [];
  var rules = [];

  var _loop = function _loop(key) {
    var value = styles[key];
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

    if (type === 'number' || type === 'string') {
      decs.push(createDec(key, value));
      return 'continue';
    } else if (Array.isArray(value)) {
      value.forEach(function (val) {
        decs.push(createDec(key, val));
      });
      return 'continue';
    } else if (/^:/.test(key)) {
      parse(selector + key, value, media).forEach(function (r) {
        return rules.push(r);
      });
      return 'continue';
    } else if (/^@keyframes/.test(key)) {
      rules.push(parseAnimation(key, value));
      return 'continue';
    } else if (/^@media/.test(key)) {
      parse(selector, value, key).forEach(function (r) {
        return rules.push(r);
      });
      return 'continue';
    } else {
      parse(selector + ' ' + key, value, media).forEach(function (r) {
        return rules.push(r);
      });
      return 'continue';
    }
  };

  for (var key in styles) {
    var _ret = _loop(key);

    if (_ret === 'continue') continue;
  }

  if (selector) {
    rules.unshift(createRule(selector, decs, media));
  }

  return rules;
};

var parseAnimation = function parseAnimation(selector, animation) {
  var animationStyles = Object.keys(animation).map(function (stageKey) {
    return createAnimationRule(stageKey, Object.keys(animation[stageKey]).map(function (styleKey) {
      return createDec(styleKey, animation[stageKey][styleKey]);
    }));
  });
  return createAnimationRule(selector, animationStyles);
};

var createAnimationRule = function createAnimationRule(selector, decs) {
  return selector + '{' + decs.join(' ') + '}';
};

var createDec = function createDec(key, value) {
  var prop = hyphenate(key);
  var val = addPx(key, value);
  return prop + ':' + val;
};

var createRule = function createRule(selector, decs, media) {
  var rule = selector + '{' + decs.join(';') + '}';
  var css = media ? media + '{' + rule + '}' : rule;
  return css;
};

var hyphenate = exports.hyphenate = function hyphenate(str) {
  return ('' + str).replace(/[A-Z]|^ms/g, '-$&').toLowerCase();
};

var addPx = exports.addPx = function addPx(prop, value) {
  if (typeof value !== 'number') return value;
  if (unitlessProps.indexOf(prop) > -1) return value;
  return value + 'px';
};

var unitlessProps = ['animationIterationCount', 'boxFlex', 'boxFlexGroup', 'boxOrdinalGroup', 'columnCount', 'flex', 'flexGrow', 'flexPositive', 'flexShrink', 'flexNegative', 'flexOrder', 'gridRow', 'gridColumn', 'fontWeight', 'lineClamp', 'lineHeight', 'opacity', 'order', 'orphans', 'tabSize', 'widows', 'zIndex', 'zoom', 'fillOpacity', 'stopOpacity', 'strokeDashoffset', 'strokeOpacity', 'strokeWidth'];

cxs.cache = {};
cxs.reset = reset;
cxs.getCss = getCss;
cxs.setOptions = setOptions;

exports.default = cxs;