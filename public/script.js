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

    // Load shared code from server
    fetch('/api/code')
        .then(response => response.json())
        .then(data => {
            if (data.code) {
                sharedCode.textContent = data.code;
                sharedCodeSection.classList.remove('hidden');
                Prism.highlightAll();
            }
        });

    // Load theme from localStorage
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeToggle.textContent = isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode';
        localStorage.setItem('theme', isDarkMode ? 'dark-mode' : '');
    });

    // Form submit functionality (updated)
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
                // Append the new code to the existing content
                sharedCode.textContent += (sharedCode.textContent ? '\n' : '') + code;
                sharedCodeSection.classList.remove('hidden');
                Prism.highlightAll();
                codeInput.value = '';
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

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDarkMode = document.body.classList.contains('dark-theme');
        themeToggle.textContent = isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode';
        localStorage.setItem('theme', isDarkMode ? 'dark-theme' : '');
    });

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
