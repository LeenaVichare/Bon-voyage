// Authentication JavaScript for Tourist Safety System
// Handles login, signup, validation, and session management

let currentAuthScreen = 'welcome';

// Initialize authentication system
document.addEventListener('DOMContentLoaded', function() {
    updateTime();
    setInterval(updateTime, 30000);
    
    // Check if already logged in
    checkExistingSession();
    
    // Auto-hide back button initially
    updateBackButton();
});

// Screen Navigation Functions
function showWelcome() {
    switchAuthScreen('welcome');
}

function showLogin() {
    switchAuthScreen('login');
}

function showSignup() {
    switchAuthScreen('signup');
}

function switchAuthScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.form-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenName + 'Screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentAuthScreen = screenName;
        updateBackButton();
        
        // Clear any previous form errors
        clearFormErrors();
    }
}

function updateBackButton() {
    const backBtn = document.getElementById('backBtn');
    if (currentAuthScreen === 'welcome') {
        backBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'block';
    }
}

// Time Update Function
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    document.querySelector('.time').textContent = timeStr.slice(0, 5);
}

// Login Handling
async function handleLogin(event) {
    event.preventDefault();
    
    const loginBtn = document.getElementById('loginBtn');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Clear previous errors
    clearFormErrors();
    
    // Validation
    if (!validateLogin(email, password)) {
        return;
    }
    
    // Show loading state
    setLoadingState(loginBtn, true);
    
    try {
        // Simulate API call delay
        await delay(2000);
        
        // Simulate login logic
        const loginResult = await simulateLogin(email, password);
        
        if (loginResult.success) {
            // Store session
            storeSession(loginResult.user, rememberMe);
            
            // Show success and redirect
            showNotification('Login successful! Redirecting...', 'success');
            await delay(1000);
            redirectToApp();
        } else {
            showFormError('loginPassword', loginResult.error || 'Invalid credentials');
        }
    } catch (error) {
        showFormError('loginEmail', 'Network error. Please try again.');
    } finally {
        setLoadingState(loginBtn, false);
    }
}

// Signup Handling
async function handleSignup(event) {
    event.preventDefault();
    
    const signupBtn = document.getElementById('signupBtn');
    const formData = getSignupFormData();
    
    // Clear previous errors
    clearFormErrors();
    
    // Validation
    if (!validateSignup(formData)) {
        return;
    }
    
    // Show loading state
    setLoadingState(signupBtn, true);
    
    try {
        // Simulate API call delay
        await delay(3000);
        
        // Simulate signup logic
        const signupResult = await simulateSignup(formData);
        
        if (signupResult.success) {
            // Store session
            storeSession(signupResult.user, false);
            
            // Show success and redirect
            showNotification('Digital Tourist ID created successfully!', 'success');
            await delay(1500);
            redirectToApp();
        } else {
            showFormError('signupEmail', signupResult.error || 'Registration failed');
        }
    } catch (error) {
        showFormError('signupEmail', 'Network error. Please try again.');
    } finally {
        setLoadingState(signupBtn, false);
    }
}

// Emergency Login (bypass normal authentication)
function emergencyLogin() {
    showNotification('Emergency access granted. Contacting authorities...', 'warning');
    
    setTimeout(() => {
        const emergencyUser = {
            id: 'EMERGENCY-' + Date.now(),
            name: 'Emergency User',
            email: 'emergency@tourist-safety.gov.in',
            isEmergency: true,
            digitalId: 'EMG-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            location: 'Unknown Location'
        };
        
        storeSession(emergencyUser, false);
        redirectToApp();
    }, 2000);
}

// Form Data Collection
function getSignupFormData() {
    return {
        name: document.getElementById('signupName').value.trim(),
        email: document.getElementById('signupEmail').value.trim(),
        phone: document.getElementById('signupPhone').value.trim(),
        idType: document.getElementById('signupIdType').value,
        idNumber: document.getElementById('signupIdNumber').value.trim(),
        visitDuration: document.getElementById('visitDuration').value,
        password: document.getElementById('signupPassword').value,
        agreeTerms: document.getElementById('agreeTerms').checked,
        emergencyConsent: document.getElementById('emergencyConsent').checked
    };
}

// Validation Functions
function validateLogin(email, password) {
    let isValid = true;
    
    if (!email) {
        showFormError('loginEmail', 'Email or Tourist ID is required');
        isValid = false;
    }
    
    if (!password) {
        showFormError('loginPassword', 'Password is required');
        isValid = false;
    } else if (password.length < 4) {
        showFormError('loginPassword', 'Password too short');
        isValid = false;
    }
    
    return isValid;
}

