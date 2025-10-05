document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('theme-toggle');
    const body = document.body;
  
    // Apply saved theme on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }
  
    // Add smooth transition class for theme changes
    const addTransition = () => {
      body.classList.add('theme-transition');
      window.setTimeout(() => {
        body.classList.remove('theme-transition');
      }, 500); // Adjust duration to match your CSS transition duration
    };
  
    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        addTransition();
  
        if (body.classList.contains('dark-mode')) {
          body.classList.replace('dark-mode', 'light-mode');
          localStorage.setItem('theme', 'light');
        } else {
          body.classList.replace('light-mode', 'dark-mode');
          localStorage.setItem('theme', 'dark');
        }
      });
    }
  });
  