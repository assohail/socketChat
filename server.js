const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from the current directory

// In-memory store for chat messages
const messages = [];

// Socket.io connection
io.on('connection', (socket) => {
  console.log('a user connected');

  // Send the chat history to the connected client
  socket.emit('chat history', messages);

  // Listen for chat messages
  socket.on('chat message', (msg) => {
    // Save the message
    messages.push(msg);
    console.log('msgs........................................',messages)
    // Broadcast the message to all connected clients
    io.emit('chat message', msg);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// API endpoint to send a message
app.post('/api/messages', (req, res) => {
  const msg = req.body.message;
  if (msg) {
    // Save the message
    messages.push(msg);
    // Broadcast the message to all connected clients
    io.emit('chat message', msg);
    res.status(200).send({ success: true, message: 'Message sent' });
  } else {
    res.status(400).send({ success: false, message: 'Message is required' });
  }
});

// API endpoint to get chat history
app.get('/api/messages', (req, res) => {
  res.status(200).send({ success: true, messages });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
