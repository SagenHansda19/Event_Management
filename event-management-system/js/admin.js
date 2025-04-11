let editingEventId = null;

// Display all events in table
function displayEvents() {
    const eventList = document.getElementById('event-list');
    eventList.innerHTML = '';
    
    fetch('http://localhost/event-management-php/api/events.php')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(events => {
            if (!Array.isArray(events)) throw new Error('Invalid data format');
            
            events.forEach(event => {
                eventList.innerHTML += `
                    <tr id="event-${event.id}">
                        <td>${escapeHtml(event.name)}</td>
                        <td>${formatDisplayDate(event.date)}</td>
                        <td>${escapeHtml(event.location)}</td>
                        <td>${escapeHtml(event.description)}</td>
                        <td>
                            <button onclick="startEdit(${event.id})">Edit</button>
                            <button onclick="cancelEvent(${event.id})">Cancel</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error('Error loading events:', error);
            eventList.innerHTML = '<tr><td colspan="5" class="error">Error loading events. Please try again.</td></tr>';
        });
}

// Format date for display (MM/DD/YYYY)
function formatDisplayDate(dateString) {
    try {
        if (!dateString) return 'No date set';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString('en-US');
    } catch (e) {
        console.error('Date formatting error:', e);
        return 'Invalid date';
    }
}

// Format date for input field (YYYY-MM-DD)
function formatInputDate(dateString) {
    try {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error('Date parsing error:', e);
        return '';
    }
}

// Basic HTML escaping for safety
function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Start editing an event
function startEdit(eventId) {
    try {
        const eventRow = document.getElementById(`event-${eventId}`);
        if (!eventRow) throw new Error('Event row not found');
        
        const cells = eventRow.querySelectorAll('td:not(:last-child)');
        const originalValues = {
            name: cells[0].textContent,
            date: cells[1].textContent,
            location: cells[2].textContent,
            description: cells[3].textContent
        };

        cells[0].innerHTML = `<input type="text" value="${escapeHtml(originalValues.name)}">`;
        cells[1].innerHTML = `<input type="date" value="${formatInputDate(originalValues.date)}">`;
        cells[2].innerHTML = `<input type="text" value="${escapeHtml(originalValues.location)}">`;
        cells[3].innerHTML = `<textarea>${escapeHtml(originalValues.description)}</textarea>`;
        
        eventRow.querySelector('td:last-child').innerHTML = `
            <button onclick="saveEdit(${eventId})">Save</button>
            <button onclick="cancelEdit(${eventId}, ${escapeHtml(JSON.stringify(originalValues))})">Cancel</button>
        `;
        
        editingEventId = eventId;
    } catch (error) {
        console.error('Error starting edit:', error);
        alert('Failed to start editing. Please try again.');
    }
}

// Save edited event
function saveEdit(eventId) {
    try {
        const eventRow = document.getElementById(`event-${eventId}`);
        if (!eventRow) throw new Error('Event row not found');
        
        const inputs = eventRow.querySelectorAll('input, textarea');
        const updatedEvent = {
            id: eventId,
            name: inputs[0].value.trim(),
            date: inputs[1].value,
            location: inputs[2].value.trim(),
            description: inputs[3].value.trim()
        };

        if (!updatedEvent.name || !updatedEvent.date) {
            throw new Error('Event name and date are required');
        }

        fetch(`http://localhost/event-management-php/api/events.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedEvent)
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(() => displayEvents())
        .catch(error => {
            console.error('Error saving event:', error);
            alert('Failed to save changes. Please try again.');
        });
    } catch (error) {
        console.error('Error in saveEdit:', error);
        alert(error.message);
    }
}

// Cancel editing
function cancelEdit(eventId, originalValuesJson) {
    try {
        const originalValues = JSON.parse(originalValuesJson);
        const eventRow = document.getElementById(`event-${eventId}`);
        if (!eventRow) throw new Error('Event row not found');
        
        const cells = eventRow.querySelectorAll('td:not(:last-child)');
        cells[0].textContent = originalValues.name;
        cells[1].textContent = originalValues.date;
        cells[2].textContent = originalValues.location;
        cells[3].textContent = originalValues.description;
        
        eventRow.querySelector('td:last-child').innerHTML = `
            <button onclick="startEdit(${eventId})">Edit</button>
            <button onclick="cancelEvent(${eventId})">Cancel</button>
        `;
        
        editingEventId = null;
    } catch (error) {
        console.error('Error canceling edit:', error);
        displayEvents(); // Fallback to refresh the view
    }
}

// Cancel an event
function cancelEvent(eventId) {
    if (confirm('Are you sure you want to permanently delete this event?')) {
        fetch(`http://localhost/event-management-php/api/events.php`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json'
                // Remove Authorization header if you're not using it
            },
            body: JSON.stringify({ id: eventId }),
            credentials: 'include'  // Add this if using session cookies
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || 'Failed to delete event');
                });
            }
            return response.json();
        })
        .then(data => {
            showNotification('Event deleted successfully', 'success');
            displayEvents();
        })
        .catch(error => {
            console.error('Delete error:', error);
            showNotification(error.message || 'Failed to delete event', 'error');
        });
    }
}

// Add this helper function (at top of file)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
// Add new event
document.getElementById('add-event-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    try {
        const newEvent = {
            name: document.getElementById('event-name').value.trim(),
            date: document.getElementById('event-date').value,
            location: document.getElementById('event-location').value.trim(),
            description: document.getElementById('event-description').value.trim()
        };

        if (!newEvent.name || !newEvent.date) {
            throw new Error('Event name and date are required');
        }

        fetch('http://localhost/event-management-php/api/events.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEvent)
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            displayEvents();
            this.reset();
        })
        .catch(error => {
            console.error('Error adding event:', error);
            alert('Failed to add event. Please try again.');
        });
    } catch (error) {
        alert(error.message);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayEvents();
});