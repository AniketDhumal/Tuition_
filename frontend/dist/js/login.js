const API_BASE_URL =
  (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
  "http://localhost:5000/api/v1";
document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };
  
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include' // for cookies
      });
  
      const data = await response.json();
        
        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            
            // Redirect based on role
            if (data.data.role === 'teacher') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('Login failed. Please try again.');
    }
});