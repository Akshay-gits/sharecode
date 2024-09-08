const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;
const filePath = './sharedcode.txt';

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

// API to get the shared code
app.get('/api/code', (req, res) => {
    const code = readSharedCode();
    res.json({ code });
});

// API to share code
app.post('/api/code', (req, res) => {
    const code = req.body.code;
    if (code) {
        fs.appendFileSync(filePath, code + '\n'); // Append new code to the file
        res.json({ message: 'Code shared successfully!' });
    } else {
        res.status(400).json({ message: 'No code provided.' });
    }
});

// API to clear shared code
app.delete('/api/code', (req, res) => {
    fs.writeFileSync(filePath, ''); // Clear the file contents
    res.json({ message: 'Shared code cleared successfully.' });
});

// API to filter SQL queries
app.post('/api/sql-filter', (req, res) => {
    const code = req.body.code || '';
    let sqlQueries = '';

    code.split('\n').forEach(line => {
        if (line.startsWith('mysql>')) {
            if (sqlQueries) {
                sqlQueries += '\n\n'; // Add a new line before adding new SQL query
            }
            sqlQueries += line.substring(6).trim(); // Append the SQL query without 'mysql>'
        }
    });

    res.json({ sqlQueries: sqlQueries.trim() });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
