const API_BASE = 'http://localhost/event-management-php/api';

document.addEventListener('DOMContentLoaded', () => {
    loadRectifications();
    
    // Setup event listeners
    document.getElementById('status-filter').addEventListener('change', loadRectifications);
    document.getElementById('refresh-btn').addEventListener('click', loadRectifications);
    
    // Modal close button
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('evidence-modal').style.display = 'none';
    });
});

async function loadRectifications() {
     const statusFilter = document.getElementById('status-filter').value;
     const tableBody = document.querySelector('#rectifications-table tbody');
     const noRecordsMsg = document.getElementById('no-rectifications-message');
     
     // Show loading state
     tableBody.innerHTML = '<tr class="loading-row"><td colspan="5">Loading rectifications...</td></tr>';
     noRecordsMsg.style.display = 'none';
     
     try {
         let url = `${API_BASE}/get_my_rectifications.php`;
         if (statusFilter !== 'all') {
             url += `?status=${statusFilter}`;
         }
         
         const response = await fetch(url, {
             credentials: 'include', // Required for cookies
             headers: {
                 'Accept': 'application/json'
             }
         });
         
         // First check if unauthorized
         if (response.status === 401) {
             window.location.href = 'login.html';
             return;
         }
         
         // Then check for other errors
         if (!response.ok) {
             const error = await response.json().catch(() => ({}));
             throw new Error(error.message || 'Failed to fetch data');
         }
         
         const data = await response.json();
         renderRectifications(data.data || []);
     } catch (error) {
         console.error('Error:', error);
         tableBody.innerHTML = `
             <tr class="error-row">
                 <td colspan="5">
                     ${error.message}
                     <button onclick="loadRectifications()" class="retry-btn">Retry</button>
                 </td>
             </tr>
         `;
     }
 }

function renderRectifications(rectifications) {
    const tableBody = document.querySelector('#rectifications-table tbody');
    const noRecordsMsg = document.getElementById('no-rectifications-message');
    
    tableBody.innerHTML = '';
    
    if (rectifications.length === 0) {
        noRecordsMsg.style.display = 'block';
        return;
    }
    
    noRecordsMsg.style.display = 'none';
    
    rectifications.forEach(rect => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(rect.event_name)}</td>
            <td>${formatDateTime(rect.created_at)}</td>
            <td class="status-cell ${rect.status}">
                <span class="status-badge ${rect.status}">${rect.status.toUpperCase()}</span>
                ${rect.resolved_at ? `<br><small>${formatDateTime(rect.resolved_at)}</small>` : ''}
            </td>
            <td class="reason-cell">${escapeHtml(rect.reason)}</td>
            <td>
                ${rect.evidence_path ? 
                    `<button class="view-evidence-btn" data-path="${rect.evidence_path}">View</button>` : 
                    'None'}
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to evidence buttons
    document.querySelectorAll('.view-evidence-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showEvidence(btn.dataset.path);
        });
    });
}

function showEvidence(path) {
    const modal = document.getElementById('evidence-modal');
    const content = document.getElementById('evidence-content');
    
    // Check file type (simplified - would need proper server-side check)
    if (path.match(/\.(jpg|jpeg|png|gif)$/i)) {
        content.innerHTML = `<img src="${path}" alt="Evidence" style="max-width: 100%;">`;
    } else if (path.match(/\.(pdf)$/i)) {
        content.innerHTML = `
            <embed src="${path}" type="application/pdf" width="100%" height="600px">
            <p><a href="${path}" download>Download PDF</a></p>
        `;
    } else {
        content.innerHTML = `
            <p>File type not previewable</p>
            <p><a href="${path}" download>Download File</a></p>
        `;
    }
    
    modal.style.display = 'block';
}

// Utility functions
function formatDateTime(datetimeString) {
    if (!datetimeString) return 'N/A';
    try {
        const date = new Date(datetimeString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return datetimeString;
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Global functions
window.toggleProfileDropdown = () => {
    document.getElementById('profile-dropdown').classList.toggle('active');
};

window.viewProfile = () => {
    window.location.href = 'profile.html';
};

window.logout = async () => {
    try {
        await fetch(`${API_BASE}/logout.php`, {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed:', error);
    }
};