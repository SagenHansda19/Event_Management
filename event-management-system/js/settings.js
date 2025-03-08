// Load saved settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    document.getElementById('theme').value = settings.theme || 'light';
    document.getElementById('notifications').checked = settings.notifications || false;
}

// Save settings
document.getElementById('settings-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const settings = {
        theme: document.getElementById('theme').value,
        notifications: document.getElementById('notifications').checked
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
    applyTheme(settings.theme);
    alert('Settings saved successfully!');
});

// Apply theme
function applyTheme(theme) {
    document.body.className = theme;
}

// Export data
document.getElementById('export-data').addEventListener('click', function() {
    const data = {
        events: JSON.parse(localStorage.getItem('events')),
        volunteers: JSON.parse(localStorage.getItem('volunteers')),
        settings: JSON.parse(localStorage.getItem('settings'))
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event-management-data.json';
    a.click();
});

// Import data
document.getElementById('import-data').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = function() {
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = function() {
            const data = JSON.parse(reader.result);
            localStorage.setItem('events', JSON.stringify(data.events));
            localStorage.setItem('volunteers', JSON.stringify(data.volunteers));
            localStorage.setItem('settings', JSON.stringify(data.settings));
            loadSettings();
            alert('Data imported successfully!');
        };
        
        reader.readAsText(file);
    };
    
    input.click();
});

// Reset data
document.getElementById('reset-data').addEventListener('click', function() {
    if (confirm('Are you sure you want to reset all data?')) {
        localStorage.clear();
        alert('All data has been reset.');
        loadSettings();
    }
});

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    applyTheme(settings.theme || 'light');
});
