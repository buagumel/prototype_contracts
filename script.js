// Application State
let currentUser = null;
let contractors = [];
let contracts = [];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadData();
    setupEventListeners();
    checkAuthStatus();
}

// Data Management
function loadData() {
    // Load contractors
    const savedContractors = localStorage.getItem('contractors');
    if (savedContractors) {
        contractors = JSON.parse(savedContractors);
        // Add profile pictures to existing contractors if they don't have them
        contractors.forEach(contractor => {
            if (!contractor.profilePic) {
                contractor.profilePic = generateProfilePic(contractor.name);
            }
        });
    } else {
        // Initialize with sample data
        contractors = [
            {
                id: 1,
                name: 'John Smith',
                email: 'john.smith@email.com',
                phone: '(555) 123-4567',
                specialty: 'Web Development',
                username: 'john_contractor',
                password: 'password123',
                profilePic: generateProfilePic('John Smith')
            },
            {
                id: 2,
                name: 'Sarah Johnson',
                email: 'sarah.johnson@email.com',
                phone: '(555) 987-6543',
                specialty: 'Mobile App Development',
                username: 'sarah_contractor',
                password: 'password123',
                profilePic: generateProfilePic('Sarah Johnson')
            }
        ];
        saveData();
    }

    // Load contracts
    const savedContracts = localStorage.getItem('contracts');
    if (savedContracts) {
        contracts = JSON.parse(savedContracts);
    } else {
        // Initialize with sample data
        contracts = [
            {
                id: 1,
                title: 'E-commerce Website',
                description: 'Build a modern e-commerce platform with payment integration',
                contractorId: 1,
                startDate: '2024-01-15',
                endDate: '2024-03-15',
                value: 15000,
                status: 'Active'
            },
            {
                id: 2,
                title: 'Mobile App UI/UX',
                description: 'Design and develop user interface for mobile application',
                contractorId: 2,
                startDate: '2024-02-01',
                endDate: '2024-04-01',
                value: 12000,
                status: 'Inactive'
            }
        ];
        saveData();
    }
}

function saveData() {
    localStorage.setItem('contractors', JSON.stringify(contractors));
    localStorage.setItem('contracts', JSON.stringify(contracts));
}

// Authentication
function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    document.getElementById('navbar').style.display = 'block';

    document.getElementById('welcomeText').textContent = `Welcome, ${currentUser.name}`;

    if (currentUser.type === 'admin') {
        document.getElementById('adminDashboard').classList.add('active');
        document.getElementById('contractorDashboard').classList.remove('active');
        loadAdminDashboard();
    } else {
        document.getElementById('contractorDashboard').classList.add('active');
        document.getElementById('adminDashboard').classList.remove('active');
        loadContractorDashboard();
    }
}

// Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Admin actions
    document.getElementById('addContractorBtn').addEventListener('click', () => openModal('addContractorModal'));
    document.getElementById('addContractBtn').addEventListener('click', () => openModal('addContractModal'));
    document.getElementById('addMyContractBtn').addEventListener('click', () => openModal('addContractModal'));

    // Forms
    document.getElementById('addContractorForm').addEventListener('submit', handleAddContractor);
    document.getElementById('addContractForm').addEventListener('submit', handleAddContract);

    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Modal close buttons
    document.querySelectorAll('.close, [data-modal]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                closeModal(modalId);
            } else {
                closeModal(this.closest('.modal').id);
            }
        });
    });

    // Close modals on outside click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    let user = null;

    if (userType === 'admin') {
        // Admin login (hardcoded for demo)
        if (username === 'admin' && password === 'admin123') {
            user = {
                id: 0,
                name: 'Administrator',
                type: 'admin',
                username: 'admin'
            };
        }
    } else if (userType === 'contractor') {
        // Contractor login
        const contractor = contractors.find(c => c.username === username && c.password === password);
        if (contractor) {
            user = {
                id: contractor.id,
                name: contractor.name,
                type: 'contractor',
                username: contractor.username
            };
        }
    }

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard();
        showNotification('Login successful!', 'success');
    } else {
        document.getElementById('loginError').textContent = 'Invalid credentials. Please try again.';
        showNotification('Invalid credentials', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLogin();
    showNotification('Logged out successfully!', 'success');
}

// Dashboard Functions
function loadAdminDashboard() {
    loadContractorsList();
    loadAllContractsList();
    populateContractorSelect();
}

function loadContractorDashboard() {
    loadContractorProfile();
    loadMyContracts();
}

function loadContractorProfile() {
    const contractor = contractors.find(c => c.id === currentUser.id);
    if (contractor) {
        const profileSection = document.getElementById('contractorProfileSection');
        profileSection.innerHTML = `
            <img src="${contractor.profilePic}" alt="${contractor.name}" class="profile-pic-dashboard">
            <div class="contractor-welcome-info">
                <span class="welcome-text">Welcome back,</span>
                <span class="contractor-name">${contractor.name}</span>
                <span class="contractor-specialty">${contractor.specialty}</span>
            </div>
        `;
    }
}

function loadContractorsList() {
    const container = document.getElementById('contractorsList');
    container.innerHTML = '';

    contractors.forEach(contractor => {
        const contractCount = contracts.filter(c => c.contractorId === contractor.id).length;
        const contractorElement = createContractorElement(contractor, contractCount);
        container.appendChild(contractorElement);
    });
}

function createContractorElement(contractor, contractCount) {
    const div = document.createElement('div');
    div.className = 'item contractor-item';
    div.innerHTML = `
        <div class="contractor-profile">
            <img src="${contractor.profilePic}" alt="${contractor.name}" class="profile-pic">
        </div>
        <div class="item-info">
            <h4>${contractor.name}</h4>
            <p>${contractor.specialty} • ${contractCount} contracts</p>
            <p><i class="fas fa-envelope"></i> ${contractor.email}</p>
            <p><i class="fas fa-phone"></i> ${contractor.phone}</p>
        </div>
        <div class="item-actions">
            <button class="btn btn-sm btn-primary" onclick="viewContractorDetails(${contractor.id})">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteContractor(${contractor.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return div;
}

function loadAllContractsList() {
    const container = document.getElementById('allContractsList');
    container.innerHTML = '';

    contracts.forEach(contract => {
        const contractor = contractors.find(c => c.id === contract.contractorId);
        const contractElement = createContractListElement(contract, contractor);
        container.appendChild(contractElement);
    });
}

function createContractListElement(contract, contractor) {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
        <div class="item-info">
            <h4>${contract.title}</h4>
            <p>Contractor: ${contractor ? contractor.name : 'Unknown'}</p>
            <p>Value: ₦${contract.value.toLocaleString()}</p>
            <p>Period: ${formatDate(contract.startDate)} - ${formatDate(contract.endDate)}</p>
        </div>
        <div class="item-actions">
            <button class="btn btn-sm btn-primary" onclick="viewContractDetails(${contract.id})">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-sm ${contract.status === 'Active' ? 'btn-warning' : 'btn-success'}" onclick="toggleContractStatus(${contract.id})">
                <i class="fas fa-toggle-${contract.status === 'Active' ? 'on' : 'off'}"></i> ${contract.status === 'Active' ? 'Deactivate' : 'Activate'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteContract(${contract.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return div;
}

function loadMyContracts() {
    const container = document.getElementById('myContractsList');
    container.innerHTML = '';

    const myContracts = contracts.filter(c => c.contractorId === currentUser.id);

    if (myContracts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No contracts found.</p>';
        return;
    }

    myContracts.forEach(contract => {
        const contractElement = createMyContractElement(contract);
        container.appendChild(contractElement);
    });
}

function createMyContractElement(contract) {
    const div = document.createElement('div');
    div.className = 'contract-card';
    div.innerHTML = `
        <h4>${contract.title}</h4>
        <p>${contract.description}</p>
        <div class="contract-dates">
            <span><i class="fas fa-calendar-alt"></i> Start: ${formatDate(contract.startDate)}</span>
            <span><i class="fas fa-calendar-check"></i> End: ${formatDate(contract.endDate)}</span>
        </div>
        <div class="contract-value">
            <i class="fas fa-dollar-sign"></i> ₦${contract.value.toLocaleString()}
        </div>
        <div class="contract-actions">
            <button class="btn btn-sm btn-danger" onclick="deleteContract(${contract.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return div;
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');

    // Special handling for contract modal
    if (modalId === 'addContractModal') {
        populateContractorSelect();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    // Clear forms
    document.querySelectorAll(`#${modalId} form`).forEach(form => form.reset());
}

function populateContractorSelect() {
    const select = document.getElementById('contractContractor');
    select.innerHTML = '<option value="">Select Contractor</option>';

    contractors.forEach(contractor => {
        const option = document.createElement('option');
        option.value = contractor.id;
        option.textContent = contractor.name;
        select.appendChild(option);
    });
}

// CRUD Operations
function handleAddContractor(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const name = formData.get('contractorName') || document.getElementById('contractorName').value;
    const contractor = {
        id: Date.now(),
        name: name,
        email: formData.get('contractorEmail') || document.getElementById('contractorEmail').value,
        phone: formData.get('contractorPhone') || document.getElementById('contractorPhone').value,
        specialty: formData.get('contractorSpecialty') || document.getElementById('contractorSpecialty').value,
        username: name.toLowerCase().replace(/\s+/g, '_'),
        password: 'password123',
        profilePic: generateProfilePic(name)
    };

    contractors.push(contractor);
    saveData();
    closeModal('addContractorModal');
    loadContractorsList();
    showNotification('Contractor added successfully!', 'success');
}

function handleAddContract(e) {
    e.preventDefault();

    const title = document.getElementById('contractTitle').value;
    const description = document.getElementById('contractDescription').value;
    const contractorId = parseInt(document.getElementById('contractContractor').value);
    const startDate = document.getElementById('contractStartDate').value;
    const endDate = document.getElementById('contractEndDate').value;
    const value = parseFloat(document.getElementById('contractValue').value);

    // Validation
    if (!title || !description || !contractorId || !startDate || !endDate || !value) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
        showNotification('End date must be after start date', 'error');
        return;
    }

    const contract = {
        id: Date.now(),
        title,
        description,
        contractorId: currentUser.type === 'contractor' ? currentUser.id : contractorId,
        startDate,
        endDate,
        value,
        status: 'Active'
    };

    contracts.push(contract);
    saveData();
    closeModal('addContractModal');

    if (currentUser.type === 'admin') {
        loadAllContractsList();
    } else {
        loadMyContracts();
    }

    showNotification('Contract added successfully!', 'success');
}

function deleteContractor(contractorId) {
    if (confirm('Are you sure you want to delete this contractor? This will also delete all their contracts.')) {
        contractors = contractors.filter(c => c.id !== contractorId);
        contracts = contracts.filter(c => c.contractorId !== contractorId);
        saveData();
        loadContractorsList();
        loadAllContractsList();
        showNotification('Contractor and their contracts deleted successfully!', 'success');
    }
}

function toggleContractStatus(contractId) {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
        contract.status = contract.status === 'Active' ? 'Inactive' : 'Active';
        saveData();

        if (currentUser.type === 'admin') {
            loadAllContractsList();
        } else {
            loadMyContracts();
        }

        showNotification(`Contract ${contract.status === 'Active' ? 'activated' : 'deactivated'} successfully!`, 'success');
    }
}

