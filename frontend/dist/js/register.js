const API_BASE_URL =
  (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
  "http://localhost:5000/api/v1";
document.addEventListener('DOMContentLoaded', () => {
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (sunIcon) sunIcon.classList.add('d-none');
    if (moonIcon) moonIcon.classList.remove('d-none');
  } else {
    document.body.classList.remove('dark-mode');
    if (moonIcon) moonIcon.classList.add('d-none');
    if (sunIcon) sunIcon.classList.remove('d-none');
  }
  if (sunIcon) {
    sunIcon.addEventListener('click', () => {
      document.body.classList.add('dark-mode');
      sunIcon.classList.add('d-none');
      if (moonIcon) moonIcon.classList.remove('d-none');
      localStorage.setItem('theme', 'dark');
    });
  }
  if (moonIcon) {
    moonIcon.addEventListener('click', () => {
      document.body.classList.remove('dark-mode');
      moonIcon.classList.add('d-none');
      if (sunIcon) sunIcon.classList.remove('d-none');
      localStorage.setItem('theme', 'light');
    });
  }

  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener('click', () => {
      navbarCollapse.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
      if (!navbarToggler.contains(e.target) &&
        !navbarCollapse.contains(e.target) &&
        navbarCollapse.classList.contains('show')) {
        navbarCollapse.classList.remove('show');
      }
    });
  }

  const registerForm = document.querySelector('#registerForm');
  const roleSelect = document.getElementById('role');
  const gradeField = document.getElementById('gradeField');

  if (roleSelect && gradeField) {
    gradeField.style.display = roleSelect.value === 'student' ? 'block' : 'none';
    roleSelect.addEventListener('change', () => {
      gradeField.style.display = roleSelect.value === 'student' ? 'block' : 'none';
      if (roleSelect.value !== 'student') {
        const gradeInput = document.getElementById('grade');
        if (gradeInput) {
          gradeInput.classList.remove('is-invalid');
          const feedback = gradeInput.nextElementSibling;
          if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = '';
          }
        }
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formElements = e.target.elements;
      const formData = {
        name: formElements.username?.value.trim() || '',
        email: formElements.email?.value.trim() || '',
        password: formElements.password?.value || '',
        confirmPassword: formElements.confirmPassword?.value || '',
        role: formElements.role?.value || 'student',
        grade: formElements.grade?.value || ''
      };

      const errors = validateForm(formData);
      if (Object.keys(errors).length > 0) {
        showFormErrors(errors);
        return;
      }

      const submitBtn = formElements['submit-btn'];
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            ...(formData.role === 'student' && { grade: formData.grade })
          })
        });

        const text = await res.text();
        console.log('STATUS:', res.status);
        console.log('RESPONSE TEXT:', text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = text;
        }
        console.log('PARSED:', data);

        const extractMessage = (payload) => {
          if (!payload) return `Request failed with status ${res.status}`;
          if (typeof payload === 'string') return payload;
          if (payload.error) {
            if (Array.isArray(payload.error)) return payload.error.join(', ');
            if (typeof payload.error === 'string') return payload.error;
          }
          if (payload.message) return payload.message;
          const values = Object.values(payload).filter(v => typeof v === 'string');
          if (values.length) return values.join(', ');
          return `Request failed with status ${res.status}`;
        };

        if (!res.ok) {
          const friendly = extractMessage(data);
          showFormErrors({ server: friendly });
          return;
        }

        const successMessage = (typeof data === 'object' && (data.message || data.success))
          ? (data.message || 'Registration successful')
          : 'Registration successful';

        showSuccessMessage(successMessage);
        setTimeout(() => {
          window.location.href = '../template/login.html';
        }, 2000);

      } catch (error) {
        console.error('Registration error:', error);
        showFormErrors({ server: error.message || 'Registration failed' });
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Register';
        }
      }
    });
  }

  function validateForm(data) {
    const errors = {};
    if (!data.name) {
      errors.username = 'Name is required';
    } else if (data.name.length < 3) {
      errors.username = 'Name must be at least 3 characters';
    }
    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (data.role === 'student' && !data.grade) {
      errors.grade = 'Grade is required for students';
    }
    return errors;
  }

  function showFormErrors(errors) {
    document.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    Object.entries(errors).forEach(([field, message]) => {
      const input = document.getElementById(field);
      if (input) {
        input.classList.add('is-invalid');
        let feedback = input.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
          feedback = document.createElement('div');
          feedback.className = 'invalid-feedback';
          input.parentNode.appendChild(feedback);
        }
        feedback.textContent = message;
      } else if (field === 'server') {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger mt-3';
        alertDiv.textContent = message;
        const existingAlert = registerForm.querySelector('.alert');
        if (existingAlert) {
          registerForm.replaceChild(alertDiv, existingAlert);
        } else {
          registerForm.appendChild(alertDiv);
        }
        setTimeout(() => alertDiv.remove(), 5000);
      }
    });
  }

  function showSuccessMessage(message) {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) existingAlert.remove();
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success mt-3';
    alertDiv.textContent = message;
    registerForm.parentNode.insertBefore(alertDiv, registerForm.nextSibling);
    setTimeout(() => alertDiv.remove(), 5000);
  }
});
