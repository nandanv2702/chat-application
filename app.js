const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const socket = require('socket.io');

const port = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.listen(port, () => {
  console.log('Listening!')
});

app.get('/', (req, res) => {
  res.render('index');
});
