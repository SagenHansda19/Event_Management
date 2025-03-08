// Initialize event data in localStorage if not exists
if (!localStorage.getItem('events')) {
    localStorage.setItem('events', JSON.stringify([]));
}

// Function to update dashboard statistics
function updateDashboardStats() {
    const events = JSON.parse(localStorage.getItem('events'));
    const upcomingCount = events.filter(event => new Date(event.date) > new Date()).length;
    
    document.getElementById('upcoming-count').textContent = upcomingCount;
    document.getElementById('volunteer-count').textContent = events.reduce((sum, event) => sum + (event.volunteers?.length || 0), 0);
    document.getElementById('attendee-count').textContent = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
}

// Function to display recent events
function displayRecentEvents() {
    const events = JSON.parse(localStorage.getItem('events'));
    const eventList = document.getElementById('event-list');
    eventList.innerHTML = '';

    const recentEvents = events
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    recentEvents.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.innerHTML = `
            <a href="event.html?id=${event.id}">
                <h3>${event.name}</h3>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p>${event.description}</p>
            </a>
        `;
        eventList.appendChild(eventItem);
    });
}

// Event creation form handler
document.getElementById('create-event-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const newEvent = {
        id: Date.now(),
        name: document.getElementById('event-name').value,
        date: document.getElementById('event-date').value,
        description: document.getElementById('event-description').value,
        location: document.getElementById('event-location')?.value || '',
        volunteers: [],
        attendees: []
    };

    const events = JSON.parse(localStorage.getItem('events'));
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));

    updateDashboardStats();
    displayRecentEvents();
    document.getElementById('create-event-form').reset();
});

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    updateDashboardStats();
    displayRecentEvents();
});
