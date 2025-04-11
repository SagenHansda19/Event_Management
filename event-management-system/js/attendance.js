const API_BASE = 'http://localhost/event-management-php/api';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadAttendanceRecords();
    } catch (error) {
        console.error('Error loading attendance:', error);
        showNotification('Failed to load attendance records', 'error');
    }
});

async function loadAttendanceRecords() {
    try {
        const response = await fetch(`${API_BASE}/get_attendance.php`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        renderAttendanceData(data);
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

function renderAttendanceData(data) {
    const tableBody = document.querySelector('#attendance-table tbody');
    const noRecordsMsg = document.getElementById('no-attendance-message');
    
    tableBody.innerHTML = '';
    
    if (data.data && data.data.length > 0) {
        noRecordsMsg.style.display = 'none';
        
        data.data.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(record.event_name)}</td>
                <td>${formatDate(record.event_date)}</td>
                <td class="attendance-status ${record.attended ? 'present' : 'absent'}">
                    ${record.attended ? 'Present' : 'Absent'}
                </td>
                <td>
                    ${!record.attended ? `
                        <button class="rectify-btn" 
                                data-event-id="${record.event_id}"
                                data-reg-id="${record.registration_id}">
                            Request Rectification
                        </button>
                    ` : 'N/A'}
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        setupRectifyButtons();
    } else {
        noRecordsMsg.style.display = 'block';
    }
}

function setupRectifyButtons() {
    document.querySelectorAll('.rectify-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = `rectification_apply.html?event_id=${btn.dataset.eventId}&reg_id=${btn.dataset.regId}`;
        });
    });
}

// Utility functions
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

window.toggleProfileDropdown = () => {
     document.getElementById('profile-dropdown').classList.toggle('active');
};
 
window.viewProfile = () => {
     // Implement profile viewing logic
     alert('Profile view not implemented yet');
};

async function logout() {
     const response = await fetch(`${API_BASE}/logout.php`, {
         method: 'POST',
     }).then(() => {
         window.location.href = 'login.html';
     });
}