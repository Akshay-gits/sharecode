const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const FILE_PATH = './sharedCode.txt';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get shared code
app.get('/api/shared-code', (req, res) => {
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading shared code');
        }
        res.send({ code: data });
    });
});

// API endpoint to set shared code
app.post('/api/shared-code', (req, res) => {
    const { code } = req.body;
    fs.writeFile(FILE_PATH, code, 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Error saving shared code');
        }
        res.send('Shared code updated');
    });
});

// API endpoint to clear shared code
app.delete('/api/shared-code', (req, res) => {
    fs.writeFile(FILE_PATH, '', 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Error clearing shared code');
        }
        res.send('Shared code cleared');
    });
});

// Serve index.html on the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
