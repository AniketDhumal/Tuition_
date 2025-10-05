const API_BASE_URL =
  (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
  "http://localhost:5000/api/v1";
let currentPage = 1;
const itemsPerPage = 10;

$(document).ready(function() {
    initializeResourceManagement();
});

function initializeResourceManagement() {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('Please login to access resources', 'danger');
        setTimeout(() => window.location.href = '/login', 1500);
        return;
    }
    
    loadCourses();
    
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const resourceId = urlParams.get('id');

    if (action === 'add') {
        showResourceForm();
    } else if (action === 'edit' && resourceId) {
        loadResourceForEdit(resourceId);
    }

    setupEventListeners();
    loadResources();
}

function loadCourses() {
    makeAuthenticatedRequest({
        url: `${API_BASE_URL}/courses?isActive=true`,
        method: 'GET',
        success: function(response) {
            let courses = [];
            
            if (response.data && response.data.courses) {
                courses = response.data.courses;
            } else if (Array.isArray(response)) {
                courses = response;
            } else if (response.data && Array.isArray(response.data)) {
                courses = response.data;
            }
            
            const dropdown = $('#resource-course');
            dropdown.empty().append('<option value="">Select Course</option>');
            
            if (courses.length > 0) {
                courses.forEach(course => {
                    const optionText = course.code ? 
                        `${course.code} - ${course.name}` : 
                        course.name;
                    dropdown.append(`<option value="${course._id}">${optionText}</option>`);
                });
            } else {
                dropdown.append('<option value="" disabled>No courses available</option>');
                if (Array.isArray(courses)) {
                    showAlert('No courses found in system', 'warning');
                }
            }
        },
        error: function(xhr) {
            $('#resource-course').html('<option value="">Error loading courses</option>');
            showAlert('Failed to load courses. Please try again.', 'danger');
        }
    });
}

function setupEventListeners() {
    $('#resource-type').change(function() {
        const type = $(this).val();
        if (type === 'link') {
            $('#file-upload-group').hide();
            $('#external-link-group').show();
            $('#resource-link').prop('required', true);
            $('#resource-file').prop('required', false);
        } else {
            $('#file-upload-group').show();
            $('#external-link-group').hide();
            $('#resource-file').prop('required', true);
            $('#resource-link').prop('required', false);
        }
    });

    $('#resource-form').submit(function(e) {
        e.preventDefault();
        saveResource();
    });

    $('#cancel-btn').click(function() {
        hideResourceForm();
    });

    $('#search-btn').click(function() {
        loadResources();
    });

    $('#resource-search').keypress(function(e) {
        if (e.which === 13) {
            loadResources();
        }
    });

    $('#add-resource-btn').click(function(e) {
        e.preventDefault();
        showResourceForm();
        window.history.pushState({}, '', '?action=add');
    });

    $(document).on('click', '.page-link', function(e) {
        e.preventDefault();
        const newPage = $(this).data('page');
        if (newPage && newPage !== currentPage) {
            currentPage = newPage;
            loadResources();
        }
    });

    $('#resource-search').on('input', debounce(function() {
        currentPage = 1;
        loadResources();
    }, 300));
}

function loadResources() {
    showLoading(true);
    
    makeAuthenticatedRequest({
        url: `${API_BASE_URL}/resources`,
        method: 'GET',
        data: {
            page: currentPage,
            limit: itemsPerPage,
            search: $('#resource-search').val()?.trim() || undefined
        },
        success: function(response) {
            if (response && response.data) {
                renderResourcesTable(response.data.resources || response.data);
                if (response.pagination) {
                    renderPagination(response.pagination.totalPages, currentPage);
                } else if (response.data.resources && response.data.totalPages) {
                    renderPagination(response.data.totalPages, currentPage);
                }
            } else {
                showAlert('No resources found', 'info');
                renderResourcesTable([]);
            }
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                handleUnauthorizedError();
            } else {
                handleAjaxError('load resources', xhr);
            }
        },
        complete: function() {
            showLoading(false);
        }
    });
}

function makeAuthenticatedRequest(config) {
    const token = localStorage.getItem('token');
    if (!token) {
        handleUnauthorizedError();
        return $.Deferred().reject({ status: 401 });
    }

    return $.ajax({
        ...config,
        headers: {
            ...config.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': config.contentType || 'application/json'
        }
    });
}

