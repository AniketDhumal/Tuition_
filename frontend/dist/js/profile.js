// Sidebar and FAB functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const fab = document.getElementById('fab');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    // Toggle sidebar when FAB is clicked
    if (fab && sidebar && mainContent) {
        fab.addEventListener('click', function() {
            sidebar.classList.toggle('sidebar-expanded');
            mainContent.classList.toggle('active-main');
            
            // Change icon based on state
            const icon = fab.querySelector('i');
            if (sidebar.classList.contains('sidebar-expanded')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close sidebar when clicking outside (optional)
    document.addEventListener('click', function(event) {
        if (sidebar.classList.contains('sidebar-expanded') && 
            !sidebar.contains(event.target) && 
            event.target !== fab && 
            !fab.contains(event.target)) {
            sidebar.classList.remove('sidebar-expanded');
            mainContent.classList.remove('active-main');
            const icon = fab.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Highlight current page in menu
    const currentPage = location.pathname.split('/').pop();
    document.querySelectorAll('.menu-list a').forEach(link => {
        if (link.getAttribute('href').includes(currentPage)) {
            link.classList.add('active');
        }
    });
});