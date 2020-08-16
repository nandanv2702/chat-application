const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get('/', (req, res) => {
  res.render('index');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('connect', () => {
    io.emit('connection-msg', msg)
  });

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });

  socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
});

// this is one instance of 'app' which is why app.listen() would cause a EADDRINUSE error
http.listen(port, () => {
  console.log('listening on *:3000');
});