function deleteContract(contractId) {
    if (confirm('Are you sure you want to delete this contract?')) {
        contracts = contracts.filter(c => c.id !== contractId);
        saveData();

        if (currentUser.type === 'admin') {
            loadAllContractsList();
        } else {
            loadMyContracts();
        }

        showNotification('Contract deleted successfully!', 'success');
    }
}

function viewContractorDetails(contractorId) {
    const contractor = contractors.find(c => c.id === contractorId);
    const contractorContracts = contracts.filter(c => c.contractorId === contractorId);

    const content = document.getElementById('contractorDetailsContent');
    content.innerHTML = `
        <div class="contractor-details">
            <div class="contractor-header">
                <img src="${contractor.profilePic}" alt="${contractor.name}" class="profile-pic-large">
                <div class="contractor-info">
                    <h4>${contractor.name}</h4>
                    <p><i class="fas fa-briefcase"></i> ${contractor.specialty}</p>
                    <p><i class="fas fa-envelope"></i> ${contractor.email}</p>
                    <p><i class="fas fa-phone"></i> ${contractor.phone}</p>
                </div>
            </div>
            <hr>
            <h4>Contracts (${contractorContracts.length})</h4>
            <div class="contracts-list">
                ${contractorContracts.map(contract => `
                    <div class="contract-item">
                        <h5>${contract.title}</h5>
                        <p>${contract.description}</p>
                        <div class="contract-meta">
                            <span><i class="fas fa-calendar-alt"></i> ${formatDate(contract.startDate)} - ${formatDate(contract.endDate)}</span>
                            <span><i class="fas fa-dollar-sign"></i> ₦${contract.value.toLocaleString()}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    openModal('contractorDetailsModal');
}

