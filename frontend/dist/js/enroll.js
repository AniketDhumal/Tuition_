const API_BASE_URL =
  (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
  "http://localhost:5000/api/v1";
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Get form elements
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Get form values
  const formData = {
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    course: document.getElementById('course').value,
    address: document.getElementById('message').value.trim()
  };

  // Client-side validation
  if (!formData.fullName || !formData.email || !formData.phone || 
      !formData.course || !formData.address) {
    alert('Please fill in all required fields');
    return;
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    alert('Please enter a valid email address');
    return;
  }

  try {
    // Disable submit button during request
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Send enrollment data
    const response = await fetch(`${API_BASE_URL}/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Enrollment failed');
    }

    // Success handling
    alert(`Enrollment successful! We'll contact you soon.`);
    form.reset(); // Reset form fields
    
  } catch (error) {
    console.error('Enrollment error:', error);
    alert(`Error: ${error.message}`);
    
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Enrollment';
  }
});