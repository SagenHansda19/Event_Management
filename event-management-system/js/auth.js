document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Clear previous error messages
    document.getElementById('error-message').textContent = '';

    // Get and sanitize input values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validate input fields
    if (!username || !password) {
        document.getElementById('error-message').textContent = 'Username and password are required';
        return;
    }

    // API URL
    const API_URL = 'http://localhost/event-management-php/api/auth.php';

    // Send login request
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Save user data to localStorage
            localStorage.setItem('currentUser', JSON.stringify({ username, role: data.role }));
            // Redirect based on role
            redirectBasedOnRole(data.role);
        } else {
            // Display error message
            document.getElementById('error-message').textContent = data.error || 'Invalid username or password';
        }
    })
    .catch(error => {
        console.error('Error during login:', error);
        document.getElementById('error-message').textContent = error.message || 'An error occurred during login. Please try again.';
    });
});

function redirectBasedOnRole(role) {
    switch (role) {
        case 'admin':
            window.location.href = 'admin.html';
            break;
        case 'faculty':
            window.location.href = 'faculty.html';
            break;
        case 'participant':
            window.location.href = 'participant.html';
            break;
        case 'volunteer':
            window.location.href = 'volunteer.html';
            break;
        default:
            window.location.href = 'index.html';
    }
}