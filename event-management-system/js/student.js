const API_BASE = 'http://localhost/event-management-php/api';

// DOM Elements
const upcomingAvailableGrid = document.getElementById('upcoming-events-grid');
const pastAvailableGrid = document.getElementById('past-events-grid');
const upcomingRegisteredGrid = document.getElementById('upcoming-registered-grid');
const pastRegisteredGrid = document.getElementById('past-registered-grid');
const noRegistered = document.getElementById('no-registered-events');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded');
    
    // Verify elements exist with new IDs
    if (!upcomingAvailableGrid || !pastAvailableGrid || 
        !upcomingRegisteredGrid || !pastRegisteredGrid || !noRegistered) {
        console.error('Critical DOM elements missing!');
        console.log('upcomingAvailableGrid exists:', !!upcomingAvailableGrid);
        console.log('pastAvailableGrid exists:', !!pastAvailableGrid);
        console.log('upcomingRegisteredGrid exists:', !!upcomingRegisteredGrid);
        console.log('pastRegisteredGrid exists:', !!pastRegisteredGrid);
        console.log('noRegistered exists:', !!noRegistered);
        return;
    }
    
    try {
        const user = await loadUserData();
        if (user) {
            setupTabs(); // Initialize tabs first
            await loadAllEvents();
            setupEventListeners();
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Failed to initialize dashboard', 'error');
    }
});

// Update loadUserData in student.js
async function loadUserData() {
    try {
        console.log('Checking user session...');
        
        const response = await fetch(`${API_BASE}/get_user.php`, {
            credentials: 'include'
        });
        
        console.log('Session check status:', response.status);
        
        if (response.status === 401) {
            console.warn('Session expired, redirecting to login');
            window.location.href = 'login.html';
            return null;
        }

        const data = await response.json();
        console.log('Session data:', data);

        if (data.status !== 'success' || !data.user) {
            throw new Error(data.message || 'Invalid session');
        }

        // Update UI with role
        const roleDisplayMap = {
            'participant': 'Student',
            'student': 'Student',
            'volunteer': 'Volunteer'
        };
        
        const displayRole = roleDisplayMap[data.user.role.toLowerCase()] || data.user.role;
        document.getElementById('user-role').textContent = displayRole;

        return data.user;

    } catch (error) {
        console.error('Session check failed:', error);
        window.location.href = 'login.html';
        return null;
    }
}

// Event Loading
async function loadAllEvents() {
    try {
        console.log('Loading all events...');
        await Promise.all([
            loadAvailableEvents().catch(e => {
                console.error('Available events error:', e);
                return null;
            }),
            loadRegisteredEvents().catch(e => {
                console.error('Registered events error:', e);
                return null;
            })
        ]);
    } catch (error) {
        console.error('Global events error:', error);
        showNotification('Failed to load events', 'error');
    }
}

async function loadAvailableEvents() {
    try {
        const response = await fetch(`${API_BASE}/events.php`);
        const data = await parseResponse(response);
        
        if (!response.ok) throw new Error(data.message || 'Failed to load events');

        const { upcoming, past } = categorizeEvents(data);
        
        // Safely update grids only if they exist
        const upcomingGrid = document.getElementById('upcoming-events-grid');
        const pastGrid = document.getElementById('past-events-grid');
        
        if (upcomingGrid) {
            upcomingGrid.innerHTML = upcoming.length > 0 
                ? upcoming.map(event => createEventCard(event, false)).join('') 
                : '<p class="no-events">No upcoming events</p>';
        }
        
        if (pastGrid) {
            pastGrid.innerHTML = past.length > 0 
                ? past.map(event => createEventCard(event, false)).join('') 
                : '<p class="no-events">No past events</p>';
        }
            
    } catch (error) {
        console.error('[AvailableEvents] Error:', error);
        showNotification('Failed to load available events', 'error');
    }
}

async function loadRegisteredEvents() {
    try {
        const response = await fetch(`${API_BASE}/registered_events.php`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        const { upcoming, past } = categorizeEvents(data.data || []);

        // Clear previous content
        ['upcoming-registered-grid', 'past-registered-grid'].forEach(id => {
            document.getElementById(id).innerHTML = '';
        });

        if (data.data && data.data.length > 0) {
            noRegistered.style.display = 'none';
            
            upcoming.forEach(event => {
                document.getElementById('upcoming-registered-grid')
                    .appendChild(createRegisteredEventCardElement(event));
            });
            
            past.forEach(event => {
                document.getElementById('past-registered-grid')
                    .appendChild(createRegisteredEventCardElement(event));
            });
        } else {
            noRegistered.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Loading events:', error);
        document.getElementById('upcoming-registered-grid').innerHTML = '<p class="error">Error loading events</p>';
    }
}


// Event Cards
function createEventCard(event, isRegistered) {
    return `
        <div class="event-card">
            <h3>${escapeHtml(event.name)}</h3>
            <p>${formatDate(event.date)}</p>
            <p class="event-location">${escapeHtml(event.location)}</p>
            ${!isRegistered ? `
                <button class="register-btn" data-id="${event.id}">
                    Register
                </button>
            ` : ''}
        </div>
    `;
}

function createRegisteredEventCardElement(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    card.innerHTML = `
        <h3>${escapeHtml(event.name)}</h3>
        <p><strong>Date:</strong> ${formatDate(event.date)}</p>
        <p><strong>Location:</strong> ${escapeHtml(event.location)}</p>
        <span class="role-badge ${event.role}">${event.role.toUpperCase()}</span>
        <button class="unregister-btn" data-id="${event.id}">
            Unregister
        </button>
    `;
    
    return card;
}

// Event Actions
function setupEventListeners() {
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('register-btn')) {
            const eventId = e.target.dataset.id;
            showRegistrationModal(eventId);
        }
        
        if (e.target.classList.contains('unregister-btn')) {
            const eventId = e.target.dataset.id;
            if (confirm('Are you sure you want to unregister?')) {
                await unregisterEvent(eventId);
            }
        }
    });
}

