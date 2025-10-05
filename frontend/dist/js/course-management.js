const API_BASE_URL =
  (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
  "http://localhost:5000/api/v1";

$(document).ready(function() {
    // Check authentication first
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('Please login first', 'danger');
        setTimeout(() => window.location.href = '/login', 1500);
        return;
    }

    // Load courses table
    loadCourses();
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Add course button
    $('#add-course-btn').click(function() {
        showCourseForm();
    });
    
    // Form submission
    $('#course-form').submit(function(e) {
        e.preventDefault();
        saveCourse();
    });
    
    // Cancel button
    $('#cancel-btn').click(function() {
        hideCourseForm();
    });
    
    // Search button
    $('#search-btn').click(function() {
        loadCourses();
    });
    
    // Search on enter
    $('#course-search').keypress(function(e) {
        if (e.which === 13) {
            loadCourses();
        }
    });
}

function loadCourses(page = 1) {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('Please login first', 'danger');
        window.location.href = '/login';
        return;
    }

    $('#courses-table-body').html(`
        <tr>
            <td colspan="6" class="text-center py-4">
                <i class="fas fa-spinner fa-spin"></i> Loading courses...
            </td>
        </tr>
    `);

    $.ajax({
        url: `${API_BASE_URL}/courses?page=${page}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            
            // Handle different response formats
            const courses = response.data?.courses || response.courses || response.data || [];
            
            if (!courses || courses.length === 0) {
                $('#courses-table-body').html(`
                    <tr>
                        <td colspan="6" class="text-center py-4">No courses found</td>
                    </tr>
                `);
                return;
            }
            
            renderCoursesTable(courses);
            
            // Only render pagination if we have pagination data
            if (response.totalPages) {
                renderPagination(response.totalPages, page);
            }
        },
        error: function(err) {
            console.error('Error loading courses:', err);
            $('#courses-table-body').html(`
                <tr>
                    <td colspan="6" class="text-center text-danger py-4">
                        Error loading courses. Please try again.
                    </td>
                </tr>
            `);
        }
    });
}

function renderCoursesTable(courses) {
    const tableBody = $('#courses-table-body');
    tableBody.empty();
    
    if (courses.length === 0) {
        tableBody.append(`
            <tr>
                <td colspan="6" class="text-center">No courses found</td>
            </tr>
        `);
        return;
    }
    
    courses.forEach(course => {
        tableBody.append(`
            <tr>
                <td>${course.code}</td>
                <td>${course.name}</td>
                <td>${course.credits}</td>
                <td>${course.duration} weeks</td>
                <td>${course.resourceCount || 0}</td>
                <td>
                    <button class="btn btn-sm btn-info view-course" data-id="${course._id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning edit-course" data-id="${course._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-course" data-id="${course._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
    
    // Add event listeners to action buttons
    $('.view-course').click(function() {
        const courseId = $(this).data('id');
        viewCourse(courseId);
    });
    
    $('.edit-course').click(function() {
        const courseId = $(this).data('id');
        loadCourseForEdit(courseId);
    });
    
    $('.delete-course').click(function() {
        const courseId = $(this).data('id');
        deleteCourse(courseId);
    });
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
        loadCourses(page);
    });
}

function showCourseForm() {
    $('#course-form-container').show();
    $('#form-title').text('Add New Course');
    $('#course-form')[0].reset();
    $('#course-id').val('');
}

function hideCourseForm() {
    $('#course-form-container').hide();
}

function loadCourseForEdit(courseId) {
    $.ajax({
        url: `${API_BASE_URL}/courses/${courseId}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function(course) {
            $('#course-form-container').show();
            $('#form-title').text('Edit Course');
            $('#course-id').val(course._id);
            $('#course-code').val(course.code);
            $('#course-name').val(course.name);
            $('#course-description').val(course.description);
            $('#course-credits').val(course.credits);
            $('#course-duration').val(course.duration);
        },
        error: function(err) {
            console.error('Error loading course:', err);
            showAlert('Failed to load course', 'danger');
        }
    });
}

function saveCourse() {
    const courseData = {
        code: $('#course-code').val(),
        name: $('#course-name').val(),
        description: $('#course-description').val(),
        credits: $('#course-credits').val(),
        duration: $('#course-duration').val()
    };
    
    const courseId = $('#course-id').val();
    const method = courseId ? 'PUT' : 'POST';
    const url = courseId ? API_BASE_URL + '/courses/' + courseId : API_BASE_URL + '/courses';
    
    $.ajax({
        url: url,
        method: method,
        data: JSON.stringify(courseData),
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function() {
            showAlert(`Course ${courseId ? 'updated' : 'added'} successfully`, 'success');
            hideCourseForm();
            loadCourses();
        },
        error: function(err) {
            console.error('Error saving course:', err);
            showAlert(`Failed to ${courseId ? 'update' : 'add'} course`, 'danger');
        }
    });
}

function viewCourse(courseId) {
    // Implement view course details functionality
    alert(`View course with ID: ${courseId}`);
}

function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    $.ajax({
        url: `${API_BASE_URL}/courses/${courseId}`,
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function() {
            showAlert('Course deleted successfully', 'success');
            loadCourses();
        },
        error: function(err) {
            console.error('Error deleting course:', err);
            showAlert('Failed to delete course', 'danger');
        }
    });
}

function showAlert(message, type) {
    const alertId = 'alert-' + Date.now();
    const alert = $(`
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `);
    
    // Remove any existing alerts first
    $('.alert-dismissible').alert('close');
    
    $('.main-content').prepend(alert);
    
    setTimeout(() => {
        $(`#${alertId}`).alert('close');
    }, 5000);
}