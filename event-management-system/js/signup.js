// Initialize users in localStorage if not exists
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
        {
            username: 'admin',
            password: 'admin123',
            role: 'admin'
        }
    ]));
}

// Signup form handler
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const role = document.getElementById('role').value;
    
    // Validate inputs
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (username.length < 3) {
        alert('Username must be at least 3 characters');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    // Check if username already exists
    const users = JSON.parse(localStorage.getItem('users'));
    if (users.some(user => user.username === username)) {
        alert('Username already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        username,
        password,
        role
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Account created successfully! Please login.');
    window.location.href = 'login.html';
});
