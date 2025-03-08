// volunteer.js

// Function to display the list of tasks for volunteers
function displayTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Clear existing task list
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const registrations = JSON.parse(localStorage.getItem('registrations')) || {};
    const userTasks = registrations[currentUser.id] || [];

    userTasks.forEach(taskId => {
        const event = JSON.parse(localStorage.getItem('events')).find(event => event.id === taskId);
        if (event) {
            taskList.innerHTML += `<p>${event.name} - ${event.date}</p>`;
        }
    });
}

// Initialize the volunteer dashboard
document.addEventListener('DOMContentLoaded', () => {
    displayTasks();
});
