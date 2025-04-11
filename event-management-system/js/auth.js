document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        document.getElementById('error-message').textContent = '';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            showError('Username and password are required');
            return;
        }

        authenticateUser(username, password);
    });
});

async function authenticateUser(username, password) {
    const API_URL = 'http://localhost/event-management-php/api/auth.php';
    
    try {
        console.log('Starting authentication for:', username);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        console.log('Auth response status:', response.status);
        
        const data = await response.json();
        console.log('Auth response data:', data);

        if (!data.success) {
            throw new Error(data.error || 'Authentication failed');
        }

        // Store minimal user data
        localStorage.setItem('currentUser', JSON.stringify({
            id: data.user_id,
            username,
            role: data.role
        }));

        console.log('Authentication successful, role:', data.role);
        redirectBasedOnRole(data.role);

    } catch (error) {
        console.error('Authentication error:', error);
        showError(error.message || 'Login failed. Please try again.');
    }
}

function handleResponse(response) {
    if (!response.ok) {
        return response.text().then(text => {
            throw new Error(text || 'Network error');
        });
    }
    return response.json();
}

function handleNetworkError(error) {
    console.error('Login error:', error);
    showError(error.message || 'Login failed. Please try again.');
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function redirectBasedOnRole(role) {
    // Normalize role to lowercase
    const normalizedRole = String(role).toLowerCase().trim();
    console.log('Normalized role:', normalizedRole);

    const roleMap = {
        'admin': 'admin.html',
        'faculty': 'faculty.html',
        'participant': 'student.html',
        'student': 'student.html',
        'volunteer': 'student.html'
    };

    const targetPage = roleMap[normalizedRole] || 'index.html';
    console.log('Redirecting to:', targetPage);
    window.location.href = targetPage;
}