const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// File path for storing the shared code
const filePath = path.join(__dirname, 'sharedcode.txt');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory

// Utility function to read shared code from file
function readSharedCode() {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    resolve(''); // File doesn't exist, resolve with an empty string
                } else {
                    reject(err);
                }
            } else {
                resolve(data);
            }
        });
    });
}

// Utility function to write shared code to file
function writeSharedCode(code) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, code, 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// API to clear the shared code
app.delete('/api/code', async (req, res) => {
    try {
        await writeSharedCode(''); // Clear the content of the file
        res.status(200).send({ message: 'Shared code cleared successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Failed to clear shared code.' });
    }
});

// API to get the shared code
app.get('/api/code', async (req, res) => {
    try {
        const code = await readSharedCode();
        res.json({ code: code });
    } catch (err) {
        res.status(500).send({ error: 'Failed to load shared code.' });
    }
});

// API to share code
app.post('/api/code', async (req, res) => {
    try {
        const newCode = req.body.code.trim();
        if (newCode) {
            const currentCode = await readSharedCode();
            const updatedCode = currentCode ? currentCode + '\n' + newCode : newCode;
            await writeSharedCode(updatedCode);
            res.json({ message: 'Code shared successfully!' });
        } else {
            res.status(400).send({ error: 'No code provided.' });
        }
    } catch (err) {
        res.status(500).send({ error: 'Failed to save code.' });
    }
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
