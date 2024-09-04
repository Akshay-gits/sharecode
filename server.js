const express = require('express');
const app = express();
const port = 3000;

let sharedCode = ''; // In-memory storage for shared code

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory

app.delete('/api/code', (req, res) => {
    sharedCode = ''; // Clear the shared code
    res.status(200).send({ message: 'Shared code cleared successfully.' });
});

// API to get the shared code
app.get('/api/code', (req, res) => {
    res.json({ code: sharedCode });
});

// API to share code
app.post('/api/code', (req, res) => {
    sharedCode = req.body.code;
    res.json({ message: 'Code shared successfully!' });
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
