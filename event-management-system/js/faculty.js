// DOM Elements
const eventSelect = document.getElementById('event-select');
const roleDropdown = document.getElementById('role-dropdown');
const attendanceTable = document.getElementById('attendance-table').querySelector('tbody');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await populateEventDropdown();
    setupEventListeners();
    setActiveNav();
});

// Fetch events for dropdown
async function fetchEvents() {
    try {
        const response = await fetch('http://localhost/event-management-php/api/events.php');
        if (!response.ok) throw new Error('Failed to fetch events');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error loading events', 'error');
        return [];
    }
}

// Fetch registrations by role
async function fetchRegistrations(eventId, role) {
    try {
        const response = await fetch(
            `http://localhost/event-management-php/api/registrations.php?event_id=${eventId}`,
            {
                credentials: 'include' // Add this for session support
            }
        );
        
        if (!response.ok) throw new Error('Failed to fetch registrations');
        const data = await response.json();
        console.log("Fetched registrations:", data);
        
        // Return the specific role's data or empty array if none exists
        return data[role] || [];
        
    } catch (error) {
        console.error('Error:', error);
        showNotification(`Error loading ${role}s`, 'error');
        return [];
    }
}

// Populate event dropdown
async function populateEventDropdown() {
    const events = await fetchEvents();
    eventSelect.innerHTML = '<option value="">Select an Event</option>';
    
    events.forEach(event => {
        eventSelect.innerHTML += `<option value="${event.id}">${event.name}</option>`;
    });
}

// Display attendance for selected role
async function displayAttendance() {
    const eventId = eventSelect.value;
    // Map singular to plural keys
    const roleMapping = {
        participant: 'participants',
        volunteer: 'volunteers'
    };
    const role = roleMapping[roleDropdown.value] || roleDropdown.value;
    
    if (!eventId) {
        attendanceTable.innerHTML = '<tr><td colspan="4">Please select an event</td></tr>';
        return;
    }

    try {
        const registrations = await fetchRegistrations(eventId, role);
        attendanceTable.innerHTML = '';

        if (registrations.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" style="text-align: center;">No ${roleDropdown.value}s found for this event</td>`;
            attendanceTable.appendChild(row);
            return;
        }

        registrations.forEach(reg => {
            const row = document.createElement('tr');
            row.className = reg.attended ? 'attended' : 'absent';
            row.setAttribute('data-user-id', reg.user_id); // Add user_id to row
            row.setAttribute('data-event-id', eventId); // Add event_id to row
            row.innerHTML = `
                <td>${escapeHtml(reg.name)}</td>
                <td>${escapeHtml(reg.email || 'N/A')}</td>
                <td>${roleDropdown.value.charAt(0).toUpperCase() + roleDropdown.value.slice(1)}</td>
                <td>
                    <input type="checkbox" 
                           data-reg-id="${reg.id}" 
                           ${reg.attended ? 'checked' : ''}>
                </td>
            `;
            attendanceTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error displaying attendance:', error);
        attendanceTable.innerHTML = `<tr><td colspan="4" style="text-align: center;">Error loading data: ${error.message}</td></tr>`;
    }
}


// Submit attendance to server
// Modify the submitAttendance function
async function submitAttendance() {
    const checkboxes = document.querySelectorAll('#attendance-table input[type="checkbox"]');
    const attendanceData = Array.from(checkboxes).map(cb => ({
        id: cb.getAttribute('data-reg-id'),
        attended: cb.checked ? 1 : 0
    }));

    try {
        const response = await fetch('http://localhost/event-management-php/api/update_attendance_bulk.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attendanceData),
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Submission failed');
        const result = await response.json();
        
        if (result.status === 'success') {
            showNotification('Attendance saved successfully!', 'success');
            displayAttendance(); // Refresh view
        } else {
            throw new Error(result.message || 'Submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    }
}

// Helper functions
function setupEventListeners() {
    eventSelect.addEventListener('change', displayAttendance);
    roleDropdown.addEventListener('change', displayAttendance);
    
    document.getElementById('mark-all-present').addEventListener('click', () => {
        document.querySelectorAll('#attendance-table input[type="checkbox"]').forEach(cb => cb.checked = true);
    });
    
    document.getElementById('mark-all-absent').addEventListener('click', () => {
        document.querySelectorAll('#attendance-table input[type="checkbox"]').forEach(cb => cb.checked = false);
    });
    
    document.getElementById('submit-attendance').addEventListener('click', () => {
        document.getElementById('confirmation-modal').style.display = 'flex';
    });
    
    document.getElementById('confirm-submit').addEventListener('click', () => {
        submitAttendance();
        document.getElementById('confirmation-modal').style.display = 'none';
    });
    
    document.getElementById('cancel-submit').addEventListener('click', () => {
        document.getElementById('confirmation-modal').style.display = 'none';
    });
}

function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPage);
    });
}

function escapeHtml(str) {
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Profile functions
function toggleProfileDropdown() {
    document.getElementById('profile-dropdown').classList.toggle('active');
}

function viewProfile() {
    // Implement profile viewing
    window.location.href = 'profile.html';
}

function logout() {
    fetch('http://localhost/event-management-php/api/logout.php', {
        method: 'POST'
    }).then(() => {
        window.location.href = 'login.html';
    });
}