function renderResourcesTable(resources) {
    const tableBody = $('#resources-table-body');
    tableBody.empty();

    if (!resources || resources.length === 0) {
        tableBody.append(`
            <tr>
                <td colspan="6" class="text-center">No resources found</td>
            </tr>
        `);
        return;
    }

    resources.forEach(resource => {
        const dateAdded = new Date(resource.createdAt).toLocaleDateString();
        const courseName = resource.course?.name || 
                         (typeof resource.course === 'string' ? 'Loading...' : 'N/A');
        
        tableBody.append(`
            <tr data-id="${resource._id}">
                <td>${escapeHtml(resource.title)}</td>
                <td class="course-name" data-course-id="${resource.course?._id || resource.course}">
                    ${courseName}
                </td>
                <td><span class="badge badge-${getResourceTypeBadge(resource.type)}">${resource.type.toUpperCase()}</span></td>
                <td>${resource.downloadCount || 0}</td>
                <td>${dateAdded}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-info view-resource">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning edit-resource">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-resource">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `);
    });

    loadCourseNamesForTable();
    bindResourceRowEvents();
}

function loadCourseNamesForTable() {
    $('.course-name').each(function() {
        const $cell = $(this);
        const courseId = $cell.data('course-id');
        
        if (courseId && $cell.text() === 'Loading...') {
            makeAuthenticatedRequest({
                url: `${API_BASE_URL}/courses/${courseId}`,
                method: 'GET'
            })
            .then(function(course) {
                $cell.text(course.name || 'N/A');
            })
            .catch(function() {
                $cell.text('N/A');
            });
        }
    });
}

function bindResourceRowEvents() {
    $('.view-resource').click(function() {
        const resourceId = $(this).closest('tr').data('id');
        viewResource(resourceId);
    });

    $('.edit-resource').click(function() {
        const resourceId = $(this).closest('tr').data('id');
        window.location.href = `./manage-resources.html?action=edit&id=${resourceId}`;
    });

    $('.delete-resource').click(function() {
        const resourceId = $(this).closest('tr').data('id');
        confirmDeleteResource(resourceId);
    });
}

function getResourceTypeBadge(type) {
    const badges = {
        'pdf': 'danger',
        'video': 'primary',
        'link': 'success',
        'document': 'warning',
        'presentation': 'info'
    };
    return badges[type] || 'secondary';
}

function renderPagination(totalPages, currentPage) {
    const pagination = $('#pagination');
    pagination.empty();

    if (totalPages <= 1) return;

    pagination.append(`
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>
    `);

    for (let i = 1; i <= totalPages; i++) {
        pagination.append(`
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `);
    }

    pagination.append(`
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>
    `);
}

function showResourceForm() {
    $('#resource-form-container').show();
    $('#form-title').text('Add New Resource');
    $('#resource-form')[0].reset();
    $('#resource-id').val('');
    $('#file-upload-group').show();
    $('#external-link-group').hide();
    window.scrollTo(0, 0);
}

function hideResourceForm() {
    $('#resource-form-container').hide();
    window.history.pushState({}, document.title, window.location.pathname);
}

async function loadResourceForEdit(resourceId) {
    showLoading(true);

    try {
        const response = await makeAuthenticatedRequest({
            url: `${API_BASE_URL}/resources/${resourceId}`,
            method: 'GET'
        });

        if (response.data && response.data.resource) {
            populateResourceForm(response.data.resource);
        } else {
            showAlert('Resource data not found in response', 'warning');
        }
    } catch (error) {
        console.error('Error loading resource:', error);
        
        let errorMessage = 'Failed to load resource';
        if (error.status === 404) {
            errorMessage = 'Resource not found';
        } else if (error.status === 400) {
            errorMessage = 'Invalid resource ID';
        } else if (error.responseJSON && error.responseJSON.message) {
            errorMessage = error.responseJSON.message;
        }
        
        showAlert(errorMessage, 'danger');
        
        // Remove invalid ID from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('id') === resourceId) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } finally {
        showLoading(false);
    }
}

function populateResourceForm(resource) {
    $('#resource-form-container').show();
    $('#form-title').text('Edit Resource');
    $('#resource-id').val(resource._id);
    $('#resource-title').val(resource.title);
    $('#resource-description').val(resource.description);
    $('#resource-type').val(resource.type).trigger('change');
    $('#resource-course').val(resource.course?._id || resource.course);

    if (resource.type === 'link') {
        $('#resource-link').val(resource.fileUrl || '');
    }
}

