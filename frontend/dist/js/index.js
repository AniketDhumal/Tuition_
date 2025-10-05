// Dark/Light Mode Toggle
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

// Toggle dark/light mode
sunIcon.addEventListener('click', () => {
    document.body.classList.add('dark-mode');
    sunIcon.classList.add('d-none');
    moonIcon.classList.remove('d-none');
    localStorage.setItem('theme', 'dark');
});

moonIcon.addEventListener('click', () => {
    document.body.classList.remove('dark-mode');
    moonIcon.classList.add('d-none');
    sunIcon.classList.remove('d-none');
    localStorage.setItem('theme', 'light');
});

// Load theme from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        sunIcon.classList.add('d-none');
        moonIcon.classList.remove('d-none');
    }
});

// Navbar Toggle
const navbarToggler = document.querySelector('.navbar-toggler');
const navbarCollapse = document.getElementById('navbarNav');

// Function to close navbar after clicking a link
const closeNavbar = () => {
    if (window.innerWidth <= 992) {  // Only apply on small screens
        navbarCollapse.classList.remove('show');
    }
};

// Add event listener to each nav link to close navbar when clicked
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', closeNavbar);
});

// Close the navbar if clicked outside of it (optional feature for mobile)
document.addEventListener('click', (e) => {
    if (!navbarToggler.contains(e.target) && !navbarCollapse.contains(e.target)) {
        navbarCollapse.classList.remove('show');
    }
});

// Prevent multiple toggle when double-clicking
navbarToggler.addEventListener('click', () => {
    if (navbarCollapse.classList.contains('show')) {
        navbarCollapse.classList.remove('show');
    }
});

// Handle form submission with a success message
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', (event) => {
    event.preventDefault();  // Prevent actual form submission

    // Display a success message
    alert('Registration successful! Welcome to Bright Learning Path.');

    // Optionally, you can redirect the user to another page after successful submission
    // window.location.href = "login.html";
});
