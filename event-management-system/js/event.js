function loadEvents() {
    fetch('http://localhost/event-management-php/api/events.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(events => {
            if (!Array.isArray(events)) {
                throw new Error('Invalid data format received');
            }
            
            const eventsContainer = document.getElementById('events-container');
            if (!eventsContainer) {
                throw new Error('Events container not found');
            }
            
            eventsContainer.innerHTML = `
                <table class="events-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Description</th>
                        <th>Created At</th>
                    </tr>
                    </thead>
                    <tbody>
                        ${events.map(event => `
                            <tr>
                                <td>${event.name}</td>
                                <td>${new Date(event.date).toLocaleDateString()}</td>
                                <td>${event.location}</td>
                                <td>${event.description}</td>
                                <td>${new Date(event.created_at).toLocaleString()}</td>

                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            const eventsContainer = document.getElementById('events-container');
            if (eventsContainer) {
                eventsContainer.innerHTML = '<p class="error">Error loading events. Please try again later.</p>';
            }
        });
}

// Load events immediately and on page load
loadEvents();
document.addEventListener('DOMContentLoaded', loadEvents);



document.getElementById('create-event-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const eventData = {
        name: document.getElementById('event-name').value,
        date: document.getElementById('event-date').value,
        location: document.getElementById('event-location').value,
        description: document.getElementById('event-description').value,
        organizer_id: 1 // Default organizer ID, can be modified
    };

    fetch('http://localhost/event-management-php/api/create_event.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('create-event-form').reset();
            loadEvents(); // Reload events after successful creation
            return; // Prevent further execution
        }
        // alert('Error creating event: ' + data.message);


    })
    .catch(error => {
        console.error('Error creating event:', error);
        alert('Failed to create event. Please try again.');
    })
    .finally(() => {
        loadEvents(); // Ensure events are reloaded in all cases
    });

});
