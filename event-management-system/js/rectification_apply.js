const API_BASE = 'http://localhost/event-management-php/api';

// Notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', async () => {
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');
    const regId = urlParams.get('reg_id');

    // Validate required parameters
    if (!eventId || !regId) {
        showNotification('Missing required parameters in URL', 'error');
        setTimeout(() => window.location.href = 'attendance.html', 2000);
        return;
    }

    // Set form values
    document.getElementById('event-id').value = eventId;
    document.getElementById('registration-id').value = regId;

    // Load event details
    try {
        await loadEventDetails(eventId);
    } catch (error) {
        console.error('Error loading event details:', error);
        showNotification('Failed to load event details', 'error');
    }

    // Add form submit handler
    const form = document.getElementById('rectification-form');
    if (form) {
        form.addEventListener('submit', submitRectification);
    }
});

async function loadEventDetails(eventId) {
    const response = await fetch(`${API_BASE}/events.php?id=${eventId}`, {
        credentials: 'include'
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch event details');
    }
    
    const data = await response.json();
    if (data.length > 0) {
        document.getElementById('event-title').textContent = data[0].name;
    }
}

async function submitRectification(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const data = {
            registration_id: document.getElementById('registration-id').value,
            event_id: document.getElementById('event-id').value,
            reason: document.getElementById('reason').value
        };

        // Debug: log the data being sent
        console.log('Submitting:', data);

        const response = await fetch(`${API_BASE}/request_rectification.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        // Debug: log raw response
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Invalid server response: ${responseText.substring(0, 100)}`);
        }
        
        if (!response.ok) {
            throw new Error(responseData.message || `Request failed with status ${response.status}`);
        }

        showNotification('Rectification submitted successfully!');
        setTimeout(() => window.location.href = 'rectifications.html', 1500);
        
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Failed to submit rectification', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}