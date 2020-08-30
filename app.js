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

// for each user
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});


// for each message sent, will be appended to each room/personal chat
const messageSchema = new mongoose.Schema({
  user: String,
  message_body: String,
  created: {type: Date, default: Date.now}
})

// for each chat instance (room or personal) - users can be limited to two for personal chats
const roomSchema = new mongoose.Schema({
  name: {type: String, unique: true, lowercase: true},
  users: [],
  messages: []
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

const Message = new mongoose.model('Message', messageSchema);

const Chat = new mongoose.model('Chat', roomSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('index', {
      name: req.user.name,
      rooms: rooms
    });
  } else {
    res.redirect('/login');
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
  .get(function(req, res) {
    res.render('login');
  })
  .post(function(req, res) {
    const user = new User({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, function(err) {
      if (err) {
        console.log(`error during login: ${err}`);
        res.redirect('/')
      } else {
        passport.authenticate('local')(req, res, function() {
          res.redirect('/');
        });
      }
    });
  });

const rooms = {
  Name: [],
  Other: []
};

app.route('/rooms')
  .post(function(req, res) {
    if (req.isAuthenticated()) {
      if (rooms[req.body.room] !== null) {
        res.redirect('/')
      };
      rooms[req.body.room] = {
        users: {}
      };
      res.redirect(req.body.room);
    } else {
      res.redirect('/login')
    }
  });

app.get('/rooms/:room', function(req, res) {
  if (req.isAuthenticated() && Object.keys(rooms) !== null) {
    res.render('room', {
      name: req.user.name,
      roomName: decodeURI(req.params.room)
    });
  } else {
    res.redirect('/')
  };
});

app.get('/logout', function(req, res) {
  // destroys the session and ensures a safe logout
  req.session.destroy(function(err) {
    if (!err) {
      res.redirect('/');
    };
  });
});

app.post('/newroom', function(req, res) {
  var newRoomName = req.body.newroom.replace(/\s\s+/g, ' ')
  rooms[newRoomName] = [];
  res.redirect(`/rooms/${newRoomName}`);
});

const users = {};

io.on('connection', (socket) => {

  socket.on('disconnecting', () => {
    const rooms = Object.keys(socket.rooms);
    socket.to(rooms[1]).emit('user-disconnected', users[socket.id])
    console.log(`rooms are: ${JSON.stringify(rooms)}`);
    // the rooms array contains at least the socket ID
  });

  socket.on('disconnect', () => {
    socket.rooms === {};
    delete users[socket.id];
    console.log('user disconnected');
  });

  socket.on('chat message', (msg, roomName) => {
    socket.to(roomName).broadcast.emit('chat message', {
      msg: msg,
      name: users[socket.id]
    });
    console.log('message: ' + msg);
  });

  socket.on('new-user', (name, roomName) => {
    console.log("room name is: " + roomName);
    console.log("new user name is: " + name);
    users[socket.id] = name;
    socket.join(roomName);
    rooms[decodeURI(roomName)].push(users[socket.id]);
    console.log(`Users are: ${JSON.stringify(users)}`);
    socket.to(roomName).emit('user-connected', name);
  })
});


// this is one instance of 'app' which is why app.listen() would cause a EADDRINUSE error
http.listen(port, () => {
  console.log('listening on *:3000');
});
