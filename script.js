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
                status: 'Active',
                isPublic: true,
                files: [
                    { name: 'project_specs.pdf', size: 245760, type: 'application/pdf' },
                    { name: 'wireframes.png', size: 892432, type: 'image/png' }
                ]
            },
            {
                id: 2,
                title: 'Mobile App UI/UX',
                description: 'Design and develop user interface for mobile application',
                contractorId: 2,
                startDate: '2024-02-01',
                endDate: '2024-04-01',
                value: 12000,
                status: 'Inactive',
                isPublic: false,
                files: []
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

    // Reset all dashboards
    document.getElementById('adminDashboard').classList.remove('active');
    document.getElementById('contractorDashboard').classList.remove('active');
    document.getElementById('publicDashboard').classList.remove('active');

    if (currentUser.type === 'admin') {
        document.getElementById('adminDashboard').classList.add('active');
        loadAdminDashboard();
    } else if (currentUser.type === 'contractor') {
        document.getElementById('contractorDashboard').classList.add('active');
        loadContractorDashboard();
    } else if (currentUser.type === 'public') {
        document.getElementById('publicDashboard').classList.add('active');
        loadPublicDashboard();
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

    // Forms
    document.getElementById('addContractorForm').addEventListener('submit', handleAddContractor);
    document.getElementById('addContractForm').addEventListener('submit', handleAddContract);

    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Public search (only if element exists)
    const publicSearchInput = document.getElementById('publicSearchInput');
    if (publicSearchInput) {
        publicSearchInput.addEventListener('input', handlePublicSearch);
    }

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
    } else if (userType === 'public') {
        // Public user login (simplified - just needs any credentials)
        if (username && password) {
            user = {
                id: -1,
                name: `Public User (${username})`,
                type: 'public',
                username: username
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

function loadPublicDashboard() {
    loadPublicContracts();
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
    // Only admin can open contract modal
    if (modalId === 'addContractModal' && currentUser.type !== 'admin') {
        showNotification('Only administrators can create contracts!', 'error');
        return;
    }

    document.getElementById(modalId).classList.add('show');

    // Special handling for contract modal
    if (modalId === 'addContractModal') {
        populateContractorSelect();
        // Show/hide public visibility option for admin only
        const publicGroup = document.getElementById('publicVisibilityGroup');
        if (publicGroup) {
            publicGroup.style.display = currentUser.type === 'admin' ? 'block' : 'none';
        }
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    // Clear forms
    const modal = document.getElementById(modalId);
    const forms = modal.querySelectorAll('form');
    forms.forEach(form => form.reset());
    
    // Clear error messages
    const errorElements = modal.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

// Form Handlers
function handleAddContractor(e) {
    e.preventDefault();

    const name = document.getElementById('contractorName').value;
    const email = document.getElementById('contractorEmail').value;
    const phone = document.getElementById('contractorPhone').value;
    const specialty = document.getElementById('contractorSpecialty').value;

    // Generate username from name
    const username = name.toLowerCase().replace(/\s+/g, '_') + '_contractor';

    const newContractor = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        specialty: specialty,
        username: username,
        password: 'password123', // Default password
        profilePic: generateProfilePic(name)
    };

    contractors.push(newContractor);
    saveData();
    loadContractorsList();
    populateContractorSelect();
    closeModal('addContractorModal');
    showNotification(`Contractor ${name} added successfully! Username: ${username}`, 'success');
}

function handleAddContract(e) {
    e.preventDefault();

    // Only admin can create contracts
    if (currentUser.type !== 'admin') {
        showNotification('Only administrators can create contracts!', 'error');
        return;
    }

    const title = document.getElementById('contractTitle').value;
    const description = document.getElementById('contractDescription').value;
    const contractorId = parseInt(document.getElementById('contractContractor').value);
    const startDate = document.getElementById('contractStartDate').value;
    const endDate = document.getElementById('contractEndDate').value;
    const value = parseFloat(document.getElementById('contractValue').value);
    const isPublic = document.getElementById('contractPublic').checked;
    const files = document.getElementById('contractFiles').files;

    // Process uploaded files
    const fileList = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        fileList.push({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });
    }

    const newContract = {
        id: Date.now(),
        title: title,
        description: description,
        contractorId: contractorId,
        startDate: startDate,
        endDate: endDate,
        value: value,
        status: 'Active',
        isPublic: isPublic,
        files: fileList
    };

    contracts.push(newContract);
    saveData();
    loadAllContractsList();
    closeModal('addContractModal');
    showNotification('Contract added successfully!', 'success');
}

// Search and Filter
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    // Filter contractors
    const contractorItems = document.querySelectorAll('#contractorsList .item');
    contractorItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });

    // Filter contracts
    const contractItems = document.querySelectorAll('#allContractsList .item');
    contractItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
}

function handleStatusFilter(e) {
    const status = e.target.value;
    const containerId = e.target.id === 'statusFilter' ? 'allContractsList' : 'myContractsList';
    
    if (status === 'all') {
        // Show all contracts
        if (currentUser.type === 'admin') {
            loadAllContractsList();
        } else {
            loadMyContracts();
        }
    } else {
        // Filter by status
        const container = document.getElementById(containerId);
        const filteredContracts = contracts.filter(contract => {
            const matchesStatus = contract.status.toLowerCase() === status;
            const matchesUser = currentUser.type === 'admin' || contract.contractorId === currentUser.id;
            return matchesStatus && matchesUser;
        });

        container.innerHTML = '';
        
        if (filteredContracts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No contracts found.</p>';
            return;
        }

        filteredContracts.forEach(contract => {
            const contractor = contractors.find(c => c.id === contract.contractorId);
            let contractElement;
            
            if (currentUser.type === 'admin') {
                contractElement = createContractListElement(contract, contractor);
            } else {
                contractElement = createMyContractElement(contract);
            }
            
            container.appendChild(contractElement);
        });
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function generateProfilePic(name) {
    // Generate a simple avatar using initials
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const color = colors[name.length % colors.length];
    
    // Create SVG avatar
    const svg = `data:image/svg+xml,${encodeURIComponent(`
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="${color}"/>
            <text x="50" y="50" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="bold">${initials}</text>
        </svg>
    `)}`;
    
    return svg;
}

function populateContractorSelect() {
    const select = document.getElementById('contractContractor');
    select.innerHTML = '<option value="">Select Contractor</option>';

    // Only show this field for admin users
    if (currentUser.type === 'admin') {
        contractors.forEach(contractor => {
            const option = document.createElement('option');
            option.value = contractor.id;
            option.textContent = contractor.name;
            select.appendChild(option);
        });
        select.parentElement.style.display = 'block';
    } else {
        select.parentElement.style.display = 'none';
    }
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// CRUD Operations
function viewContractorDetails(contractorId) {
    const contractor = contractors.find(c => c.id === contractorId);
    const contractorContracts = contracts.filter(c => c.contractorId === contractorId);
    
    const content = document.getElementById('contractorDetailsContent');
    content.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 2rem;">
            <img src="${contractor.profilePic}" alt="${contractor.name}" class="profile-pic-dashboard">
            <div>
                <h2>${contractor.name}</h2>
                <p style="color: #667eea; font-weight: 500; margin: 0.5rem 0;">${contractor.specialty}</p>
                <p style="color: #666; margin: 0;"><i class="fas fa-envelope"></i> ${contractor.email}</p>
                <p style="color: #666; margin: 0.25rem 0;"><i class="fas fa-phone"></i> ${contractor.phone}</p>
            </div>
        </div>
        
        <h3 style="margin-bottom: 1rem; color: #333;">Login Information</h3>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin-bottom: 2rem;">
            <p><strong>Username:</strong> ${contractor.username}</p>
            <p><strong>Default Password:</strong> password123</p>
        </div>
        
        <h3 style="margin-bottom: 1rem; color: #333;">Contracts (${contractorContracts.length})</h3>
        <div style="max-height: 300px; overflow-y: auto;">
            ${contractorContracts.length > 0 ? 
                contractorContracts.map(contract => `
                    <div style="border: 1px solid #eee; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                        <h4 style="margin: 0 0 0.5rem 0; color: #333;">${contract.title}</h4>
                        <p style="margin: 0.25rem 0; color: #666;">${contract.description}</p>
                        <p style="margin: 0.25rem 0; color: #555;"><strong>Value:</strong> ₦${contract.value.toLocaleString()}</p>
                        <p style="margin: 0.25rem 0; color: #555;"><strong>Period:</strong> ${formatDate(contract.startDate)} - ${formatDate(contract.endDate)}</p>
                        <span class="status-badge ${contract.status.toLowerCase()}">${contract.status}</span>
                    </div>
                `).join('') : 
                '<p style="text-align: center; color: #666; font-style: italic;">No contracts assigned</p>'
            }
        </div>
    `;
    
    openModal('contractorDetailsModal');
}

function viewContractDetails(contractId) {
    const contract = contracts.find(c => c.id === contractId);
    const contractor = contractors.find(c => c.id === contract.contractorId);
    
    const content = document.getElementById('contractDetailsContent');
    content.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="color: #333; margin-bottom: 1rem;">${contract.title}</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">
                    <h4 style="color: #667eea; margin-bottom: 0.5rem;">Contractor</h4>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <img src="${contractor.profilePic}" alt="${contractor.name}" class="profile-pic">
                        <div>
                            <p style="font-weight: 500; margin: 0;">${contractor.name}</p>
                            <p style="color: #666; margin: 0; font-size: 0.9rem;">${contractor.specialty}</p>
                        </div>
                    </div>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">
                    <h4 style="color: #667eea; margin-bottom: 0.5rem;">Contract Value</h4>
                    <p style="font-size: 1.5rem; font-weight: bold; color: #333; margin: 0;">₦${contract.value.toLocaleString()}</p>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">
                    <h4 style="color: #667eea; margin-bottom: 0.5rem;">Duration</h4>
                    <p style="margin: 0; color: #333;"><strong>Start:</strong> ${formatDate(contract.startDate)}</p>
                    <p style="margin: 0; color: #333;"><strong>End:</strong> ${formatDate(contract.endDate)}</p>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">
                    <h4 style="color: #667eea; margin-bottom: 0.5rem;">Status</h4>
                    <span class="status-badge ${contract.status.toLowerCase()}">${contract.status}</span>
                </div>
            </div>
            
            <h4 style="color: #333; margin-bottom: 1rem;">Description</h4>
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; border-left: 4px solid #667eea; margin-bottom: 2rem;">
                <p style="margin: 0; line-height: 1.6; color: #555;">${contract.description}</p>
            </div>
            
            ${contract.files && contract.files.length > 0 ? `
                <h4 style="color: #333; margin-bottom: 1rem;">Contract Documents</h4>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin-bottom: 2rem;">
                    ${contract.files.map((file, index) => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 0.5rem; background: white;">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <i class="fas fa-file-${getFileIcon(file.type)}" style="color: #667eea; font-size: 1.2rem;"></i>
                                <div>
                                    <div style="font-weight: 500; color: #333;">${file.name}</div>
                                    <small style="color: #666;">${(file.size / 1024).toFixed(1)} KB • ${file.type || 'Unknown type'}</small>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline" onclick="downloadFile(${contract.id}, ${index})" style="padding: 0.25rem 0.75rem;">
                                <i class="fas fa-download"></i> Download
                            </button>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #eee; text-align: center;">
                <button class="btn btn-primary" onclick="exportContractToPDF(${contract.id})" style="margin-right: 1rem;">
                    <i class="fas fa-file-pdf"></i> Export to PDF
                </button>
                <button class="btn btn-secondary" onclick="printContract(${contract.id})">
                    <i class="fas fa-print"></i> Print Contract
                </button>
            </div>
        </div>
    `;
    
    openModal('contractDetailsModal');
}

function deleteContractor(contractorId) {
    if (confirm('Are you sure you want to delete this contractor? This will also delete all their contracts.')) {
        // Remove contractor
        contractors = contractors.filter(c => c.id !== contractorId);
        
        // Remove their contracts
        contracts = contracts.filter(c => c.contractorId !== contractorId);
        
        saveData();
        loadContractorsList();
        loadAllContractsList();
        populateContractorSelect();
        showNotification('Contractor deleted successfully!', 'success');
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

function toggleContractStatus(contractId) {
    const contract = contracts.find(c => c.id === contractId);
    contract.status = contract.status === 'Active' ? 'Inactive' : 'Active';
    saveData();
    loadAllContractsList();
    showNotification(`Contract ${contract.status.toLowerCase()}!`, 'success');
}

// Public Dashboard Functions
function loadPublicContracts() {
    const container = document.getElementById('publicContractsList');
    container.innerHTML = '';

    const publicContracts = contracts.filter(contract => contract.isPublic);

    if (publicContracts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No public contracts available.</p>';
        return;
    }

    publicContracts.forEach(contract => {
        const contractor = contractors.find(c => c.id === contract.contractorId);
        const contractElement = createPublicContractElement(contract, contractor);
        container.appendChild(contractElement);
    });
}

function createPublicContractElement(contract, contractor) {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
        <div class="item-info">
            <h4>${contract.title}</h4>
            <p>Contractor: ${contractor ? contractor.name : 'Unknown'}</p>
            <p>Specialty: ${contractor ? contractor.specialty : 'N/A'}</p>
            <p>Value: ₦${contract.value.toLocaleString()}</p>
            <p>Period: ${formatDate(contract.startDate)} - ${formatDate(contract.endDate)}</p>
            <span class="status-badge ${contract.status.toLowerCase()}">${contract.status}</span>
        </div>
        <div class="item-actions">
            <button class="btn btn-sm btn-primary" onclick="viewPublicContractDetails(${contract.id})">
                <i class="fas fa-eye"></i> View Details
            </button>
        </div>
    `;
    return div;
}

function handlePublicSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    const contractItems = document.querySelectorAll('#publicContractsList .item');
    contractItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
}

function viewPublicContractDetails(contractId) {
    const contract = contracts.find(c => c.id === contractId);
    const contractor = contractors.find(c => c.id === contract.contractorId);
    
    const content = document.getElementById('contractDetailsContent');
    content.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="color: #333; margin-bottom: 1rem;">${contract.title}</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">
                    <h4 style="color: #667eea; margin-bottom: 0.5rem;">Contractor</h4>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <img src="${contractor.profilePic}" alt="${contractor.name}" class="profile-pic">
                        <div>
                            <p style="font-weight: 500; margin: 0;">${contractor.name}</p>
                            <p style="color: #666; margin: 0; font-size: 0.9rem;">${contractor.specialty}</p>
                        </div>
                    </div>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">
                    <h4 style="color: #667eea; margin-bottom: 0.5rem;">Contract Value</h4>
                    <p style="font-size: 1.5rem; font-weight: bold; color: #333; margin: 0;">₦${contract.value.toLocaleString()}</p>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">
                    <h4 style="color: #667eea; margin-bottom: 0.5rem;">Duration</h4>
                    <p style="margin: 0; color: #333;"><strong>Start:</strong> ${formatDate(contract.startDate)}</p>
                    <p style="margin: 0; color: #333;"><strong>End:</strong> ${formatDate(contract.endDate)}</p>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">
                    <h4 style="color: #667eea; margin-bottom: 0.5rem;">Status</h4>
                    <span class="status-badge ${contract.status.toLowerCase()}">${contract.status}</span>
                </div>
            </div>
            
            <h4 style="color: #333; margin-bottom: 1rem;">Description</h4>
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; border-left: 4px solid #667eea; margin-bottom: 2rem;">
                <p style="margin: 0; line-height: 1.6; color: #555;">${contract.description}</p>
            </div>
            
            ${contract.files && contract.files.length > 0 ? `
                <h4 style="color: #333; margin-bottom: 1rem;">Contract Documents</h4>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">
                    ${contract.files.map(file => `
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <i class="fas fa-file"></i>
                            <span>${file.name}</span>
                            <small style="color: #666;">(${(file.size / 1024).toFixed(1)} KB)</small>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    openModal('contractDetailsModal');
}

// File handling functions
function getFileIcon(fileType) {
    if (!fileType) return 'alt';
    
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('word') || fileType.includes('doc')) return 'word';
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg') || fileType.includes('jpeg')) return 'image';
    if (fileType.includes('text')) return 'text';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'excel';
    return 'alt';
}

function downloadFile(contractId, fileIndex) {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract || !contract.files || !contract.files[fileIndex]) {
        showNotification('File not found!', 'error');
        return;
    }
    
    const file = contract.files[fileIndex];
    showNotification(`Downloading ${file.name}... (Note: This is a demo - actual file download would require server storage)`, 'info');
}

function exportContractToPDF(contractId) {
    const contract = contracts.find(c => c.id === contractId);
    const contractor = contractors.find(c => c.id === contract.contractorId);
    
    if (!contract) {
        showNotification('Contract not found!', 'error');
        return;
    }

    // Create a printable version of the contract
    const printWindow = window.open('', '_blank');
    const contractHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Contract - ${contract.title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
                .contract-title { font-size: 28px; font-weight: bold; color: #333; margin: 0; }
                .contract-id { color: #666; font-size: 14px; margin-top: 5px; }
                .section { margin-bottom: 25px; }
                .section-title { font-size: 18px; font-weight: bold; color: #667eea; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .info-item { padding: 15px; background: #f8f9fa; border-radius: 8px; }
                .info-label { font-weight: bold; color: #333; display: block; margin-bottom: 5px; }
                .info-value { color: #555; }
                .description { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
                .files-list { background: #f8f9fa; padding: 15px; border-radius: 8px; }
                .file-item { padding: 10px; background: white; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 8px; }
                .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
                @media print {
                    .no-print { display: none; }
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 class="contract-title">${contract.title}</h1>
                <div class="contract-id">Contract ID: ${contract.id} | Generated: ${new Date().toLocaleDateString()}</div>
            </div>
            
            <div class="section">
                <h2 class="section-title">Contract Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Contractor:</span>
                        <div class="info-value">${contractor.name}</div>
                        <div class="info-value" style="font-size: 14px; color: #666;">${contractor.specialty}</div>
                        <div class="info-value" style="font-size: 14px;">${contractor.email}</div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Contract Value:</span>
                        <div class="info-value" style="font-size: 24px; font-weight: bold; color: #667eea;">₦${contract.value.toLocaleString()}</div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Start Date:</span>
                        <div class="info-value">${formatDate(contract.startDate)}</div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">End Date:</span>
                        <div class="info-value">${formatDate(contract.endDate)}</div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Duration:</span>
                        <div class="info-value">${calculateDuration(contract.startDate, contract.endDate)}</div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <div class="info-value" style="font-weight: bold; color: ${contract.status === 'Active' ? '#28a745' : '#dc3545'};">${contract.status}</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">Description</h2>
                <div class="description">
                    ${contract.description}
                </div>
            </div>
            
            ${contract.files && contract.files.length > 0 ? `
                <div class="section">
                    <h2 class="section-title">Contract Documents</h2>
                    <div class="files-list">
                        ${contract.files.map(file => `
                            <div class="file-item">
                                <strong>${file.name}</strong><br>
                                <small>Size: ${(file.size / 1024).toFixed(1)} KB | Type: ${file.type || 'Unknown'}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="footer">
                <div>This contract was generated from ContractHub Management System</div>
                <div>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
            </div>
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print PDF</button>
                <button onclick="window.close()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(contractHTML);
    printWindow.document.close();
    
    showNotification('PDF export window opened! Use browser print to save as PDF.', 'success');
}

function printContract(contractId) {
    exportContractToPDF(contractId);
}

function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
        return `${diffDays} days`;
    } else if (diffDays < 30) {
        return `${Math.ceil(diffDays / 7)} weeks`;
    } else if (diffDays < 365) {
        return `${Math.ceil(diffDays / 30)} months`;
    } else {
        return `${Math.ceil(diffDays / 365)} years`;
    }
}
