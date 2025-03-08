// Function to generate analytics data
function generateAnalytics() {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const volunteers = JSON.parse(localStorage.getItem('volunteers')) || [];

    // Prepare data for charts
    const eventTypes = {};
    const attendanceData = [];
    const volunteerData = [];

    events.forEach(event => {
        // Event types distribution
        const type = event.type || 'General';
        eventTypes[type] = (eventTypes[type] || 0) + 1;

        // Attendance data
        attendanceData.push({
            label: event.name,
            data: event.attendees?.length || 0
        });

        // Volunteer data
        volunteerData.push({
            label: event.name,
            data: event.volunteers?.length || 0
        });
    });

    // Create the main chart
    const ctx = document.getElementById('eventsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: attendanceData.map(d => d.label),
            datasets: [{
                label: 'Attendees',
                data: attendanceData.map(d => d.data),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'Volunteers',
                data: volunteerData.map(d => d.data),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize analytics on page load
document.addEventListener('DOMContentLoaded', generateAnalytics);
