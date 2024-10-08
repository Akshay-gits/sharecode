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

    // Initialize socket connection
    const socket = io();

    // Load shared code from server on initial load
    fetch('/api/code')
        .then(response => response.json())
        .then(data => {
            if (data.code) {
                sharedCode.textContent = data.code;
                sharedCodeSection.classList.remove('hidden');
                Prism.highlightAll();
            }
        });

    // Real-time updates: Listen for new code from other users
    socket.on('newCode', (data) => {
        sharedCode.textContent += (sharedCode.textContent ? '\n' : '') + data.code;
        sharedCodeSection.classList.remove('hidden');
        Prism.highlightAll();
    });

    // Real-time updates: Listen for clear command from other users
    socket.on('clearCode', () => {
        sharedCode.textContent = '';
        sharedCodeSection.classList.add('hidden');
    });

    // Real-time updates: Get the current code when connected
    socket.on('currentCode', (data) => {
        if (data.code) {
            sharedCode.textContent = data.code;
            sharedCodeSection.classList.remove('hidden');
            Prism.highlightAll();
        }
    });

    // Form submit functionality to share code
    codeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = codeInput.value.trim();
        if (code) {
            fetch('/api/code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code }),
            })
            .then(response => response.json())
            .then(data => {
                // Code is shared through Socket.io, so no need to append manually here
                codeInput.value = ''; // Clear the input field
            });
        }
    });

    // SQL filter functionality
    sqlFilterButton.addEventListener('click', () => {
        const code = codeInput.value.trim();
        fetch('/api/sql-filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code }),
        })
        .then(response => response.json())
        .then(data => {
            sqlOutput.textContent = data.sqlQueries;
            sqlOutputSection.classList.remove('hidden');
            Prism.highlightAll();
        });
    });

    // Copy to clipboard functionality
    copyButton.addEventListener('click', () => {
        if (sharedCode.textContent) {
            navigator.clipboard.writeText(sharedCode.textContent)
                .then(() => alert('Code copied to clipboard!'))
                .catch(err => console.error('Failed to copy text: ', err));
        }
    });

    // Clear code functionality
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all shared code?')) {
            fetch('/api/code', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(() => {
                // Clear content on frontend
                sharedCode.textContent = '';
                sharedCodeSection.classList.add('hidden');
            })
            .catch(err => console.error('Failed to clear code on backend: ', err));
        }
    });

    // Real-time updates: Notify all clients when code is cleared
    clearButton.addEventListener('click', () => {
        socket.emit('clearCode'); // Inform all clients to clear the shared code
    });

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDarkMode = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('theme', isDarkMode ? 'dark-theme' : '');
});

// Load theme from localStorage
const storedTheme = localStorage.getItem('theme');
if (storedTheme) {
    document.body.classList.add(storedTheme);
    themeToggle.textContent = storedTheme === 'dark-theme' ? '🌞 Light Mode' : '🌙 Dark Mode';
}

    // Tab switching functionality
    homeTab.addEventListener('click', () => {
        homeSection.classList.remove('hidden');
        aboutSection.classList.add('hidden');
        homeTab.classList.add('active');
        aboutTab.classList.remove('active');
    });

    aboutTab.addEventListener('click', () => {
        aboutSection.classList.remove('hidden');
        homeSection.classList.add('hidden');
        aboutTab.classList.add('active');
        homeTab.classList.remove('active');
    });
});
