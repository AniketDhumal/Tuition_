const API_BASE_URL =
  (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
  "http://localhost:5000/api/v1";

document.addEventListener('DOMContentLoaded', function() {
    // Current page for pagination
    let currentPage = 1;
    let currentMyResourcesPage = 1;
    
    // Load resources when page loads
    fetchResources();
    
    // Add event listeners
    document.getElementById('filterResources').addEventListener('click', () => fetchResources(1));
    document.getElementById('toggleUploadSection').addEventListener('click', toggleUploadSection);
    document.getElementById('singleUploadForm').addEventListener('submit', handleSingleUpload);
    document.getElementById('batchUploadForm').addEventListener('submit', handleBatchUpload);
    document.getElementById('ratingForm').addEventListener('submit', handleRatingSubmit);
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('myResourcesSection').style.display = 'block';
        fetchMyResources(1);
    }
    
    // Add event listeners for status filter buttons
    document.querySelectorAll('#myResourcesSection .btn-group button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#myResourcesSection .btn-group button').forEach(b => {
                b.classList.remove('active');
                b.classList.add('outline-secondary');
            });
            this.classList.add('active');
            this.classList.remove('outline-secondary');
            fetchMyResources(1);
        });
    });

    // Function to fetch resources with pagination
    async function fetchResources(page = 1) {
        try {
            currentPage = page;
            const container = document.getElementById('resourcesContainer');
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3">Loading resources...</p>
                </div>
            `;
            
            const type = document.getElementById('resourceType').value;
            const grade = document.getElementById('resourceGrade').value;
            const subject = document.getElementById('resourceSubject').value;
            const search = document.getElementById('resourceSearch').value;
            const sort = document.getElementById('resourceSort').value;
            
            // Build query params
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (grade) params.append('grade', grade);
            if (subject) params.append('subject', subject);
            if (search) params.append('q', search);
            if (sort) params.append('sort', sort);
            params.append('page', page);
            
            const response = await fetch(`${API_BASE_URL}/resources?${params.toString()}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch resources');
            }
            
            const data = await response.json();
            displayResources(data.data);
            setupPagination(data.total, data.pages, data.currentPage);
        } catch (error) {
            console.error('Error fetching resources:', error);
            const container = document.getElementById('resourcesContainer');
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        ${error.message || 'Failed to load resources. Please try again later.'}
                    </div>
                </div>
            `;
        }
    }
    
    // Function to display resources with ratings
    function displayResources(resources) {
        const container = document.getElementById('resourcesContainer');
        container.innerHTML = '';
        
        if (!resources || resources.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-center">No resources found matching your criteria.</p></div>';
            return;
        }
        
        resources.forEach(resource => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            
            // Calculate rounded average rating
            const avgRating = resource.averageRating || 0;
            const roundedRating = Math.round(avgRating);
            
            // Create rating stars HTML
            let ratingHTML = '';
            if (avgRating > 0) {
                ratingHTML = `
                    <div class="resource-rating mb-2">
                        ${Array(5).fill().map((_, i) => 
                            `<i class="bi bi-star${i < roundedRating ? '-fill' : ''}"></i>`
                        ).join('')}
                        <small class="ms-1">(${resource.ratings?.length || 0})</small>
                    </div>
                `;
            }
            
            col.innerHTML = `
                <div class="resource-card h-100">
                    <div class="card h-100">
                        <img src="${resource.file.url}" class="card-img-top resource-img" alt="${resource.title}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title resource-title">${resource.title}</h5>
                            ${ratingHTML}
                            <p class="card-text resource-text">${resource.description || 'No description provided'}</p>
                            <div class="mt-auto">
                                <p class="resource-meta">
                                    <small class="text-muted">
                                        ${resource.type} 
                                        ${resource.grade ? '| Grade ' + resource.grade : ''} 
                                        ${resource.subject ? '| ' + resource.subject : ''}
                                    </small>
                                </p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <a href="${API_BASE_URL}/resources/${resource._id}/download" class="btn btn-sm btn-outline-primary">
                                        <i class="bi bi-download"></i> ${resource.downloadCount || 0}
                                    </a>
                                    <button class="btn btn-sm btn-outline-secondary rate-resource" data-id="${resource._id}">
                                        <i class="bi bi-star"></i> Rate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(col);
        });
        
        // Add event listeners to rating buttons
        document.querySelectorAll('.rate-resource').forEach(btn => {
            btn.addEventListener('click', showRatingModal);
        });
    }
    
    // Function to show rating modal
    async function showRatingModal(e) {
        const resourceId = e.currentTarget.getAttribute('data-id');
        const modal = new bootstrap.Modal(document.getElementById('ratingModal'));
        
        // Set resource ID in the modal
        document.getElementById('ratingResourceId').value = resourceId;
        
        // Clear any existing selections
        document.querySelectorAll('input[name="rating"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Check if user already rated this resource
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to rate resources');
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch resource');
            }
            
            const data = await response.json();
            const userId = localStorage.getItem('userId');
            const userRating = data.data.ratings?.find(
                rating => rating.user._id === userId
            );
            
            if (userRating) {
                document.querySelector(`input[name="rating"][value="${userRating.value}"]`).checked = true;
            }
        } catch (error) {
            console.error('Error checking user rating:', error);
        }
        
        modal.show();
    }
    
    // Function to handle rating submission
    async function handleRatingSubmit(e) {
        e.preventDefault();
        
        const resourceId = document.getElementById('ratingResourceId').value;
        const rating = document.querySelector('input[name="rating"]:checked')?.value;
        
        if (!rating) {
            alert('Please select a rating');
            return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating: parseInt(rating) }),
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit rating');
            }
            
            // Update the UI with the new rating
            fetchResources(currentPage);
            
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('ratingModal'));
            modal.hide();
            
            // Show success message
            alert('Thank you for your rating!');
        } catch (error) {
            console.error('Rating error:', error);
            alert(error.message || 'Failed to submit rating');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Rating';
        }
    }
    
    // Function to setup pagination
    function setupPagination(total, pages, currentPage) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        
        if (pages <= 1) return;
        
        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `
            <a class="page-link" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        `;
        prevLi.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) fetchResources(currentPage - 1);
        });
        pagination.appendChild(prevLi);
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pages, startPage + maxVisiblePages - 1);
        
        // Adjust if we're at the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // Always show first page
        if (startPage > 1) {
            const firstLi = document.createElement('li');
            firstLi.className = 'page-item';
            firstLi.innerHTML = `<a class="page-link" href="#">1</a>`;
            firstLi.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                fetchResources(1);
            });
            pagination.appendChild(firstLi);
            
            if (startPage > 2) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
                pagination.appendChild(ellipsisLi);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                fetchResources(i);
            });
            pagination.appendChild(li);
        }
        
        // Always show last page
        if (endPage < pages) {
            if (endPage < pages - 1) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
                pagination.appendChild(ellipsisLi);
            }
            
            const lastLi = document.createElement('li');
            lastLi.className = 'page-item';
            lastLi.innerHTML = `<a class="page-link" href="#">${pages}</a>`;
            lastLi.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                fetchResources(pages);
            });
            pagination.appendChild(lastLi);
        }
        
        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === pages ? 'disabled' : ''}`;
        nextLi.innerHTML = `
            <a class="page-link" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        `;
        nextLi.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < pages) fetchResources(currentPage + 1);
        });
        pagination.appendChild(nextLi);
    }
    
    // Function to toggle upload section
    function toggleUploadSection() {
        const section = document.getElementById('uploadSection');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
        
        // Reset to single upload tab when showing
        if (section.style.display === 'block') {
            const tab = new bootstrap.Tab(document.getElementById('single-tab'));
            tab.show();
        }
    }
    
    // Function to handle single file upload
    async function handleSingleUpload(e) {
        e.preventDefault();
        
        const form = e.target;
        const fileInput = document.getElementById('singleResourceFile');
        const file = fileInput.files[0];
        const title = document.getElementById('resourceTitle').value.trim();
        const description = document.getElementById('resourceDescription').value.trim();
        const type = document.getElementById('resourceTypeSelect').value;
        
        // Validate required fields
        if (!file) {
            alert('Please select a file');
            return;
        }
        
        if (!title) {
            alert('Please enter a title for the resource');
            return;
        }
        
        if (!description) {
            alert('Please enter a description for the resource');
            return;
        }
        
        if (!type) {
            alert('Please select a resource type');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const spinner = submitBtn.querySelector('.spinner-border');
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            spinner.classList.remove('d-none');
            submitBtn.querySelector('.upload-text').textContent = 'Uploading...';
            
            // First upload to Cloudinary
            const cloudinaryFormData = new FormData();
            cloudinaryFormData.append('file', file);
            cloudinaryFormData.append('upload_preset', 'learning_resources'); // Your Cloudinary upload preset
            
            const cloudinaryResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`, 
                {
                    method: 'POST',
                    body: cloudinaryFormData
                }
            );
            
            if (!cloudinaryResponse.ok) {
                throw new Error('Failed to upload file to Cloudinary');
            }
            
            const cloudinaryData = await cloudinaryResponse.json();
            
            // Then create resource in your database
            const resourceData = {
                title,
                description,
                type,
                file: {
                    public_id: cloudinaryData.public_id,
                    url: cloudinaryData.secure_url,
                    originalname: file.name,
                    size: file.size,
                    format: cloudinaryData.format
                },
                // Optional fields
                grade: document.getElementById('resourceGradeSelect').value || undefined,
                subject: document.getElementById('resourceSubjectSelect').value || undefined,
                tags: document.getElementById('resourceTags').value 
                    ? document.getElementById('resourceTags').value.split(',').map(tag => tag.trim()) 
                    : undefined
            };
            
            const response = await fetch(`${API_BASE_URL}/resources`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(resourceData),
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create resource');
            }
            
            const data = await response.json();
            
            alert('Resource uploaded successfully!');
            form.reset();
            document.getElementById('singleFilePreview').innerHTML = '';
            fetchResources(1); // Refresh list
            fetchMyResources(1); // Refresh my resources
        } catch (error) {
            console.error('Upload error:', error);
            alert(error.message || 'Failed to upload resource');
        } finally {
            submitBtn.disabled = false;
            spinner.classList.add('d-none');
            submitBtn.querySelector('.upload-text').textContent = 'Upload Resource';
        }
    }
    
    // Function to handle batch upload
    async function handleBatchUpload(e) {
        e.preventDefault();
        
        const form = e.target;
        const filesInput = document.getElementById('resourceFiles');
        const files = filesInput.files;
        
        if (!files || files.length === 0) {
            alert('Please select at least one file');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const spinner = submitBtn.querySelector('.spinner-border');
        const progress = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');
        const status = document.getElementById('fileStatus');
        const errorsContainer = document.getElementById('uploadErrors');
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            spinner.classList.remove('d-none');
            submitBtn.querySelector('.upload-text').textContent = 'Uploading...';
            progress.style.display = 'block';
            progressBar.style.width = '0%';
            status.textContent = 'Starting upload...';
            errorsContainer.innerHTML = '';
            
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
            
            // Add metadata
            formData.append('type', document.getElementById('defaultType').value || 'other');
            formData.append('description', document.getElementById('defaultDescription').value || 'Batch uploaded resource');
            
            const grade = document.getElementById('defaultGrade').value;
            const subject = document.getElementById('defaultSubject').value;
            const tags = document.getElementById('defaultTags').value;
            
            if (grade) formData.append('grade', grade);
            if (subject) formData.append('subject', subject);
            if (tags) formData.append('tags', tags);
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/resources/batch`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }
            
            const data = await response.json();
            
            // Update progress
            progressBar.style.width = '100%';
            status.textContent = `Upload complete! ${data.count} resources uploaded.`;
            
            if (data.errors && data.errors.length > 0) {
                status.textContent += ` (${data.errors.length} errors)`;
                
                const errorsHTML = data.errors.map(error => `
                    <div class="alert alert-warning">
                        <strong>${error.filename}:</strong> ${error.error}
                    </div>
                `).join('');
                
                errorsContainer.innerHTML = errorsHTML;
            }
            
            form.reset();
            document.getElementById('batchFilesPreview').innerHTML = '';
            fetchResources(1); // Refresh list
            fetchMyResources(1); // Refresh my resources
        } catch (error) {
            console.error('Upload error:', error);
            progressBar.classList.add('bg-danger');
            status.textContent = `Error: ${error.message || 'Upload failed'}`;
        } finally {
            submitBtn.disabled = false;
            spinner.classList.add('d-none');
            submitBtn.querySelector('.upload-text').textContent = 'Upload Resources';
        }
    }
    
    // Function to fetch user's resources with pagination
    async function fetchMyResources(page = 1) {
        try {
            currentMyResourcesPage = page;
            const tbody = document.querySelector('#myResourcesTable tbody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-3">Loading your resources...</p>
                    </td>
                </tr>
            `;
            
            const statusFilter = document.querySelector('#myResourcesSection .btn-group .active')?.dataset.status || 'all';
            const token = localStorage.getItem('token');
            
            let url = `${API_BASE_URL}/resources/my?page=${page}`;
            if (statusFilter !== 'all') {
                url += `&status=${statusFilter}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch your resources');
            }
            
            const data = await response.json();
            displayMyResources(data.data);
            setupMyResourcesPagination(data.total, data.pages, data.currentPage);
            
            // Show pending count if any
            const pendingCount = data.data.filter(r => r.status === 'pending').length;
            if (pendingCount > 0) {
                document.getElementById('pendingCount').textContent = pendingCount;
                document.getElementById('pendingResourcesAlert').style.display = 'block';
            } else {
                document.getElementById('pendingResourcesAlert').style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching user resources:', error);
            const tbody = document.querySelector('#myResourcesTable tbody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="alert alert-danger">
                            ${error.message || 'Failed to load your resources. Please try again later.'}
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    // Function to display user's resources
    function displayMyResources(resources) {
        const tbody = document.querySelector('#myResourcesTable tbody');
        tbody.innerHTML = '';
        
        if (!resources || resources.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        You haven't uploaded any resources yet.
                    </td>
                </tr>
            `;
            return;
        }
        
        resources.forEach(resource => {
            const tr = document.createElement('tr');
            
            // Status badge
            let statusBadge = '';
            if (resource.status === 'approved') {
                statusBadge = '<span class="badge bg-success">Approved</span>';
            } else if (resource.status === 'pending') {
                statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';
            } else {
                statusBadge = '<span class="badge bg-danger">Rejected</span>';
            }
            
            // Rating display
            let ratingDisplay = '';
            if (resource.averageRating > 0) {
                const roundedRating = Math.round(resource.averageRating);
                ratingDisplay = `
                    <div class="resource-rating">
                        ${Array(5).fill().map((_, i) => 
                            `<i class="bi bi-star${i < roundedRating ? '-fill' : ''}" style="font-size: 0.8rem;"></i>`
                        ).join('')}
                        <small>(${resource.ratings?.length || 0})</small>
                    </div>
                `;
            } else {
                ratingDisplay = '<span class="text-muted">No ratings</span>';
            }
            
            tr.innerHTML = `
                <td>${resource.title}</td>
                <td>${resource.type}</td>
                <td>${statusBadge}</td>
                <td>${new Date(resource.createdAt).toLocaleDateString()}</td>
                <td>${resource.downloadCount || 0}</td>
                <td>${ratingDisplay}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-resource" data-id="${resource._id}">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-resource" data-id="${resource._id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.view-resource').forEach(btn => {
            btn.addEventListener('click', viewResource);
        });
        
        document.querySelectorAll('.delete-resource').forEach(btn => {
            btn.addEventListener('click', confirmDelete);
        });
    }
    
    // Function to setup pagination for my resources
    function setupMyResourcesPagination(total, pages, currentPage) {
        const pagination = document.getElementById('myResourcesPagination');
        pagination.innerHTML = '';
        
        if (pages <= 1) return;
        
        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `
            <a class="page-link" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        `;
        prevLi.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) fetchMyResources(currentPage - 1);
        });
        pagination.appendChild(prevLi);
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pages, startPage + maxVisiblePages - 1);
        
        // Adjust if we're at the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                fetchMyResources(i);
            });
            pagination.appendChild(li);
        }
        
        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === pages ? 'disabled' : ''}`;
        nextLi.innerHTML = `
            <a class="page-link" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        `;
        nextLi.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < pages) fetchMyResources(currentPage + 1);
        });
        pagination.appendChild(nextLi);
    }
    
    // Function to view resource details
    async function viewResource(e) {
        const resourceId = e.currentTarget.getAttribute('data-id');
        
        try {
            const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch resource');
            }
            
            const data = await response.json();
            
            // Populate modal
            const modal = new bootstrap.Modal(document.getElementById('resourcePreviewModal'));
            document.getElementById('resourcePreviewTitle').textContent = data.data.title;
            
            // Format ratings
            let ratingsHTML = '';
            if (data.data.ratings && data.data.ratings.length > 0) {
                ratingsHTML = `
                    <h6 class="mt-3">Ratings (${data.data.ratings.length})</h6>
                    <div class="ratings-container">
                        ${data.data.ratings.map(rating => `
                            <div class="rating-item mb-2">
                                <strong>${rating.user.name}:</strong>
                                <div class="d-inline-block ms-2">
                                    ${Array(5).fill().map((_, i) => 
                                        `<i class="bi bi-star${i < rating.value ? '-fill' : ''} text-warning"></i>`
                                    ).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            let previewContent = `
                <div class="row">
                    <div class="col-md-6">
                        ${data.data.file.format === 'pdf' ? `
                            <iframe src="${data.data.file.url}" class="w-100" style="height: 500px;" frameborder="0"></iframe>
                        ` : `
                            <img src="${data.data.file.url}" class="img-fluid mb-3" alt="${data.data.title}">
                        `}
                    </div>
                    <div class="col-md-6">
                        <h6>Description</h6>
                        <p>${data.data.description || 'No description provided'}</p>
                        
                        <h6 class="mt-4">Details</h6>
                        <ul class="list-unstyled">
                            <li><strong>Type:</strong> ${data.data.type}</li>
                            ${data.data.grade ? `<li><strong>Grade:</strong> ${data.data.grade}</li>` : ''}
                            ${data.data.subject ? `<li><strong>Subject:</strong> ${data.data.subject}</li>` : ''}
                            ${data.data.tags?.length > 0 ? `<li><strong>Tags:</strong> ${data.data.tags.join(', ')}</li>` : ''}
                            <li><strong>Uploaded:</strong> ${new Date(data.data.createdAt).toLocaleDateString()}</li>
                            <li><strong>Status:</strong> ${data.data.status.charAt(0).toUpperCase() + data.data.status.slice(1)}</li>
                            <li><strong>Downloads:</strong> ${data.data.downloadCount || 0}</li>
                            <li><strong>Average Rating:</strong> 
                                ${data.data.averageRating ? `
                                    ${data.data.averageRating.toFixed(1)}/5 
                                    (${data.data.ratings?.length || 0} ratings)
                                ` : 'Not rated yet'}
                            </li>
                        </ul>
                        
                        ${ratingsHTML}
                    </div>
                </div>
            `;
            
            document.getElementById('resourcePreviewContent').innerHTML = previewContent;
            document.getElementById('downloadResourceBtn').href = `${API_BASE_URL}/resources/${resourceId}/download`;
            modal.show();
        } catch (error) {
            console.error('Error viewing resource:', error);
            alert(error.message || 'Failed to load resource');
        }
    }
    
    // Function to confirm resource deletion
    function confirmDelete(e) {
        const resourceId = e.currentTarget.getAttribute('data-id');
        const resourceTitle = e.currentTarget.closest('tr').querySelector('td:first-child').textContent;
        
        document.getElementById('resourceToDeleteTitle').textContent = resourceTitle;
        
        const modal = new bootstrap.Modal(document.getElementById('deleteResourceModal'));
        modal.show();
        
        document.getElementById('confirmDeleteBtn').onclick = () => {
            deleteResource(resourceId);
            modal.hide();
        };
    }
    
    // Function to delete resource
    async function deleteResource(resourceId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete resource');
            }
            
            alert('Resource deleted successfully');
            fetchMyResources(currentMyResourcesPage); // Refresh list
            fetchResources(currentPage); // Also refresh main resources list
        } catch (error) {
            console.error('Error deleting resource:', error);
            alert(error.message || 'Failed to delete resource');
        }
    }
    
    // File preview for single upload
    document.getElementById('singleResourceFile').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('singleFilePreview');
        preview.innerHTML = '';
        
        if (file) {
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.className = 'img-thumbnail';
                img.style.maxHeight = '200px';
                preview.appendChild(img);
            } else {
                const icon = document.createElement('i');
                icon.className = 'bi bi-file-earmark-text display-4 text-muted';
                
                const div = document.createElement('div');
                div.className = 'text-center';
                div.appendChild(icon);
                div.innerHTML += `<div class="small">${file.name}</div>`;
                div.innerHTML += `<div class="small text-muted">${(file.size / 1024 / 1024).toFixed(2)} MB</div>`;
                
                preview.appendChild(div);
            }
        }
    });
    
    // File preview for batch upload
    document.getElementById('resourceFiles').addEventListener('change', function(e) {
        const files = e.target.files;
        const preview = document.getElementById('batchFilesPreview');
        preview.innerHTML = '';
        
        if (files && files.length > 0) {
            const list = document.createElement('ul');
            list.className = 'list-group';
            
            for (let i = 0; i < Math.min(files.length, 5); i++) {
                const file = files[i];
                const item = document.createElement('li');
                item.className = 'list-group-item d-flex justify-content-between align-items-center';
                
                item.innerHTML = `
                    <span>${file.name}</span>
                    <span class="badge bg-secondary rounded-pill">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
                `;
                
                list.appendChild(item);
            }
            
            if (files.length > 5) {
                const item = document.createElement('li');
                item.className = 'list-group-item text-center text-muted';
                item.textContent = `+ ${files.length - 5} more files`;
                list.appendChild(item);
            }
            
            preview.appendChild(list);
        }
    });
});