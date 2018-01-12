'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _twit = require('twit');

var _twit2 = _interopRequireDefault(_twit);

var _babelPolyfill = require('babel-polyfill');

var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } // const express = require('express');
// const path = require('path');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const dotenv = require('dotenv').config();

_dotenv2.default.config();


var app = (0, _express2.default)();

app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));

var sf_woeid = 2487956;

var T = new _twit2.default({
  consumer_key: process.env.C_KEY,
  consumer_secret: process.env.C_SECRET,
  access_token: process.env.M_KEY,
  access_token_secret: process.env.M_SECRET
});

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();

if (dd < 10) {
  dd = '0' + dd;
}

if (mm < 10) {
  mm = '0' + mm;
}

today = yyyy + '-' + mm + '-' + dd;

// sort by tweet_volume

var getTrendsByPlace = function getTrendsByPlace(woeid) {
  return new Promise(function (res) {
    T.get('trends/place', { id: sf_woeid }, function (err, data, res) {
      var sortedData = data[0].trends.sort(function (a, b) {
        return b.tweet_volume - a.tweet_volume;
      });
      res(sortedData);
    });
  });
};

var testing = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var test, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, ele;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getTrendsByPlace(sf_woeid);

          case 2:
            test = _context.sent;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 6;

            for (_iterator = test[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              ele = _step.value;

              console.log(ele);
            }
            _context.next = 14;
            break;

          case 10:
            _context.prev = 10;
            _context.t0 = _context['catch'](6);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 14:
            _context.prev = 14;
            _context.prev = 15;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 17:
            _context.prev = 17;

            if (!_didIteratorError) {
              _context.next = 20;
              break;
            }

            throw _iteratorError;

          case 20:
            return _context.finish(17);

          case 21:
            return _context.finish(14);

          case 22:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[6, 10, 14, 22], [15,, 17, 21]]);
  }));

  return function testing() {
    return _ref.apply(this, arguments);
  };
}();

testing();

// T.get('search/tweets', { q: `tech since:${today}`, count: 5 }, function (err, data, response) {
//   console.log(data)
// })


// T.get('users/suggestions/:slug', { slug: 'twitter'}, (err, data, res) => {
//   console.log(data);
// });

var PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  return console.log('Listening on port: ' + PORT);
});
//# sourceMappingURL=index.js.map