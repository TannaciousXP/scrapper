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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config(); // const express = require('express');
// const path = require('path');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const dotenv = require('dotenv').config();

var app = (0, _express2.default)();

app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));

console.log('.env: TEST:' + process.env.TEST);

var PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  return console.log('Listening on port: ' + PORT);
});
//# sourceMappingURL=index.js.map