// Socket.io
const socket = io();

socket.on('connect', () => {
  console.log('connected?');
});

// when a message is sent
socket.on('chat message', (data) => {
  console.log('chat messasge setn ');
  appendMessage(data, 'left');
  updateHeight();
});

// when a new user connects
socket.on('user-connected', (name) => {
  console.log('a user connected');
  userStat(name, 'joined');
  updateHeight();
});

// when a user disconnects
socket.on('user-disconnected', (name) => {
  console.log('a user disconnected');
  console.log('triggered');
  userStat(name, 'disconnected');
  updateHeight();
});

socket.on('connect_error', (err) => {
  console.log(`connect_error due to ${err.message}`);
});

// stackoverflow connection error solution
socket.on('ping', (data) => {
  socket.emit('pong', { beat: 1 });
  console.log('ponging');
});

socket.on('error', (data) => {
  console.log('error section');
});

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
