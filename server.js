const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Create HTTP server
const server = http.createServer(app);
// Initialize Socket.io with the server
const io = socketIo(server);

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql881',
    database: 'shared_content_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + db.threadId);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory

// API to get the shared code when page loads
app.get('/api/code', (req, res) => {
    const query = 'SELECT code FROM shared_code ORDER BY timestamp DESC LIMIT 1';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        const code = results.length > 0 ? results[0].code : '';
        res.json({ code });
    });
});

// API to share code and notify all clients
app.post('/api/code', (req, res) => {
    const code = req.body.code;
    if (code) {
        const query = 'INSERT INTO shared_code (code) VALUES (?)';
        db.query(query, [code], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Code shared successfully!' });

            // Notify all connected clients to update their shared code
            io.emit('newCode', { code });
        });
    } else {
        res.status(400).json({ message: 'No code provided.' });
    }
});

// API to clear shared code and notify all clients
app.delete('/api/code', (req, res) => {
    const query = 'DELETE FROM shared_code';
    db.query(query, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Shared code cleared successfully.' });

        // Notify all connected clients to clear the shared code
        io.emit('clearCode');
    });
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Send the current shared code to the new client
    const query = 'SELECT code FROM shared_code ORDER BY timestamp DESC LIMIT 1';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return;
        }
        const code = results.length > 0 ? results[0].code : '';
        socket.emit('currentCode', { code });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start server with Socket.io support
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
