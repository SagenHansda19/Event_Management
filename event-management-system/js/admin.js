let editingEventId = null;

// Function to display the list of events in a table
function displayEvents() {
    const eventList = document.getElementById('event-list');
    eventList.innerHTML = ''; // Clear existing event list
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
            events.forEach(event => {
                eventList.innerHTML += `
                    <tr id="event-${event.id}">
                        <td>${event.name}</td>
                        <td>${formatDate(event.date)}</td>
                        <td>${event.location}</td>
                        <td>${event.description}</td>
                        <td>
                            <button onclick="startEdit(${event.id})">Edit</button>
                            <button onclick="cancelEvent(${event.id})">Cancel</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            eventList.innerHTML = '<tr><td colspan="5">Error loading events. Please try again later.</td></tr>';
        });
}

// Function to format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    return date.toLocaleDateString();
}

// Function to start editing an event
function startEdit(eventId) {
    const eventRow = document.getElementById(`event-${eventId}`);
    if (!eventRow) return;

    const [name, date, location, description] = eventRow.children;

    // Save the original values
    const originalValues = {
        name: name.textContent,
        date: date.textContent,
        location: location.textContent,
        description: description.textContent,
    };

    // Replace text with input fields
    name.innerHTML = `<input type="text" value="${originalValues.name}">`;
    date.innerHTML = `<input type="date" value="${formatDateForInput(originalValues.date)}">`;
    location.innerHTML = `<input type="text" value="${originalValues.location}">`;
    description.innerHTML = `<textarea>${originalValues.description}</textarea>`;

    // Add save and cancel buttons
    eventRow.children[4].innerHTML = `
        <button onclick="saveEdit(${eventId})">Save</button>
        <button onclick="cancelEdit(${eventId}, ${JSON.stringify(originalValues).replace(/"/g, '&quot;')})">Cancel</button>
    `;

    // Add edit mode styling
    eventRow.classList.add('edit-mode');
    editingEventId = eventId;
}

// Function to format date for input field
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return '';
    }
    return date.toISOString().split('T')[0];
}

// Function to save the edited event
function saveEdit(eventId) {
    const eventRow = document.getElementById(`event-${eventId}`);
    if (!eventRow) return;

    const [name, date, location, description] = eventRow.children;

    const updatedEvent = {
        id: eventId,
        name: name.querySelector('input').value,
        date: date.querySelector('input').value,
        location: location.querySelector('input').value,
        description: description.querySelector('textarea').value,
    };

    fetch(`http://localhost/event-management-php/api/events.php?id=${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                displayEvents(); // Refresh the event list
                editingEventId = null;
            } else {
                alert('Error updating event: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating event:', error);
            alert('Failed to update event. Please try again.');
        });
}

// Function to cancel editing
function cancelEdit(eventId, originalValues) {
    const eventRow = document.getElementById(`event-${eventId}`);
    if (!eventRow) return;

    const [name, date, location, description] = eventRow.children;

    // Restore original values
    name.textContent = originalValues.name;
    date.textContent = originalValues.date;
    location.textContent = originalValues.location;
    description.textContent = originalValues.description;

    // Restore action buttons
    eventRow.children[4].innerHTML = `
        <button onclick="startEdit(${eventId})">Edit</button>
        <button onclick="cancelEvent(${eventId})">Cancel</button>
    `;

    // Remove edit mode styling
    eventRow.classList.remove('edit-mode');
    editingEventId = null;
}

// Function to cancel an event
function cancelEvent(eventId) {
    if (confirm('Are you sure you want to cancel this event?')) {
        fetch(`http://localhost/event-management-php/api/events.php`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: eventId }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    displayEvents(); // Refresh the event list
                } else {
                    alert('Error canceling event: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error canceling event:', error);
                alert('Failed to cancel event. Please try again.');
            });
    }
}

// Function to add a new event
document.getElementById('add-event-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const eventName = document.getElementById('event-name').value;
    const eventDate = document.getElementById('event-date').value;
    const eventLocation = document.getElementById('event-location').value;
    const eventDescription = document.getElementById('event-description').value;
    const autoApproveDL = document.getElementById('auto-approve-dl').checked;

    const newEvent = {
        name: eventName,
        date: eventDate,
        location: eventLocation,
        description: eventDescription,
        auto_approve_dl: autoApproveDL, // Include the auto-approval flag
    };

    fetch('http://localhost/event-management-php/api/events.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                displayEvents(); // Refresh the event list
                document.getElementById('add-event-form').reset(); // Clear the form
            } else {
                alert('Error adding event: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error adding event:', error);
            alert('Failed to add event. Please try again.');
        });
});

// Initialize the admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    displayEvents();
});