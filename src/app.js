const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
// const session = require('express-session');

app.use(bodyParser.json());                     // req body(파라메터) 파싱
app.use('/public', express.static('./public')); // ./public 루트 허용(static)

app.use(cors()); // cors 모두 허용

module.exports = app;