function viewContractDetails(contractId) {
    const contract = contracts.find(c => c.id === contractId);
    const contractor = contractors.find(c => c.id === contract.contractorId);

    const content = document.getElementById('contractDetailsContent');
    content.innerHTML = `
        <div class="contract-details-enhanced">
            <div class="contract-header">
                <div class="contract-title-section">
                    <h2 class="contract-title">${contract.title}</h2>
                    <span class="status-badge status-${contract.status.toLowerCase()}">${contract.status}</span>
                </div>
                <div class="contract-actions-header">
                    <button class="btn btn-sm btn-primary" onclick="printContractToPDF(${contractId})">
                        <i class="fas fa-file-pdf"></i> Print to PDF
                    </button>
                </div>
            </div>

            <div class="contract-body">
                <div class="contract-section">
                    <h4><i class="fas fa-file-alt"></i> Contract Description</h4>
                    <div class="contract-description-enhanced">${contract.description}</div>
                </div>

                <div class="contract-details-grid">
                    <div class="detail-card">
                        <div class="detail-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="detail-content">
                            <h5>Contract Value</h5>
                            <p class="detail-value">₦${contract.value.toLocaleString()}</p>
                        </div>
                    </div>

                    <div class="detail-card">
                        <div class="detail-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="detail-content">
                            <h5>Start Date</h5>
                            <p class="detail-value">${formatDate(contract.startDate)}</p>
                        </div>
                    </div>

                    <div class="detail-card">
                        <div class="detail-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="detail-content">
                            <h5>End Date</h5>
                            <p class="detail-value">${formatDate(contract.endDate)}</p>
                        </div>
                    </div>

                    <div class="detail-card">
                        <div class="detail-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="detail-content">
                            <h5>Duration</h5>
                            <p class="detail-value">${calculateDuration(contract.startDate, contract.endDate)}</p>
                        </div>
                    </div>
                </div>

                ${contractor ? `
                    <div class="contract-section">
                        <h4><i class="fas fa-user"></i> Contractor Information</h4>
                        <div class="contractor-info-enhanced">
                            <div class="contractor-profile-section">
                                <img src="${contractor.profilePic}" alt="${contractor.name}" class="profile-pic-medium">
                                <div class="contractor-details-grid">
                                    <div class="contractor-detail">
                                        <strong>Name:</strong> ${contractor.name}
                                    </div>
                                    <div class="contractor-detail">
                                        <strong>Specialty:</strong> ${contractor.specialty}
                                    </div>
                                    <div class="contractor-detail">
                                        <strong>Email:</strong> ${contractor.email}
                                    </div>
                                    <div class="contractor-detail">
                                        <strong>Phone:</strong> ${contractor.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    openModal('contractDetailsModal');
}

function printContractToPDF(contractId) {
    const contract = contracts.find(c => c.id === contractId);
    const contractor = contractors.find(c => c.id === contract.contractorId);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Contract - ${contract.title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px; }
                .contract-title { font-size: 24px; margin-bottom: 10px; color: #667eea; }
                .contract-info { margin-bottom: 20px; }
                .section { margin-bottom: 25px; }
                .section h3 { color: #667eea; margin-bottom: 10px; }
                .detail-row { display: flex; margin-bottom: 8px; }
                .detail-label { font-weight: bold; width: 120px; }
                .status { padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
                .status.active { background: #d4edda; color: #155724; }
                .status.inactive { background: #f8d7da; color: #721c24; }
                .description { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 class="contract-title">${contract.title}</h1>
                <span class="status ${contract.status.toLowerCase()}">${contract.status}</span>
            </div>

            <div class="section">
                <h3>Contract Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Contract ID:</span>
                    <span>#${contract.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Value:</span>
                    <span>₦${contract.value.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Start Date:</span>
                    <span>${formatDate(contract.startDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">End Date:</span>
                    <span>${formatDate(contract.endDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span>${calculateDuration(contract.startDate, contract.endDate)}</span>
                </div>
            </div>

            <div class="section">
                <h3>Description</h3>
                <div class="description">${contract.description}</div>
            </div>

            ${contractor ? `
                <div class="section">
                    <h3>Contractor Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span>${contractor.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Specialty:</span>
                        <span>${contractor.specialty}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span>${contractor.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span>${contractor.phone}</span>
                    </div>
                </div>
            ` : ''}

            <div style="margin-top: 50px; font-size: 12px; color: #666; text-align: center;">
                Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
        return `${diffDays} days`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        const remainingDays = diffDays % 30;
        return remainingDays > 0 ? `${months} months, ${remainingDays} days` : `${months} months`;
    } else {
        const years = Math.floor(diffDays / 365);
        const remainingDays = diffDays % 365;
        const months = Math.floor(remainingDays / 30);
        return `${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
}

// Search Function
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    applyFilters(searchTerm);
}

function handleStatusFilter(e) {
    const statusFilter = e.target.value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    applyFilters(searchTerm, statusFilter);
}

function applyFilters(searchTerm = '', statusFilter = '') {
    // Filter contractors
    const filteredContractors = contractors.filter(contractor =>
        contractor.name.toLowerCase().includes(searchTerm) ||
        contractor.specialty.toLowerCase().includes(searchTerm) ||
        contractor.email.toLowerCase().includes(searchTerm)
    );

    // Filter contracts
    let filteredContracts = contracts.filter(contract =>
        contract.title.toLowerCase().includes(searchTerm) ||
        contract.description.toLowerCase().includes(searchTerm)
    );

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
        filteredContracts = filteredContracts.filter(contract => 
            contract.status.toLowerCase() === statusFilter.toLowerCase()
        );
    }

    // Update displays
    updateContractorsList(filteredContractors);
    updateContractsList(filteredContracts);

    if (currentUser.type === 'contractor') {
        updateMyContractsList(filteredContracts);
    }
}

function updateMyContractsList(filteredContracts) {
    const container = document.getElementById('myContractsList');
    container.innerHTML = '';

    const myFilteredContracts = filteredContracts.filter(c => c.contractorId === currentUser.id);

    if (myFilteredContracts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No contracts found matching your criteria.</p>';
        return;
    }

    myFilteredContracts.forEach(contract => {
        const contractElement = createMyContractElement(contract);
        container.appendChild(contractElement);
    });
}

function updateContractorsList(filteredContractors) {
    const container = document.getElementById('contractorsList');
    container.innerHTML = '';

    filteredContractors.forEach(contractor => {
        const contractCount = contracts.filter(c => c.contractorId === contractor.id).length;
        const contractorElement = createContractorElement(contractor, contractCount);
        container.appendChild(contractorElement);
    });
}

function updateContractsList(filteredContracts) {
    const container = document.getElementById('allContractsList');
    container.innerHTML = '';

    filteredContracts.forEach(contract => {
        const contractor = contractors.find(c => c.id === contract.contractorId);
        const contractElement = createContractListElement(contract, contractor);
        container.appendChild(contractElement);
    });
}

// Utility Functions
function generateProfilePic(name) {
    // Generate a profile picture URL using DiceBear API
    const seed = name.toLowerCase().replace(/\s+/g, '');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=667eea,764ba2,f093fb,4facfe,43a3f7`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize sample admin user
if (!localStorage.getItem('adminInitialized')) {
    localStorage.setItem('adminInitialized', 'true');
    // Admin credentials: admin / admin123
    console.log('Admin credentials: admin / admin123');
    console.log('Sample contractor credentials: john_contractor / password123');
}