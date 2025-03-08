// Fetch user details from the backend
async function fetchUser() {
    try {
        const response = await fetch('http://localhost/event-management-php/api/get_user.php', {
            credentials: 'include' // Include cookies
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch user details");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
}

// Register for an event
async function registerForEvent(eventId) {
    // Replace this with the actual user ID (e.g., from a session or token)
    const userId = 123; // Example user ID

    const currentUser = await fetchUser(userId);
    if (!currentUser) {
        alert('Please log in to register for events.');
        return;
    }

    try {
        const response = await fetch('http://localhost/event-management-php/api/register_event.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_id: eventId,
                user_id: currentUser.id,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to register for the event');
        }

        const result = await response.json();
        alert(result.message || 'Successfully registered for the event!');
    } catch (error) {
        console.error('Error registering for event:', error);
        alert(error.message || 'Failed to register for the event. Please try again later.');
    }
}

// Update profile details and icon
async function updateProfileDetails() {
    const currentUser = await fetchUser();
    if (currentUser) {
        // Update profile details in the dropdown
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-email').textContent = currentUser.email;
    } else {
        console.error('No user data found');
    }
}

// Toggle profile dropdown
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    const profileContainer = document.querySelector('.profile-icon-container');
    const isClickInside = profileContainer.contains(event.target);

    if (!isClickInside) {
        profileContainer.classList.remove('active');
    }
});

// Fetch events from the backend
async function fetchEvents() {
    try {
        const response = await fetch('http://localhost/event-management-php/api/events.php');
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        const events = await response.json();
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        alert('Failed to load events. Please try again later.');
        return [];
    }
}

// Display events on the page
async function displayEvents() {
    const eventList = document.getElementById('event-list');
    eventList.innerHTML = ''; // Clear existing content

    const events = await fetchEvents(); // Fetch events from the backend
    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <h3>${event.name}</h3>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Description:</strong> ${event.description}</p>
            <button onclick="registerForEvent(${event.id})">Register</button>
        `;
        eventList.appendChild(eventCard);
    });
}

// Function to logout
async function logout() {
    try {
        const response = await fetch('http://localhost/event-management-php/api/logout.php', {
            method: 'POST',
            credentials: 'include', // Include cookies for session management
        });

        if (response.ok) {
            // Clear any local storage or session data
            localStorage.removeItem('userToken');
            sessionStorage.clear();

            // Redirect to the login page
            window.location.href = 'login.html';
        } else {
            alert('Failed to logout. Please try again.');
        }
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Failed to logout. Please try again.');
    }
}

// Initialize the participant dashboard
document.addEventListener('DOMContentLoaded', () => {
    displayEvents();
    updateProfileDetails(); // Fetch and display the logged-in user's details

    // Add click event listener to the profile icon
    const profileIcon = document.getElementById('profile-icon');
    profileIcon.addEventListener('click', toggleProfileDropdown);

    // Add click event listener to the edit profile button
    document.getElementById('edit-profile').addEventListener('click', async () => {
        const currentUser = await fetchUser();
        if (currentUser) {
            const newUsername = prompt('Edit your username:', currentUser.username);
            if (newUsername) {
                // Call a backend API to update the username in the database
                const response = await fetch('http://localhost/event-management-php/api/update_username.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: currentUser.id,
                        username: newUsername,
                    }),
                });

                if (response.ok) {
                    alert('Profile updated successfully!');
                    updateProfileDetails(); // Refresh the profile details
                } else {
                    alert('Failed to update profile. Please try again later.');
                }
            }
        }
    });
});