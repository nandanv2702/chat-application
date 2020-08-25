// Socket.io
const socket = io(`ws://localhost:3000`);

socket.on('connect', () => {
  console.log("connected?")
})

//when a message is sent
socket.on('chat message', function(data) {
  appendMessage(data, 'left');
  updateHeight();
});

//when a new user connects
socket.on('user-connected', function(name) {
  userStat(name, 'joined');
  updateHeight();
});

//when a user disconnects
socket.on('user-disconnected', function(name) {
  console.log('triggered')
  userStat(name, 'disconnected');
  updateHeight();
});
