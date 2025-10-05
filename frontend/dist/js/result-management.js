const API_BASE_URL =
  (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
  "http://localhost:5000/api/v1";

// Initialize with sequential loading to prevent rate limiting
$(document).ready(function() {
    initializePage();
    setupEventListeners();
});

async function initializePage() {
    try {
        await loadCoursesForFilter();
        await loadStudents();
        await loadCourses();
        await loadResults();
    } catch (error) {
        console.error('Initialization error:', error);
        showAlert('Failed to initialize page data. Please try again later.', 'danger');
    }
}

function setupEventListeners() {
    // Add result button
    $('#add-result-btn').click(function() {
        showResultForm();
    });
    
    // Import results button
    $('#import-results-btn').click(function() {
        showImportForm();
    });
    
    // Form submission
    $('#result-form').submit(function(e) {
        e.preventDefault();
        saveResult();
    });
    
    // Import form submission
    $('#import-form').submit(function(e) {
        e.preventDefault();
        importResults();
    });
    
    // Cancel buttons
    $('#cancel-btn').click(function() {
        hideResultForm();
    });
    
    $('#cancel-import-btn').click(function() {
        hideImportForm();
    });
    
    // Filter changes
    $('#course-filter, #semester-filter').change(function() {
        loadResults();
    });
}

async function loadCoursesForDropdown(selector, emptyOptionText = 'Select Course') {
    try {
        console.log("Fetching courses from API...");
        const response = await $.ajax({
            url: `${API_BASE_URL}/courses`,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        console.log("Raw API response:", response);

        const dropdown = $(selector);
        dropdown.empty().append(`<option value="">${emptyOptionText}</option>`);
        
        // Handle your specific response format
        let courses = [];
        if (response.status === 'success' && response.data && response.data.courses) {
            courses = response.data.courses;
        } else if (Array.isArray(response)) {
            courses = response;
        } else if (response.data && Array.isArray(response.data)) {
            courses = response.data;
        }

        if (!Array.isArray(courses) || courses.length === 0) {
            console.error("No valid courses array found in response:", response);
            showAlert('No courses available or invalid data format.', 'warning');
            return [];
        }

        console.log(`Processing ${courses.length} courses`);
        
        courses.forEach(course => {
            if (course && course._id && course.code && course.name) {
                dropdown.append(`<option value="${course._id}">${course.code} - ${course.name}</option>`);
            } else {
                console.warn('Invalid course data:', course);
            }
        });

        console.log(`Successfully loaded ${courses.length} courses to ${selector}`);
        return courses;
    } catch (error) {
        console.error('Error loading courses:', error);
        showAlert('Failed to load courses. Please try again later.', 'danger');
        throw error;
    }
}

async function loadCoursesForFilter() {
    return loadCoursesForDropdown('#course-filter', 'All Courses');
}

async function loadCourses() {
    return loadCoursesForDropdown('#result-course', 'Select Course');
}

async function loadStudents() {
    try {
      const response = await $.ajax({
        url: `${API_BASE_URL}/auth/students`,  // Correct endpoint
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
  
      console.log("Students response:", response);
  
      const dropdown = $('#result-student');
      dropdown.empty().append('<option value="">Select Student</option>');
  
      if (response.data?.students) {
        response.data.students.forEach(student => {
          dropdown.append(
            `<option value="${student._id}">${student.name} (${student.email})</option>`
          );
        });
      }
    } catch (error) {
      console.error('Error loading students:', error);
      showAlert(
        error.status === 404 
          ? 'Students endpoint not configured' 
          : 'Failed to load students',
        'danger'
      );
    }
  }
  
async function loadResults(page = 1) {
    try {
      const response = await $.ajax({
        url: `${API_BASE_URL}/results`,
        method: 'GET',
        data: { page },
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      
      if (!response.data || !response.data.results) {
        throw new Error('Invalid response format');
      }
      
      renderResultsTable(response.data.results);
      renderPagination(response.data.totalPages, page);
    } catch (error) {
      console.error('Error loading results:', {
        status: error.status,
        responseText: error.responseText,
        message: error.message
      });
      showAlert('Failed to load results. Please try again later.', 'danger');
    }
  }

function renderResultsTable(results) {
    const tableBody = $('#results-table-body');
    tableBody.empty();
    
    if (results.length === 0) {
        tableBody.append(`
            <tr>
                <td colspan="7" class="text-center">No results found</td>
            </tr>
        `);
        return;
    }
    
    results.forEach(result => {
        if (!result.student || !result.course) {
            console.warn('Invalid result data:', result);
            return;
        }
        
        const date = result.date ? new Date(result.date).toLocaleDateString() : 'N/A';
        tableBody.append(`
            <tr>
                <td>${result.student.name || 'N/A'}</td>
                <td>${result.course.code || 'N/A'} - ${result.course.name || 'N/A'}</td>
                <td>Semester ${result.semester || 'N/A'}</td>
                <td>${result.score || 'N/A'}</td>
                <td><span class="badge badge-${getGradeBadge(result.grade)}">${result.grade || 'N/A'}</span></td>
                <td>${date}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-result" data-id="${result._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-result" data-id="${result._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
    
    // Add event listeners to action buttons
    $('.edit-result').click(function() {
        const resultId = $(this).data('id');
        loadResultForEdit(resultId);
    });
    
    $('.delete-result').click(function() {
        const resultId = $(this).data('id');
        deleteResult(resultId);
    });
}

function getGradeBadge(grade) {
    const badges = {
        'A': 'success',
        'B': 'primary',
        'C': 'info',
        'D': 'warning',
        'F': 'danger'
    };
    return badges[grade] || 'secondary';
}

function renderPagination(totalPages, currentPage) {
    const pagination = $('#pagination');
    pagination.empty();
    
    if (totalPages <= 1) return;
    
    // Previous button
    pagination.append(`
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>
    `);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        pagination.append(`
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `);
    }
    
    // Next button
    pagination.append(`
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>
    `);
    
    // Add event listeners to pagination buttons
    $('.page-link').click(function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        loadResults(page);
    });
}

function showResultForm() {
    $('#result-form-container').show();
    $('#import-form-container').hide();
    $('#form-title').text('Add New Result');
    $('#result-form')[0].reset();
    $('#result-id').val('');
}

function hideResultForm() {
    $('#result-form-container').hide();
}

function showImportForm() {
    $('#import-form-container').show();
    $('#result-form-container').hide();
    $('#import-form')[0].reset();
}

function hideImportForm() {
    $('#import-form-container').hide();
}

async function loadResultForEdit(resultId) {
    try {
        // First load all courses and students
        await Promise.all([loadCourses(), loadStudents()]);
        
        const result = await $.ajax({
            url: `${API_BASE_URL}/results/${resultId}`,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        // Add validation for the response
        if (!result || !result.data || !result.data.result) {
            throw new Error('Invalid result data structure');
        }

        const resultData = result.data.result;
        
        // Validate student data exists
        if (!resultData.student || !resultData.student._id) {
            console.error('Invalid student reference in result:', resultData);
            throw new Error('Student data not found in result');
        }

        $('#result-form-container').show();
        $('#import-form-container').hide();
        $('#form-title').text('Edit Result');
        $('#result-id').val(resultData._id);
        $('#result-student').val(resultData.student._id);
        $('#result-course').val(resultData.course._id);
        $('#result-semester').val(resultData.semester);
        $('#result-grade').val(resultData.grade);
        $('#result-score').val(resultData.score);
    } catch (error) {
        console.error('Detailed error loading result:', {
            message: error.message,
            response: error.responseJSON
        });
        showAlert('Failed to load result for editing. Please try again.', 'danger');
    }
}

async function saveResult() {
    try {
        const resultId = $('#result-id').val();
        const method = resultId ? 'PUT' : 'POST'; // Using PUT for updates
        const url = resultId ? `${API_BASE_URL}/results/${resultId}` : `${API_BASE_URL}/results`;
        
        const data = {
            student: $('#result-student').val(),
            course: $('#result-course').val(),
            semester: $('#result-semester').val(),
            score: $('#result-score').val()
        };

        const response = await $.ajax({
            url: url,
            method: method,
            data: JSON.stringify(data),
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        showAlert(resultId ? 'Result updated!' : 'Result created!', 'success');
        hideResultForm();
        await loadResults();
        
    } catch (error) {
        console.error('Operation failed:', {
            status: error.status,
            response: error.responseJSON,
            message: error.message
        });
        
        showAlert(
            error.responseJSON?.message || 
            (error.status === 0 ? 'Network error - check CORS' : 'Operation failed'),
            'danger'
        );
    }
}

async function importResults() {
    try {
        const fileInput = $('#import-file')[0];
        if (!fileInput.files.length) {
            showAlert('Please select a file to import', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('resultsFile', fileInput.files[0]);
        
        await $.ajax({
            url: `${API_BASE_URL}/results/import`,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        showAlert('Results imported successfully', 'success');
        hideImportForm();
        await loadResults();
    } catch (error) {
        console.error('Error importing results:', error);
        showAlert('Failed to import results. Please check the file format and try again.', 'danger');
    }
}

async function deleteResult(resultId) {
    if (!confirm('Are you sure you want to delete this result? This action cannot be undone.')) return;
    
    try {
        await $.ajax({
            url: `${API_BASE_URL}/results/${resultId}`,
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        showAlert('Result deleted successfully', 'success');
        await loadResults();
    } catch (error) {
        console.error('Error deleting result:', error);
        showAlert('Failed to delete result', 'danger');
    }
}

function showAlert(message, type) {
    const alert = $(`
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `);
    
    $('.main-content').prepend(alert);
    
    setTimeout(() => {
        alert.alert('close');
    }, 5000);
}