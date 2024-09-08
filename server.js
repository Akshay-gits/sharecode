const express = require('express');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const port = 3000;
const filePath = './sharedcode.txt';

// Create HTTP server
const server = http.createServer(app);
// Initialize Socket.io with the server
const io = socketIo(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory

// Helper function to read the shared code from the file
const readSharedCode = () => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        return ''; // Return empty string if file does not exist
    }
};

// API to get the shared code when page loads
app.get('/api/code', (req, res) => {
    const code = readSharedCode();
    res.json({ code });
});

// API to share code and notify all clients
app.post('/api/code', (req, res) => {
    const code = req.body.code;
    if (code) {
        fs.appendFileSync(filePath, code + '\n'); // Append new code to the file
        res.json({ message: 'Code shared successfully!' });

        // Notify all connected clients to update their shared code
        io.emit('newCode', { code });
    } else {
        res.status(400).json({ message: 'No code provided.' });
    }
});

// API to clear shared code and notify all clients
app.delete('/api/code', (req, res) => {
    fs.writeFileSync(filePath, ''); // Clear the file contents
    res.json({ message: 'Shared code cleared successfully.' });

    // Notify all connected clients to clear the shared code
    io.emit('clearCode');
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Send the current shared code to the new client
    const currentCode = readSharedCode();
    socket.emit('currentCode', { code: currentCode });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start server with Socket.io support
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
