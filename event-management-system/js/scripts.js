// scripts.js - For index.html only

// scripts.js - Only for index.html
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load public events
    fetch('http://localhost/event-management-php/api/events.php?limit=3')
        .then(response => response.json())
        .then(events => {
            const container = document.getElementById('public-events');
            if (container) {
                container.innerHTML = events.map(event => `
                    <div class="event-card">
                        <h3>${event.name}</h3>
                        <p>${new Date(event.date).toLocaleDateString()}</p>
                        <p>${event.location}</p>
                    </div>
                `).join('');
            }
        })
        .catch(console.error);

    // 2. Handle login button if exists
    const loginBtn = document.getElementById('public-login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
});

async function loadPublicEvents() {
    try {
        const response = await fetch('http://localhost/event-management-php/api/events.php?limit=3');
        const events = await response.json();
        
        const container = document.getElementById('public-events');
        if (container) {
            container.innerHTML = events.map(event => `
                <div class="event-card">
                    <h3>${event.name}</h3>
                    <p>${new Date(event.date).toLocaleDateString()}</p>
                    <p>${event.location}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Public events load error:', error);
    }
}