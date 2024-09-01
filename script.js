document.addEventListener('DOMContentLoaded', () => {
    const codeForm = document.getElementById('codeForm');
    const codeInput = document.getElementById('codeInput');
    const sharedCodeSection = document.getElementById('sharedCodeSection');
    const sharedCode = document.getElementById('sharedCode').querySelector('code');
    const copyButton = document.getElementById('copyButton');
    const clearButton = document.getElementById('clearButton');
    const themeToggle = document.getElementById('themeToggle');
    const homeTab = document.getElementById('homeTab');
    const aboutTab = document.getElementById('aboutTab');
    const homeSection = document.getElementById('homeSection');
    const aboutSection = document.getElementById('aboutSection');
    const sqlFilterButton = document.getElementById('sqlFilterButton');
    const sqlOutputSection = document.getElementById('sqlOutputSection');
    const sqlOutput = document.getElementById('sqlOutput').querySelector('code');

    const apiUrl = 'http://localhost:3000/api/shared-code'; // Update with your backend URL

    // Load code from backend
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.code) {
                sharedCode.textContent = data.code;
                sharedCodeSection.classList.remove('hidden');
                Prism.highlightAll();
            }
        })
        .catch(err => console.error('Error loading shared code:', err));

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        themeToggle.textContent = savedTheme === 'dark-mode' ? '🌞 Light Mode' : '🌙 Dark Mode';
    }

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeToggle.textContent = isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode';
        localStorage.setItem('theme', isDarkMode ? 'dark-mode' : '');
    });

    // Form submit functionality
    codeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = codeInput.value.trim();
        if (code) {
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
                .then(response => response.text())
                .then(() => {
                    sharedCode.textContent = code;
                    sharedCodeSection.classList.remove('hidden');
                    Prism.highlightAll();
                    codeInput.value = '';
                })
                .catch(err => console.error('Error sharing code:', err));
        }
    });

    // Copy code to clipboard
    copyButton.addEventListener('click', () => {
        const codeText = sharedCode.textContent;
        navigator.clipboard.writeText(codeText).then(() => {
            alert('Code copied to clipboard!');
        });
    });

    // Clear shared code and SQL queries
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all shared code and SQL queries?')) {
            fetch(apiUrl, { method: 'DELETE' })
                .then(response => response.text())
                .then(() => {
                    sharedCode.textContent = '';
                    sharedCodeSection.classList.add('hidden');
                    sqlOutput.textContent = '';
                    sqlOutputSection.classList.add('hidden');
                })
                .catch(err => console.error('Error clearing code:', err));
        }
    });

    // SQL filter functionality
    sqlFilterButton.addEventListener('click', () => {
        const code = codeInput.value.trim();
        let sqlQueries = '';
        
        code.split('\n').forEach(line => {
            if (line.startsWith('mysql>')) {
                if (sqlQueries) {
                    sqlQueries += '\n'; // Add a new line before adding new SQL query
                }
                sqlQueries += line.substring(6).trim(); // Append the SQL query without 'mysql>'
            }
        });

        sqlOutput.textContent = sqlQueries.trim();
        sqlOutputSection.classList.remove('hidden');
    });

    // Tab switching functionality
    homeTab.addEventListener('click', () => {
        homeSection.classList.remove('hidden');
        aboutSection.classList.add('hidden');
    });

    aboutTab.addEventListener('click', () => {
        homeSection.classList.add('hidden');
        aboutSection.classList.remove('hidden');
    });
});