let currentEventId = null;

function showRegistrationModal(eventId) {
    currentEventId = eventId;
    document.getElementById('registration-modal').style.display = 'flex';
}

async function confirmRegistration() {
    const role = document.getElementById('role-select').value;
    document.getElementById('registration-modal').style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE}/register_event.php`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                event_id: currentEventId,
                role: role
            }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }
        
        const data = await response.json();
        showNotification(data.message || 'Registration successful!', 'success');
        await loadAllEvents();
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(`Registration failed: ${error.message}`, 'error');
    }
}

function cancelRegistration() {
    document.getElementById('registration-modal').style.display = 'none';
    currentEventId = null;
}

async function unregisterEvent(eventId) {
    const btn = document.querySelector(`.unregister-btn[data-id="${eventId}"]`);
    if (!btn || btn.disabled) return;
    
    try {
        btn.disabled = true;
        btn.textContent = 'Processing...';
        
        const response = await fetch(`${API_BASE}/unregister_event.php?event_id=${eventId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Handle network errors
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Unregistration failed');
        }
        
        showNotification('Unregistration successful!', 'success');
        await loadAllEvents();
        
    } catch (error) {
        console.error('Unregistration error:', error);
        showNotification(`Unregistration failed: ${error.message}`, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Unregister';
        }
    }
}

// // Profile Management
// function setupProfileDropdown() {
//     const profileIcon = document.querySelector('.profile-icon');
//     const dropdown = document.getElementById('profile-dropdown');

//     if (!profileIcon || !dropdown) {
//         console.error('Profile dropdown elements not found');
//         return;
//     }

//     profileIcon.addEventListener('click', (e) => {
//         e.stopPropagation();
//         dropdown.classList.toggle('active');
//     });

//     document.addEventListener('click', (e) => {
//         if (!e.target.closest('.profile-icon-container')) {
//             dropdown.classList.remove('active');
//         }
//     });

//     dropdown.addEventListener('click', (e) => {
//         e.stopPropagation();
//     });
// }

// Logout Function
async function logout() {
    const response = await fetch(`${API_BASE}/logout.php`, {
        method: 'POST',
    }).then(() => {
        window.location.href = 'login.html';
    });
}

// Utilities
async function parseResponse(response) {
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch (e) {
        console.error('Invalid JSON:', text);
        return { status: 'error', message: 'Invalid server response' };
    }
}

function formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Global functions
window.toggleProfileDropdown = () => {
    document.getElementById('profile-dropdown').classList.toggle('active');
};

window.viewProfile = () => {
    // Implement profile viewing logic
    alert('Profile view not implemented yet');
};

// Repeating the minimal utilities
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function handleResponse(response) {
    return response.text().then(text => {
        try {
            return text ? JSON.parse(text) : {};
        } catch {
            throw new Error('Invalid server response');
        }
    });
}

// Categorize events by time
function categorizeEvents(events) {
    const now = new Date();
    return {
        upcoming: events.filter(event => new Date(event.date) > now),
        past: events.filter(event => new Date(event.date) <= now)
    };
}

// Tab switching functionality
function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.target.dataset.tab;
            console.log(`Attempting to switch to tab: ${tabId}`); // Debug log
            
            const tabContent = document.getElementById(tabId);
            
            if (!tabContent) {
                console.error(`Tab content not found for: ${tabId}`);
                console.log('Available elements with similar IDs:');
                // Log similar elements for debugging
                document.querySelectorAll('[id*="events"]').forEach(el => {
                    console.log(`- ${el.id}`);
                });
                return;
            }

            // Get the parent tabs container
            const tabsContainer = e.target.closest('.events-tabs');
            const section = tabsContainer?.closest('.events-section');
            
            if (!section) {
                console.error('Could not find section container for tabs');
                return;
            }

            // Deactivate all in this section
            section.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            section.querySelectorAll('.events-grid').forEach(g => g.classList.remove('active'));
            
            // Activate current
            e.target.classList.add('active');
            tabContent.classList.add('active');
            
            console.log(`Successfully switched to tab: ${tabId}`); // Debug log
        });
    });
}