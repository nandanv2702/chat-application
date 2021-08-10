require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();
const http = require('http').createServer(app);

// const options = {'pingTimeout': 5000, 'pingInterval': 800};
const io = require('socket.io')(http);

const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const port = process.env.PORT || 3000;

app.use(express.static(`${__dirname}/public`));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true,
}));

// Setting up authentication
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

try {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
} catch (err) {
  console.log(`database error: ${err}`);
}

// for each user - does this interfere with passport-local-mongoose's user.register(...) function?
const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
});

// for each message sent, will be appended to each room/personal chat
const messageSchema = new mongoose.Schema({
  user: String,
  message_body: String,
  created: { type: Date, default: Date.now },
});

// for each chat instance (room or personal) - users can be limited to two for personal chats
const roomSchema = new mongoose.Schema({
  name: { type: String, unique: true, lowercase: true },
  users: [],
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

const Message = new mongoose.model('Message', messageSchema);

const Room = new mongoose.model('Room', roomSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Finds rooms and assigns it to 'rooms' to be rendered
const rooms = {};

function getRooms() {
  Room.find({}, (err, result) => {
    const roomNames = [];
    // eslint-disable-next-line array-callback-return
    result.map((room) => {
      if (!Object.keys(rooms).includes(room)) {
        rooms[room.name] = [];
        roomNames.push(room.name);
      }
    });

    // eslint-disable-next-line array-callback-return
    Object.keys(rooms).map((room) => {
      if (!roomNames.includes(room)) {
        delete rooms[room];
      }
    });
  });
}

getRooms();

app.get('/', (req, res) => {
  getRooms();
  if (req.isAuthenticated()) {
    res.render('index', {
      name: req.user.name,
      rooms,
    });
  } else {
    res.redirect('/login');
  }
});

app.route('/register')
  .get((req, res) => {
    res.render('register');
  })
  .post((req, res) => {
    console.log(req.body);

    const user = {
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
    };

    User.register(new User(user), req.body.password, (err, user) => {
      if (err) {
        console.log(err);
        console.log('error during registration');
        res.redirect('/register');
      } else {
        console.log(`user was authenticated ${user}`);
        passport.authenticate('local')(req, res, () => {
          res.redirect('/');
        });
      }
    });
  });

app.route('/login')
  .get((req, res) => {
    res.render('login');
    console.log('rendering login');
  })
  .post((req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    req.login(user, (err) => {
      if (err) {
        console.log(`error during login: ${err}`);
        res.redirect('/');
      } else {
        passport.authenticate('local')(req, res, () => {
          console.log('in the authenticate section for login');
          res.redirect('/');
        });
      }
    });
  });

app.route('/rooms')
  .post((req, res) => {
    if (req.isAuthenticated()) {
      if (rooms[req.body.room] !== null) {
        res.redirect('/');
      }
      rooms[req.body.room] = {
        users: {},
      };
      res.redirect(req.body.room);
    } else {
      res.redirect('/login');
    }
  });

app.get('/rooms/:room', (req, res) => {
  if (req.isAuthenticated() && Object.keys(rooms).indexOf(decodeURI(req.params.room)) !== -1) {
    const roomName = decodeURI(req.params.room);

    rooms[roomName].push(req.user.username);
    console.log(`user is in room ${decodeURI(req.params.room)}`);

    console.log(`users are ${rooms[roomName]}`);

    Room.updateOne({ name: roomName }, {
      name: roomName.toLowerCase(),
      users: rooms[roomName],
    }, (err, result) => console.log(result))
      .then(() => {
        res.render('room', {
          name: req.user.name,
          roomName,
        });
      });
  } else {
    res.redirect('/#rooms');
  }
});

app.get('/logout', (req, res) => {
  // destroys the session and ensures a safe logout
  req.session.destroy((err) => {
    if (!err) {
      res.redirect('/');
    }
  });
});

app.post('/newroom', (req, res) => {
  const newRoomName = req.body.newroom.replace(/\s\s+/g, ' ');

  Room.create({ name: newRoomName, users: [] }, (err) => {
    if (err) console.log(err);
    rooms[newRoomName] = [];
    res.redirect(`/rooms/${newRoomName}`);
  });
});

const users = {};

io.on('connection', (socket) => {
  socket.on('disconnecting', () => {
    const rooms = Object.keys(socket.rooms);
    socket.to(rooms[1]).emit('user-disconnected', users[socket.id]);
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
      msg,
      name: users[socket.id],
    });
    console.log(`message: ${msg}`);
  });

  socket.on('new-user', (name, roomName) => {
    console.log(`room name is: ${roomName}`);
    console.log(`new user name is: ${name}`);
    users[socket.id] = name;
    socket.join(roomName);
    rooms[decodeURI(roomName)].push(users[socket.id]);
    console.log(`Users are: ${JSON.stringify(users)}`);

    Room.findOneAndUpdate({ room: roomName }, { users: rooms[decodeURI(roomName)] });
    socket.to(roomName).emit('user-connected', name);
  });

  // trying to resolve timeout error - socket randomly disconnects client
  socket.on('connect_error', (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  // socket.on('error', function(data){

  //   console.log("error section")
  // });

  socket.on('reconnect', (data) => {
    console.log('reconnect section');
  });

  socket.on('reconnect_attempt', (data) => {
    console.log('reconnect_attempt section');
  });

  socket.on('reconnect_attempt', (data) => {
    console.log('reconnect_attempt section');
  });

  socket.on('reconnect_failed', (data) => {
    console.log('reconnect_failed section');
  });

  socket.on('reconnect_failed', (data) => {
    console.log('reconnect_failed section');
  });

  // stackoverflow connection error solution - resolves timeout by manually pinging
  // function sendHeartbeat(){
  //   setTimeout(sendHeartbeat, 20000);
  //   io.sockets.emit('ping', { beat : 1 });
  // }

  socket.on('pong', (data) => {
    console.log('Pong received from client');
  });

  // setTimeout(sendHeartbeat, 20000);
});

// this is one instance of 'app' which is why app.listen() would cause a EADDRINUSE error
http.listen(port, () => {
  console.log('listening on *:3000');
});
