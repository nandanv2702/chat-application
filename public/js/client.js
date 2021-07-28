// Socket.io
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log("connected?")
})

//when a message is sent
socket.on('chat message', function(data) {
  console.log("chat messasge setn ")
  appendMessage(data, 'left');
  updateHeight();
});

//when a new user connects
socket.on('user-connected', function(name) {
  console.log("a user connected")
  userStat(name, 'joined');
  updateHeight();
});

//when a user disconnects
socket.on('user-disconnected', function(name) {
  console.log("a user disconnected")
  console.log('triggered')
  userStat(name, 'disconnected');
  updateHeight();
});

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

// stackoverflow connection error solution
socket.on('ping', function(data){
  socket.emit('pong', {beat: 1});
  console.log("ponging")
});

socket.on('error', function(data){
  
  console.log("error section")
});

socket.on('reconnect', function(data){
  
  console.log("reconnect section")
});

socket.on('reconnect_attempt', function(data){
  
  console.log("reconnect_attempt section")
});

socket.on('reconnect_attempt', function(data){
  
  console.log("reconnect_attempt section")
});

socket.on('reconnect_failed', function(data){
  
  console.log("reconnect_failed section")
});

socket.on('reconnect_failed', function(data){
  
  console.log("reconnect_failed section")
});

