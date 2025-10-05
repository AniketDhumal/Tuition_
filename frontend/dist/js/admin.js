$(document).ready(function() {
    // Fetch dashboard statistics
    fetchDashboardStats();
    
    // Fetch recent activities
    fetchRecentActivities();
    
    // Initialize theme toggle
    initializeTheme();
});

function fetchDashboardStats() {
    $.ajax({
        url: '/api/admin/stats',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function(data) {
            $('#total-resources').text(data.totalResources);
            $('#total-courses').text(data.totalCourses);
            $('#total-results').text(data.totalResults);
            $('#total-downloads').text(data.totalDownloads);
        },
        error: function(err) {
            console.error('Error fetching dashboard stats:', err);
        }
    });
}

function fetchRecentActivities() {
    $.ajax({
        url: '/api/admin/activities',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function(data) {
            const activitiesList = $('#recent-activities');
            activitiesList.empty();
            
            data.activities.forEach(activity => {
                activitiesList.append(`
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="${getActivityIcon(activity.type)}"></i>
                        </div>
                        <div class="activity-content">
                            <h5>${activity.title}</h5>
                            <p>${activity.description}</p>
                            <small>${new Date(activity.date).toLocaleString()}</small>
                        </div>
                    </div>
                `);
            });
        },
        error: function(err) {
            console.error('Error fetching recent activities:', err);
        }
    });
}

function getActivityIcon(type) {
    const icons = {
        'resource': 'fas fa-file-alt',
        'course': 'fas fa-book',
        'result': 'fas fa-graduation-cap',
        'system': 'fas fa-cog',
        'download': 'fas fa-download'
    };
    return icons[type] || 'fas fa-bell';
}

function initializeTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        $('body').addClass('dark-theme');
        $('#sun-icon').addClass('d-none');
        $('#moon-icon').removeClass('d-none');
    }
    
    $('#theme-toggle').click(function() {
        $('body').toggleClass('dark-theme');
        $('#sun-icon').toggleClass('d-none');
        $('#moon-icon').toggleClass('d-none');
        
        const newTheme = $('body').hasClass('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
    });
}