require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// Setting up authentication
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/chatDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('index', {name: req.user.name, rooms: rooms});
  } else {
    res.redirect('/register');
  };
});

app.route('/register')
  .get(function(req, res) {
    res.render('register');
  })
  .post(function(req, res) {
    User.register({
      name: req.body.name,
      username: req.body.username
    }, req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        console.log('error during registration');
        res.redirect('/register');
      } else {
        passport.authenticate('local')(req, res, function() {
          res.redirect('/');
        });
      };
    });
  });

app.route('/login')
  .get(function(req,res){
    res.render('login');
  })
  .post(function(req, res) {
    const user = new User({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, function(err){
      if(err){
        console.log(`error during login: ${err}`);
        res.redirect('/')
      } else {
        passport.authenticate('local')(req, res, function() {
          res.redirect('/');
        });
      }
    });
  });

const rooms = {Name: {}, More: {}};

app.route('/rooms')
.post(function(req, res){
  if(rooms[req.body.room] !== null){
    res.redirect('/')
  }
  rooms[req.body.room] = {users: {}};
  res.redirect(req.body.room);
});

app.get('/rooms/:room', function(req, res){
  res.render('room', {roomName: req.params.room});
});

const users = {};

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
    console.log('user disconnected');
  });

  socket.on('connect', (req) => {
    io.emit('connection-msg', msg)
  });

  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', {msg: msg, name: users[socket.id]});
    console.log('message: ' + msg);
  });

  socket.on('new-user', (name) => {
    console.log("new user name is: " + name);
    users[socket.id] = name;
    console.log(`Users are: ${users}`);
    socket.broadcast.emit('user-connected', name);
  })
});

// this is one instance of 'app' which is why app.listen() would cause a EADDRINUSE error
http.listen(port, () => {
  console.log('listening on *:3000');
});
