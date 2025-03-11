// volunteer.js

const API_BASE_URL = 'http://localhost/event-management-php/api/'; // Update this to the actual base URL where your PHP server is running

// Function to display the list of tasks for volunteers
async function displayTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Clear existing task list
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('User not logged in');
        return;
    }
    
    console.log('Current User:', currentUser);
    console.log('Current User ID:', currentUser.id);

    if (!currentUser.id) {
        console.error('Current user ID is undefined');
        alert('User ID is not defined. Please log in again.');
        return;
    }

    const registeredEvents = await fetchUserRegisteredEvents(currentUser.id);
    registeredEvents.forEach(event => {
        taskList.innerHTML += `<p>${event.name} - ${event.date}</p>`;
    });
}

// Function to fetch all events from the backend
async function fetchEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}events.php`);
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        const events = await response.json();
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

// Function to fetch a user's registered events from the backend
async function fetchUserRegisteredEvents(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}participant_events.php?user_id=${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user registered events');
        }
        const registeredEvents = await response.json();
        return registeredEvents;
    } catch (error) {
        console.error('Error fetching user registered events:', error);
        return [];
    }
}

// Function to register a user for an event as a volunteer
async function registerForEvent(eventId, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}register_event.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_id: eventId,
                user_id: userId,
                role: 'volunteer',
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to register for event');
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error registering for event:', error);
        return { success: false, message: error.message };
    }
}

// Function to handle the "Register as Volunteer" button click and update the UI
async function handleRegisterForEvent(eventId, userId) {
    const result = await registerForEvent(eventId, userId);
    if (result.success) {
        alert('Successfully registered for the event as a volunteer!');
        displayAvailableEvents();
        displayTasks();
    } else {
        alert('Failed to register for the event: ' + result.message);
    }
}

// Function to display all available events with a "Register as Volunteer" button for each event
async function displayAvailableEvents() {
    const availableEventsList = document.getElementById('available-events-list');
    availableEventsList.innerHTML = ''; // Clear existing event list

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('User not logged in');
        return;
    }
    
    console.log('Current User:', currentUser);
    console.log('Current User ID:', currentUser.id);

    if (!currentUser.id) {
        console.error('Current user ID is undefined');
        alert('User ID is not defined. Please log in again.');
        return;
    }

    const events = await fetchEvents();
    const registeredEvents = await fetchUserRegisteredEvents(currentUser.id);

    const registeredEventIds = registeredEvents.map(event => event.id);

    events.forEach(event => {
        if (!registeredEventIds.includes(event.id)) {
            const eventElement = document.createElement('div');
            eventElement.innerHTML = `
                <p>${event.name} - ${event.date}</p>
                <button onclick="handleRegisterForEvent('${event.id}', '${currentUser.id}')">Register as Volunteer</button>
            `;
            availableEventsList.appendChild(eventElement);
        } else {
            const eventElement = document.createElement('div');
            eventElement.innerHTML = `
                <p>${event.name} - ${event.date}</p>
                <p>You are already registered for this event.</p>
            `;
            availableEventsList.appendChild(eventElement);
        }
    });
}

// Initialize the volunteer dashboard
document.addEventListener('DOMContentLoaded', () => {
    displayTasks();
    displayAvailableEvents();
});
