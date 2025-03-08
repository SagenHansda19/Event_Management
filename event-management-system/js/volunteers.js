// Initialize volunteer data in localStorage if not exists
if (!localStorage.getItem('volunteers')) {
    localStorage.setItem('volunteers', JSON.stringify([]));
}

// Function to display registered volunteers
function displayVolunteers() {
    const volunteers = JSON.parse(localStorage.getItem('volunteers'));
    const container = document.getElementById('volunteers');
    container.innerHTML = '';

    volunteers.forEach(volunteer => {
        const volunteerDiv = document.createElement('div');
        volunteerDiv.className = 'volunteer-item';
        volunteerDiv.innerHTML = `
            <h3>${volunteer.name}</h3>
            <p>Email: ${volunteer.email}</p>
            ${volunteer.phone ? `<p>Phone: ${volunteer.phone}</p>` : ''}
        `;
        container.appendChild(volunteerDiv);
    });
}

// Volunteer registration form handler
document.getElementById('volunteer-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const newVolunteer = {
        id: Date.now(),
        name: document.getElementById('volunteer-name').value,
        email: document.getElementById('volunteer-email').value,
        phone: document.getElementById('volunteer-phone').value || null
    };

    const volunteers = JSON.parse(localStorage.getItem('volunteers'));
    volunteers.push(newVolunteer);
    localStorage.setItem('volunteers', JSON.stringify(volunteers));

    displayVolunteers();
    document.getElementById('volunteer-form').reset();
});

// Initialize volunteers on page load
document.addEventListener('DOMContentLoaded', displayVolunteers);
