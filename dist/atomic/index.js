'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addPx = exports.hyphenate = exports.combine = exports.clean = exports.reset = exports.setOptions = exports.getCss = exports.sheet = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _sheet = require('glamor/lib/sheet');

var _hash = require('../hash');

var _hash2 = _interopRequireDefault(_hash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
};

var cxs = function cxs(style) {
  var classNames = parse(style);
  return classNames.join(' ');
};

var parse = function parse(obj, media) {
  var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  var classNames = [];

  var _loop = function _loop(key) {
    var value = obj[key];
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

    if (type === 'string' || type === 'number') {
      classNames.push(createStyle(key, value, media, children));
      return 'continue';
    }

    if (Array.isArray(value)) {
      value.forEach(function (val) {
        classNames.push(createStyle(key, val, media, children));
      });
      return 'continue';
    }

    if (/^:/.test(key)) {
      parse(value, media, children + key).forEach(function (className) {
        classNames.push(className);
      });
      return 'continue';
    }

    if (/^@media/.test(key)) {
      parse(value, key, children).forEach(function (className) {
        classNames.push(className);
      });
      return 'continue';
    }

    parse(value, media, children + ' ' + key).forEach(function (className) {
      classNames.push(className);
    });
    return 'continue';
  };

  for (var key in obj) {
    var _ret = _loop(key);

    if (_ret === 'continue') continue;
  }

  return classNames;
};

var createStyle = function createStyle(key, value, media) {
  var children = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

  var prefix = (media || '') + children;
  var id = key + value + prefix;
  var dupe = cxs.cache[id];

  if (dupe) return dupe;

  var prop = hyphenate(key);
  var val = addPx(key, value);
  var className = createClassName(prop, value, prefix);
  var selector = '.' + className + children;
  var rule = selector + '{' + prop + ':' + val + '}';
  var css = media ? media + '{' + rule + '}' : rule;

  sheet.insert(css);
  cxs.cache[id] = className;

  return className;
};

var abbr = function abbr(str) {
  return str.split('-').map(function (c) {
    return c.charAt(0);
  }).join('');
};

var createClassName = function createClassName(prop, value, prefix) {
  var base = (shorthands.indexOf(prop) > -1 ? abbr(prop) : prop).replace(/^-/, '');
  var parts = combine('-')(options.prefix ? options.prefix : null, prefix ? clean(prefix) : null, base, clean(value));

  var className = parts.length < 24 ? parts : (0, _hash2.default)(parts);
  return className;
};

var BLANK_REG = /[\(\)#]/g;
var P_REG = /%/g;
var SYMBOL_REG = /[&,:"\s]/g;
var AT_REG = /@/g;
var DOT_REG = /\./g;
var EXCL_REG = /!/g;

var clean = exports.clean = function clean(str) {
  return ('' + str).replace(BLANK_REG, '').replace(P_REG, 'P').replace(SYMBOL_REG, '_').replace(AT_REG, '_').replace(DOT_REG, 'p').replace(EXCL_REG, '_');
};

var combine = exports.combine = function combine() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return args.filter(function (a) {
      return a !== null;
    }).join(str);
  };
};

var hyphenate = exports.hyphenate = function hyphenate(str) {
  return ('' + str).replace(/[A-Z]|^ms/g, '-$&').toLowerCase();
};

var addPx = exports.addPx = function addPx(prop, value) {
  if (typeof value !== 'number') return value;
  if (unitlessProps.indexOf(prop) > -1) return value;
  return value + 'px';
};

var shorthands = ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'display', 'float', 'font-family', 'font-weight', 'font-size', 'line-height', 'width', 'height', 'color', 'background', 'background-color', 'background-image'];

var unitlessProps = ['animationIterationCount', 'boxFlex', 'boxFlexGroup', 'boxOrdinalGroup', 'columnCount', 'flex', 'flexGrow', 'flexPositive', 'flexShrink', 'flexNegative', 'flexOrder', 'gridRow', 'gridColumn', 'fontWeight', 'lineClamp', 'lineHeight', 'opacity', 'order', 'orphans', 'tabSize', 'widows', 'zIndex', 'zoom', 'fillOpacity', 'stopOpacity', 'strokeDashoffset', 'strokeOpacity', 'strokeWidth'];

cxs.cache = {};
cxs.reset = reset;
cxs.getCss = getCss;
cxs.setOptions = setOptions;

exports.default = cxs;