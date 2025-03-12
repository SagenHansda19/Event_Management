const API_BASE_URL = 'http://localhost/event-management-php/api/';

// Fetch user_id by username
async function fetchUserIdByUsername(username) {
    try {
        const response = await fetch('http://localhost/event-management-php/api/get_user_id.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for session management
            body: JSON.stringify({
                username: username,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to fetch user ID");
        }

        const data = await response.json();
        return data.user_id; // Return the user_id
    } catch (error) {
        console.error('Error fetching user ID:', error);
        throw error;
    }
}

// Fetch events the volunteer has registered for
async function fetchParticipantEvents() {
    try {
        const response = await fetch('http://localhost/event-management-php/api/events.php', {
            credentials: 'include', // Include cookies for session management
        });

        console.log('Raw Response:', response); // Log the raw response object

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Handle non-JSON responses
            throw new Error(errorData.message || "Failed to fetch events");
        }

        const data = await response.json(); // Parse the JSON response
        console.log('Events Response:', data); // Log the parsed JSON data

        return data;
    } catch (error) {
        console.error('Error fetching events:', error);
        alert('Failed to load events. Please try again later.');
        return [];
    }
}

// Display the volunteer's registered events
async function displayParticipantEvents() {
    const eventsTable = document.getElementById('events-table');
    const eventsTableBody = eventsTable.querySelector('tbody');
    const noEventsMessage = document.getElementById('no-events-message');

    // Clear existing rows
    eventsTableBody.innerHTML = '';

    // Fetch events
    const events = await fetchParticipantEvents();
    console.log('Events:', events); // Log the events

    if (events.length > 0) {
        // Show the table
        eventsTable.style.display = 'table';
        noEventsMessage.style.display = 'none';

        // Populate the table
        events.forEach(event => {
            const row = document.createElement('tr');
            if (event.id) {
                row.innerHTML = `
                    <td>${event.name}</td>
                    <td>${new Date(event.date).toLocaleString()}</td>
                    <td>${event.location}</td>
                    <td>
                        <button onclick="registerForEvent(${event.id})">Register</button>
                    </td>
                `;
            }            
            eventsTableBody.appendChild(row);
        });
    } else {
        // Hide the table and show the "no events" message
        eventsTable.style.display = 'none';
        noEventsMessage.style.display = 'block';
    }
}

// Register for an event
async function registerForEvent(eventId) {
    try {
        // Get the username from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.username) {
            throw new Error('User not logged in');
        }

        const username = currentUser.username;
        const role = currentUser.role;

        // Fetch the user_id using the username
        const userId = await fetchUserIdByUsername(username);

        // Register the user for the event
        const response = await fetch('http://localhost/event-management-php/api/register_event.php', {
            method: 'POST',
            credentials: 'include', // Include cookies for session management
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_id: eventId,
                user_id: userId, // Include the user_id in the request body
                role: role, // Include the role in the request
            }),
        });

        console.log('Response:', response); // Log the response

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Handle non-JSON responses
            throw new Error(errorData.message || "Failed to register for the event");
        }

        const data = await response.json();
        if (data.status === 'success') {
            alert('Successfully registered for the event!');
            await displayParticipantEvents(); // Refresh the events table
        } else {
            alert('Failed to register for the event. Please try again.');
        }
    } catch (error) {
        console.error('Error registering for event:', error);
        // alert('Failed to register for the event. Please try again.');
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

// Function to logout
async function logout() {
    try {
        const response = await fetch('http://localhost/event-management-php/api/logout.php', {
            method: 'GET', // or DELETE if supported
            credentials: 'include',
        });        

        if (response.ok) {
            // Clear any local storage or session data
            localStorage.removeItem('currentUser');
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

// Initialize the volunteer dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await displayParticipantEvents(); // Display the participant's registered events
    // await updateProfileDetails(); // Fetch and display the logged-in user's details
    
    // Add click event listener to the profile icon
    const profileIcon = document.getElementById('profile-icon');
    if (profileIcon) {
        profileIcon.addEventListener('click', toggleProfileDropdown);
    }
    
    // Add click event listener to the edit profile button
    const editProfileButton = document.getElementById('edit-profile');
    if (editProfileButton) {
        editProfileButton.addEventListener('click', async () => {
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
                            user_id: currentUser.user_id, // ✅ Use `user_id`
                            username: newUsername,
                        }),
                        
                    });
                    
                    if (response.ok) {
                        alert('Profile updated successfully!');
                        await updateProfileDetails(); // Refresh the profile details
                    } else {
                        alert('Failed to update profile. Please try again later.');
                    }
                }
            }
        });
    }
});

async function login(username, password) {
    try {
        const response = await fetch('http://localhost/event-management-php/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to login");
        }

        const data = await response.json();
        console.log('Login response:', data); // Log the response

        // Store user details in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            user_id: data.user_id, // Ensure user_id is included
            username: data.username,
            role: data.role
        }));

        alert('Login successful!');
        if (data.role === 'volunteer') {
            window.location.href = 'volunteer.html'; // Redirect to the volunteer dashboard
        } else {
            window.location.href = 'participant.html'; // Redirect to the participant dashboard
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Failed to login. Please try again.');
    }
}

function viewProfile() {
    // Redirect to the profile page or show a modal
    window.location.href = 'profile.html'; // Replace with your profile page URL
}

async function login(username, password) {
    try {
        const response = await fetch('http://localhost/event-management-php/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to login");
        }

        const data = await response.json();
        console.log('Login response:', data); // Log the response

        // Store username in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            username: data.username, // Store only the username
            role: data.role
        }));

        alert('Login successful!');
        window.location.href = 'participant.html'; // Redirect to the participant dashboard
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Failed to login. Please try again.');
    }
}