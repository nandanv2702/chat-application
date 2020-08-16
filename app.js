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

const users = {}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
    console.log('user disconnected');
  });

  socket.on('connect', () => {
    io.emit('connection-msg', msg)
  });

  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', {msg: msg, name: users[socket.id]});
    console.log('message: ' + msg);
  });

  socket.on('new-user', (name) => {
    users[socket.id] = name;
    console.log(`Users are: ${users}`);
    socket.broadcast.emit('user-connected', name);
  })
});

// this is one instance of 'app' which is why app.listen() would cause a EADDRINUSE error
http.listen(port, () => {
  console.log('listening on *:3000');
});