async function saveResource() {
  const token = localStorage.getItem('token');
  if (!token) {
    handleUnauthorizedError();
    return;
  }

  const resourceId = $('#resource-id').val();
  const method = resourceId ? 'PUT' : 'POST';
  const url = resourceId ? `${API_BASE_URL}/resources/${resourceId}` : `${API_BASE_URL}/resources`;
  const resourceType = $('#resource-type').val();

  // Validate form
  if (!validateResourceForm(resourceType, resourceId)) {
    return;
  }

  const formData = new FormData();
  formData.append('title', $('#resource-title').val());
  formData.append('description', $('#resource-description').val());
  formData.append('courseId', $('#resource-course').val());
  formData.append('type', resourceType);

  if (resourceType === 'link') {
    formData.append('fileUrl', $('#resource-link').val());
  } else if ($('#resource-file')[0].files[0]) {
    formData.append('resourceFile', $('#resource-file')[0].files[0]);
  }

  // Show loading state
  $('#submit-btn').prop('disabled', true);
  $('#submit-spinner').removeClass('d-none');
  $('#submit-text').addClass('d-none');

  try {
    const response = await $.ajax({
      url: url,
      type: method,
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    showAlert(`Resource ${resourceId ? 'updated' : 'created'} successfully!`, 'success');
    hideResourceForm();
    loadResources();
  } catch (error) {
    console.error('Save error:', error);
    
    let errorMsg = 'Failed to save resource';
    if (error.status === 404) {
      errorMsg = 'Resource not found - it may have been deleted';
    } else if (error.responseJSON?.message) {
      errorMsg = error.responseJSON.message;
    }
    
    showAlert(errorMsg, 'danger');
  } finally {
    $('#submit-btn').prop('disabled', false);
    $('#submit-spinner').addClass('d-none');
    $('#submit-text').removeClass('d-none');
  }
}

function validateResourceForm(resourceType, resourceId) {
    let isValid = true;
    let errorMessage = '';
    
    if (!$('#resource-title').val()) {
        errorMessage += 'Title is required.<br>';
        isValid = false;
    }
    
    if (!$('#resource-description').val()) {
        errorMessage += 'Description is required.<br>';
        isValid = false;
    }
    
    if (!$('#resource-course').val()) {
        errorMessage += 'Course selection is required.<br>';
        isValid = false;
    }
    
    if (resourceType === 'link' && !$('#resource-link').val()) {
        errorMessage += 'Please provide a valid URL.<br>';
        isValid = false;
    }
    
    if (resourceType !== 'link' && !resourceId && !$('#resource-file')[0].files[0]) {
        errorMessage += 'Please upload a file.<br>';
        isValid = false;
    }
    
    if (!isValid) {
        showAlert(errorMessage, 'danger');
    }
    
    return isValid;
}

async function viewResource(resourceId) {
    showLoading(true);
    
    try {
        const response = await makeAuthenticatedRequest({
            url: `${API_BASE_URL}/resources/${resourceId}/view`,
            method: 'GET'
        });

        if (response.data) {
            showResourcePreview(response.data);
        } else {
            showAlert('Resource data not found in response', 'warning');
        }
    } catch (error) {
        console.error('Error viewing resource:', error);
        
        let errorMessage = 'Failed to load resource details';
        if (error.status === 404) {
            errorMessage = 'Resource not found';
        } else if (error.status === 400) {
            errorMessage = 'Invalid resource ID';
        } else if (error.responseJSON && error.responseJSON.message) {
            errorMessage = error.responseJSON.message;
        }
        
        showAlert(errorMessage, 'danger');
        loadResources(); // Refresh the list
    } finally {
        showLoading(false);
    }
}

function showResourcePreview(data) {
    const { resource, course, uploadedBy, relatedResources, permissions } = data;
    
    let previewContent = '';
    const formattedDate = new Date(resource.createdAt).toLocaleDateString();
    
    switch(resource.type) {
        case 'pdf':
            previewContent = `
                <div class="resource-header">
                    <h4>${escapeHtml(resource.title)}</h4>
                    <p class="text-muted">Course: ${course.name} (${course.code})</p>
                    <p>Uploaded by ${uploadedBy.name} on ${formattedDate}</p>
                </div>
                <embed src="${resource.fileUrl}" type="application/pdf" width="100%" height="600px">
            `;
            break;
        case 'video':
            previewContent = `
                <div class="resource-header">
                    <h4>${escapeHtml(resource.title)}</h4>
                    <p class="text-muted">Course: ${course.name} (${course.code})</p>
                    <p>Uploaded by ${uploadedBy.name} on ${formattedDate}</p>
                </div>
                <video width="100%" controls>
                    <source src="${resource.fileUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
            break;
        case 'link':
            previewContent = `
                <div class="text-center">
                    <div class="resource-header">
                        <h4>${escapeHtml(resource.title)}</h4>
                        <p class="text-muted">Course: ${course.name} (${course.code})</p>
                        <p>Uploaded by ${uploadedBy.name} on ${formattedDate}</p>
                    </div>
                    <i class="fas fa-external-link-alt fa-5x mb-3"></i>
                    <p>This is an external link resource.</p>
                    <a href="${resource.fileUrl}" target="_blank" class="btn btn-primary">Visit Link</a>
                </div>
            `;
            break;
        default:
            previewContent = `
                <div class="text-center">
                    <div class="resource-header">
                        <h4>${escapeHtml(resource.title)}</h4>
                        <p class="text-muted">Course: ${course.name} (${course.code})</p>
                        <p>Uploaded by ${uploadedBy.name} on ${formattedDate}</p>
                    </div>
                    <i class="fas fa-file-download fa-5x mb-3"></i>
                    <p>This resource can be downloaded (${resource.fileSize}).</p>
                </div>
            `;
    }

    if (relatedResources && relatedResources.length > 0) {
        previewContent += `
            <div class="related-resources mt-4">
                <h5>Other Resources in ${course.name}</h5>
                <ul class="list-group">
                    ${relatedResources.map(res => `
                        <li class="list-group-item">
                            <a href="#" class="view-related-resource" data-id="${res._id}">
                                ${escapeHtml(res.title)} (${res.type.toUpperCase()})
                            </a>
                            <span class="float-right text-muted">
                                ${new Date(res.createdAt).toLocaleDateString()} • ${res.downloadCount} downloads
                            </span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    if (permissions.canEdit || permissions.canDelete) {
        previewContent += `
            <div class="resource-actions mt-3">
                ${permissions.canEdit ? `
                    <button class="btn btn-warning edit-resource" data-id="${resource.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                ` : ''}
                ${permissions.canDelete ? `
                    <button class="btn btn-danger delete-resource float-right" data-id="${resource.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
        `;
    }

    $('#resource-preview-content').html(previewContent);
    $('#download-btn').attr('href', `${API_BASE_URL}/resources/download/${resource.id}`);
    $('#resourcePreviewModalLabel').text(resource.title);
    $('#resourcePreviewModal').modal('show');
    
    $('.view-related-resource').click(function(e) {
        e.preventDefault();
        const relatedId = $(this).data('id');
        viewResource(relatedId);
    });
}

function confirmDeleteResource(resourceId) {
    if (confirm('Are you sure you want to delete this resource?')) {
        deleteResource(resourceId);
    }
}

function deleteResource(resourceId) {
    showLoading(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('Your session has expired. Please login again.', 'danger');
        setTimeout(() => window.location.href = '/login', 1500);
        return;
    }

    makeAuthenticatedRequest({
        url: `${API_BASE_URL}/resources/${resourceId}`,
        method: 'DELETE',
        success: function() {
            showAlert('Resource deleted successfully', 'success');
            loadResources();
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                handleUnauthorizedError();
            } else if (xhr.status === 404) {
                showAlert('Resource not found. It may have already been deleted.', 'warning');
            } else {
                handleAjaxError('delete resource', xhr);
            }
        },
        complete: function() {
            showLoading(false);
        }
    });
}

async function downloadResource(resourceId) {
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert('Please login to download resources', 'warning');
      return;
    }
  
    showLoading(true);
    
    try {
      // First get the resource details
      const resource = await makeAuthenticatedRequest({
        url: `${API_BASE_URL}/resources/${resourceId}`,
        method: 'GET'
      });
  
      if (resource.data.resource.type === 'link') {
        window.open(resource.data.resource.fileUrl, '_blank');
      } else {
        // Create a temporary link for file download
        const link = document.createElement('a');
        link.href = `${API_BASE_URL}/resources/${resourceId}/download`;
        link.setAttribute('download', '');
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Update the download count
      await makeAuthenticatedRequest({
        url: `${API_BASE_URL}/resources/${resourceId}/track-download`,
        method: 'POST'
      });
      
      loadResources(); // Refresh the list
    } catch (error) {
      console.error('Download error:', error);
      showAlert('Failed to download resource', 'danger');
    } finally {
      showLoading(false);
    }
  }

function handleUnauthorizedError() {
    localStorage.removeItem('token');
    showAlert('Your session has expired. Please login again.', 'danger');
    setTimeout(() => window.location.href = '/login', 1500);
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

    $('#alert-container').html(alert);

    setTimeout(() => {
        alert.alert('close');
    }, 5000);
}

function showLoading(show) {
    if (show) {
        $('#loading-overlay').show();
    } else {
        $('#loading-overlay').hide();
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function handleAjaxError(context, xhr, status, error) {
    console.error(`Error ${context}:`, {
        status: xhr.status,
        statusText: xhr.statusText,
        response: xhr.responseText,
        error: error
    });
    
    let message = `Failed to ${context}. `;
    if (xhr.status === 404) {
        message += 'API endpoint not found. Check backend is running.';
    } else if (xhr.status === 0) {
        message += 'Network error. Check your connection.';
    } else if (xhr.responseJSON && xhr.responseJSON.message) {
        message += xhr.responseJSON.message;
    } else {
        message += `Server responded with ${xhr.status}: ${xhr.statusText}`;
    }
    
    showAlert(message, 'danger');
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}