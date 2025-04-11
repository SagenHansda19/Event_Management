const API_BASE = 'http://localhost/event-management-php/api';
let currentRectificationId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadRectifications();
    setupModal();
    setActiveNav();
});

async function loadRectifications() {
     const tableBody = document.querySelector('#rectifications-table tbody');
     const noRequestsMsg = document.getElementById('no-requests');
     const loadingIndicator = document.getElementById('loading-indicator');
     
     // Show loading
     tableBody.innerHTML = '';
     loadingIndicator.style.display = 'block';
     noRequestsMsg.style.display = 'none';
 
     try {
         const response = await fetch(`${API_BASE}/get_pending_rectifications.php`, {
             credentials: 'include'
         });
         
         // Handle 403 specifically
         if (response.status === 403) {
             window.location.href = 'login.html';
             return;
         }
         
         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
         }
         
         const data = await response.json();
         
         if (!Array.isArray(data.data)) {
             throw new Error('Invalid data format received');
         }
         
         renderRectifications(data.data);
     } catch (error) {
         console.error('Error:', error);
         tableBody.innerHTML = `
             <tr class="error-row">
                 <td colspan="5">${error.message.includes('403') ? 
                     'Please login as faculty to access this page' : 
                     `Error loading data: ${error.message}`}
                 </td>
             </tr>
         `;
     } finally {
         loadingIndicator.style.display = 'none';
     }
 }

function renderRectifications(rectifications) {
    const tableBody = document.querySelector('#rectifications-table tbody');
    const noRequestsMsg = document.getElementById('no-requests');
    
    tableBody.innerHTML = '';
    noRequestsMsg.style.display = rectifications.length ? 'none' : 'block';

    rectifications.forEach(rect => {
        const row = document.createElement('tr');
        row.dataset.id = rect.id;
        row.innerHTML = `
            <td>${escapeHtml(rect.student_name)}</td>
            <td>${escapeHtml(rect.event_name)}</td>
            <td>${new Date(rect.created_at).toLocaleString()}</td>
            <td class="reason">${truncate(rect.reason, 50)}</td>
            <td><button class="review-btn">Review</button></td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll('.review-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rectId = e.target.closest('tr').dataset.id;
            showReviewModal(rectId);
        });
    });
}

function setupModal() {
    const modal = document.getElementById('review-modal');
    
    document.getElementById('cancel-review').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    document.getElementById('approve-btn').addEventListener('click', () => {
        updateStatus('approved');
    });
    
    document.getElementById('reject-btn').addEventListener('click', () => {
        updateStatus('rejected');
    });
}

async function showReviewModal(rectId) {
    currentRectificationId = rectId;
    const modal = document.getElementById('review-modal');
    const details = document.getElementById('review-details');
    
    // In a real app, you might fetch full details here
    const row = document.querySelector(`tr[data-id="${rectId}"]`);
    details.innerHTML = `
        <p><strong>Student:</strong> ${row.cells[0].textContent}</p>
        <p><strong>Event:</strong> ${row.cells[1].textContent}</p>
        <p><strong>Reason:</strong> ${row.querySelector('.reason').textContent}</p>
    `;
    
    modal.style.display = 'block';
}

async function updateStatus(status) {
     if (!currentRectificationId) return;
     const notes = document.getElementById('resolution-notes').value;
     
     if (status === 'rejected' && !notes.trim()) {
         alert('Please provide a reason for rejection');
         return;
     }
 
     try {
         const response = await fetch(`${API_BASE}/update_rectification_status.php`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 rectification_id: currentRectificationId,
                 status: status,
                 notes: notes
             }),
             credentials: 'include'
         });
 
         const text = await response.text();
         
         // Try to parse JSON, but fallback to text if invalid
         let result;
         try {
             result = JSON.parse(text);
         } catch (e) {
             throw new Error(`Server response: ${text}`);
         }
 
         if (!response.ok) {
             throw new Error(result.message || 'Request failed');
         }
 
         alert(`Request ${status} successfully`);
         document.getElementById('review-modal').style.display = 'none';
         loadRectifications();
         
     } catch (error) {
         console.error('Error:', error);
         alert(`Failed to update: ${error.message}`);
     }
 }

// Helper functions
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function truncate(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
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