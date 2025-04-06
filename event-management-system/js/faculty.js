// Function to fetch events from the backend
async function fetchEvents() {
    try {
        const response = await fetch('http://localhost/event-management-php/api/events.php');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const events = await response.json();
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

// Function to fetch registrations for a specific event from the backend
async function fetchRegistrations(eventId) {
    try {
        const response = await fetch(`http://localhost/event-management-php/api/registrations.php?event_id=${eventId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch registrations');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching registrations:', error);
        alert('Failed to load registrations. Please try again later.');
        return { participants: [], volunteers: [] };
    }
}

// Function to update attendance status in the backend (bulk update)
async function updateAttendanceBulk(attendanceData) {
    try {
        const response = await fetch('http://localhost/event-management-php/api/update_attendance_bulk.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(attendanceData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating attendance:', error);
        return null;
    }
}

// Function to populate the event dropdown
async function populateEventDropdown() {
    const eventSelect = document.getElementById('event-select');
    eventSelect.innerHTML = '<option value="">Select an Event</option>';

    const events = await fetchEvents();
    events.forEach(event => {
        eventSelect.innerHTML += `<option value="${event.id}">${event.name}</option>`;
    });
}

// Function to display attendance for a selected event
async function displayAttendance(eventId) {
    const registrations = await fetchRegistrations(eventId);
    const events = await fetchEvents(); // Fetch events to get the event name
    const event = events.find(event => event.id === parseInt(eventId));

    if (!event) {
        console.error('Event not found');
        return;
    }

    // Display participants
    const participantsTable = document.getElementById('participants-table').querySelector('tbody');
    participantsTable.innerHTML = ''; // Clear existing rows
    registrations.participants.forEach(registration => {
        const row = document.createElement('tr');
        row.classList.add(registration.attended ? 'attended-true' : 'attended-false');
        row.innerHTML = `
            <td>${registration.name}</td>
            <td>${registration.email || 'N/A'}</td>
            <td>${event.name}</td>
            <td>
                <input type="checkbox" class="attendance-checkbox" data-registration-id="${registration.id}"
                    ${registration.attended ? 'checked' : ''}>
            </td>
        `;
        participantsTable.appendChild(row);
    });

    // Display volunteers
    const volunteersTable = document.getElementById('volunteers-table').querySelector('tbody');
    volunteersTable.innerHTML = ''; // Clear existing rows
    registrations.volunteers.forEach(registration => {
        const row = document.createElement('tr');
        row.classList.add(registration.attended ? 'attended-true' : 'attended-false');
        row.innerHTML = `
            <td>${registration.name}</td>
            <td>${registration.email || 'N/A'}</td>
            <td>${event.name}</td>
            <td>
                <input type="checkbox" class="attendance-checkbox" data-registration-id="${registration.id}"
                    ${registration.attended ? 'checked' : ''}>
            </td>
        `;
        volunteersTable.appendChild(row);
    });

    // Show the buttons after selecting an event
    document.getElementById('attendance-buttons').style.display = 'block';
}

// Function to toggle between Participants and Volunteers
function toggleRoleView() {
    const role = document.getElementById('role-dropdown').value;
    if (role === 'participant') {
        document.getElementById('participants-section').style.display = 'block';
        document.getElementById('volunteers-section').style.display = 'none';
    } else if (role === 'volunteer') {
        document.getElementById('participants-section').style.display = 'none';
        document.getElementById('volunteers-section').style.display = 'block';
    } else {
        // If no role is selected, hide both tables
        document.getElementById('participants-section').style.display = 'none';
        document.getElementById('volunteers-section').style.display = 'none';
    }
}

// Update the event listener for the role dropdown
document.getElementById('role-dropdown').addEventListener('change', toggleRoleView);

// Update this section
document.getElementById('event-select').addEventListener('change', async function () {
    const eventId = this.value;
    if (eventId) {
        // Show the role dropdown
        document.getElementById('role-select').hidden = false;

        // Clear the tables initially
        document.getElementById('participants-section').style.display = 'none';
        document.getElementById('volunteers-section').style.display = 'none';

        // Reset the role dropdown to "Select Type"
        document.getElementById('role-dropdown').value = '';

        // Fetch and display attendance data
        await displayAttendance(eventId);
    } else {
        // Hide buttons and dropdown if no event is selected
        document.getElementById('attendance-buttons').style.display = 'none';
        document.getElementById('role-select').hidden = true;
        document.getElementById('participants-section').style.display = 'none';
        document.getElementById('volunteers-section').style.display = 'none';
    }
});

// Function to handle the Submit Attendance button click
async function submitAttendance() {
    const checkboxes = document.querySelectorAll('.attendance-checkbox');
    const attendanceData = [];

    checkboxes.forEach(checkbox => {
        const registrationId = checkbox.getAttribute('data-registration-id');
        const attended = checkbox.checked ? 1 : 0;
        attendanceData.push({ id: registrationId, attended: attended });
    });

    // Show the confirmation modal
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'flex';

    // Handle the "Yes, Submit" button click
    document.getElementById('confirm-submit').addEventListener('click', async () => {
        const data = await updateAttendanceBulk(attendanceData);
        if (data && data.status === 'success') {
            // Hide the modal
            modal.style.display = 'none';

            // Show a success message (optional)
            const eventId = document.getElementById('event-select').value;
            if (eventId) {
                await displayAttendance(eventId); // Refresh the attendance table
            }
        } else {
            // Show an error message (optional)
            alert('Failed to update attendance. Please try again.');
        }
    });

    // Handle the "Cancel" button click
    document.getElementById('cancel-submit').addEventListener('click', () => {
        // Hide the modal
        modal.style.display = 'none';
    });
}

// Function to mark all rows as Present
function markAllPresent() {
    const checkboxes = document.querySelectorAll('.attendance-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        const row = checkbox.closest('tr');
        row.classList.remove('attended-false');
        row.classList.add('attended-true');
    });
}

// Function to mark all rows as Absent
function markAllAbsent() {
    const checkboxes = document.querySelectorAll('.attendance-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const row = checkbox.closest('tr');
        row.classList.remove('attended-true');
        row.classList.add('attended-false');
    });
}

// Initialize the faculty dashboard
document.addEventListener('DOMContentLoaded', async () => {
    
    await populateEventDropdown();

    // Load attendance when an event is selected
    document.getElementById('event-select').addEventListener('change', async function () {
        const eventId = this.value;
        if (eventId) {
            await displayAttendance(eventId);
        } else {
            // Hide buttons if no event is selected
            document.getElementById('attendance-buttons').style.display = 'none';
        }
    });

    // Handle the Submit Attendance button click
    document.getElementById('submit-attendance').addEventListener('click', submitAttendance);

    // Handle the Mark All Present button click
    document.getElementById('mark-all-present').addEventListener('click', markAllPresent);

    // Handle the Mark All Absent button click
    document.getElementById('mark-all-absent').addEventListener('click', markAllAbsent);
});

// Function to toggle the profile dropdown
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.classList.toggle('active');
}

// Function to view profile
function viewProfile() {
    alert('View Profile clicked!'); // Replace with actual functionality
}

// Function to logout
function logout() {
    // Clear any session or local storage data (if applicable)
    localStorage.removeItem('userToken'); // Example: Remove a stored token
    sessionStorage.clear(); // Clear session storage

    // Redirect to the login page
    window.location.href = 'login.html'; // Replace with your login page URL
}

// Fetch all DL requests
async function fetchDLRequests() {
    try {
        const response = await fetch('http://localhost/event-management-php/api/dl_requests.php');
        if (!response.ok) {
            throw new Error('Failed to fetch DL requests');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching DL requests:', error);
        return [];
    }
}

// Display DL requests in the table
async function displayDLRequests() {
    const dlRequestsTable = document.querySelector('#dl-requests-table tbody');
    const noDLRequestsMessage = document.getElementById('no-dl-requests-message');

    // Clear existing rows
    dlRequestsTable.innerHTML = '';

    // Fetch DL requests
    const dlRequests = await fetchDLRequests();
    console.log('DL Requests:', dlRequests);

    if (dlRequests.length > 0) {
        dlRequestsTable.style.display = 'table';
        noDLRequestsMessage.style.display = 'none';

        // Populate the table
        dlRequests.forEach(request => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${request.event_name}</td>
                <td>${request.student_name}</td>
                <td>${request.dl_code}</td>
                <td>${request.status}</td>
                <td>
                    <button onclick="approveDLRequest(${request.id})">Approve</button>
                    <button onclick="rejectDLRequest(${request.id})">Reject</button>
                </td>
            `;
            dlRequestsTable.appendChild(row);
        });
    } else {
        dlRequestsTable.style.display = 'none';
        noDLRequestsMessage.style.display = 'block';
    }
}

// Approve a DL request
async function approveDLRequest(requestId) {
    try {
        const response = await fetch(`http://localhost/event-management-php/api/dl_requests.php?id=${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'approved' }),
        });

        if (!response.ok) {
            throw new Error('Failed to approve DL request');
        }

        const data = await response.json();
        if (data.status === 'success') {
            await displayDLRequests(); // Refresh the DL requests table
        } else {
            alert('Failed to approve DL request. Please try again.');
        }
    } catch (error) {
        console.error('Error approving DL request:', error);
        alert('Failed to approve DL request. Please try again.');
    }
}

// Reject a DL request
async function rejectDLRequest(requestId) {
    try {
        const response = await fetch(`http://localhost/event-management-php/api/dl_requests.php?id=${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'rejected' }),
        });

        if (!response.ok) {
            throw new Error('Failed to reject DL request');
        }

        const data = await response.json();
        if (data.status === 'success') {
            await displayDLRequests(); // Refresh the DL requests table
        } else {
            alert('Failed to reject DL request. Please try again.');
        }
    } catch (error) {
        console.error('Error rejecting DL request:', error);
        alert('Failed to reject DL request. Please try again.');
    }
}