function validateSignup(data) {
    let isValid = true;
    
    // Name validation
    if (!data.name || data.name.length < 2) {
        showFormError('signupName', 'Please enter your full name');
        isValid = false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email) {
        showFormError('signupEmail', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(data.email)) {
        showFormError('signupEmail', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
    if (!data.phone) {
        showFormError('signupPhone', 'Phone number is required');
        isValid = false;
    } else if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
        showFormError('signupPhone', 'Please enter a valid phone number');
        isValid = false;
    }
    
    // ID validation
    if (!data.idType) {
        showFormError('signupIdType', 'Please select an identity document type');
        isValid = false;
    }
    
    if (!data.idNumber) {
        showFormError('signupIdNumber', 'Document number is required');
        isValid = false;
    } else if (!validateIdNumber(data.idType, data.idNumber)) {
        showFormError('signupIdNumber', 'Invalid document number format');
        isValid = false;
    }
    
    // Password validation
    if (!data.password) {
        showFormError('signupPassword', 'Password is required');
        isValid = false;
    } else if (data.password.length < 6) {
        showFormError('signupPassword', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    // Terms agreement
    if (!data.agreeTerms) {
        showFormError('agreeTerms', 'You must agree to the terms and conditions');
        isValid = false;
    }
    
    return isValid;
}

function validateIdNumber(idType, idNumber) {
    switch (idType) {
        case 'aadhaar':
            return /^\d{12}$/.test(idNumber.replace(/\s/g, ''));
        case 'passport':
            return /^[A-Z]{1,2}\d{7,8}$/.test(idNumber.toUpperCase());
        case 'dl':
            return /^[A-Z]{2}\d{13}$/.test(idNumber.toUpperCase().replace(/\s/g, ''));
        case 'voter':
            return /^[A-Z]{3}\d{7}$/.test(idNumber.toUpperCase());
        default:
            return true;
    }
}

// Simulation Functions
async function simulateLogin(email, password) {
    // Simulate network delay
    await delay(1000);
    
    // Demo credentials
    const demoUsers = {
        'sandra@email.com': {
            password: 'demo123',
            user: {
                id: 'TD-2024-11-001',
                name: 'Sandra Glam',
                email: 'sandra@email.com',
                phone: '+91 98765 43210',
                digitalId: 'TD-2024-11-001',
                idType: 'passport',
                location: 'Shillong, Meghalaya',
                joinedDate: '2024-11-20',
                safetyScore: 82,
                isVerified: true
            }
        },
        'demo': {
            password: 'demo',
            user: {
                id: 'TD-2024-11-002',
                name: 'Demo Tourist',
                email: 'demo@tourist-safety.com',
                phone: '+91 87654 32109',
                digitalId: 'TD-2024-11-002',
                idType: 'aadhaar',
                location: 'Shillong, Meghalaya',
                joinedDate: '2024-11-20',
                safetyScore: 95,
                isVerified: true
            }
        }
    };
    
    const userAuth = demoUsers[email.toLowerCase()];
    
    if (userAuth && userAuth.password === password) {
        return { success: true, user: userAuth.user };
    } else {
        return { success: false, error: 'Invalid email or password' };
    }
}

async function simulateSignup(formData) {
    // Simulate network delay
    await delay(2000);
    
    // Check if email already exists (simulation)
    const existingEmails = ['test@email.com', 'admin@tourist-safety.com'];
    if (existingEmails.includes(formData.email.toLowerCase())) {
        return { success: false, error: 'Email already registered' };
    }
    
    // Generate digital tourist ID
    const digitalId = 'TD-' + new Date().getFullYear() + '-' + 
        (new Date().getMonth() + 1).toString().padStart(2, '0') + '-' +
        Math.random().toString().substr(2, 3);
    
    const newUser = {
        id: digitalId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        digitalId: digitalId,
        idType: formData.idType,
        idNumber: formData.idNumber.slice(-4), // Store only last 4 digits for privacy
        visitDuration: formData.visitDuration,
        location: 'Shillong, Meghalaya',
        joinedDate: new Date().toISOString().split('T')[0],
        safetyScore: 80, // Initial score
        isVerified: false,
        emergencyConsent: formData.emergencyConsent
    };
    
    return { success: true, user: newUser };
}

// Session Management
function storeSession(user, rememberMe) {
    const sessionData = {
        user: user,
        loginTime: Date.now(),
        expiresIn: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days or 1 day
    };
    
    localStorage.setItem('touristSafetySession', JSON.stringify(sessionData));
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function checkExistingSession() {
    const session = localStorage.getItem('touristSafetySession');
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            const now = Date.now();
            
            if (now - sessionData.loginTime < sessionData.expiresIn) {
                // Valid session exists
                setTimeout(() => {
                    redirectToApp();
                }, 1000);
            } else {
                // Session expired
                localStorage.removeItem('touristSafetySession');
                localStorage.removeItem('currentUser');
            }
        } catch (error) {
            // Invalid session data
            localStorage.removeItem('touristSafetySession');
            localStorage.removeItem('currentUser');
        }
    }
}

function redirectToApp() {
    window.location.href = 'index.html';
}

// UI Helper Functions
function showFormError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(fieldName + 'Error');
    
    if (field) {
        field.classList.add('error');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearFormErrors() {
    document.querySelectorAll('.form-input, .form-select').forEach(field => {
        field.classList.remove('error');
    });
    
    document.querySelectorAll('.error-message').forEach(error => {
        error.style.display = 'none';
        error.textContent = '';
    });
}

function setLoadingState(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.loading');
    
    if (isLoading) {
        button.classList.add('btn-loading');
        button.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (spinner) spinner.style.display = 'inline-block';
    } else {
        button.classList.remove('btn-loading');
        button.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (spinner) spinner.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        z-index: 1000;
        font-size: 14px;
        font-weight: 500;
        max-width: 90%;
        animation: slideDown 0.3s ease-out;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideUp 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-triangle';
        case 'warning': return 'fa-exclamation-circle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#3b82f6';
    }
}

// Terms and Conditions Modal (placeholder)
function showTerms() {
    showNotification('Terms & Conditions: This is a demo system for tourist safety monitoring with AI, blockchain, and geo-fencing features.', 'info');
}

// Utility Functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Export functions for global access
window.showWelcome = showWelcome;
window.showLogin = showLogin;
window.showSignup = showSignup;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.emergencyLogin = emergencyLogin;
window.showTerms = showTerms;

console.log('🔐 Tourist Safety Authentication System loaded successfully!');
