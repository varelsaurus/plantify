// ==========================================
// 🔥 FIREBASE CONFIGURATION - Plantify
// ==========================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6HQSq9yxm3lQaeH7ikcaG-yHLpVHnt0w",
    authDomain: "plantify-d1a62.firebaseapp.com",
    projectId: "plantify-d1a62",
    storageBucket: "plantify-d1a62.firebasestorage.app",
    messagingSenderId: "622753577625",
    appId: "1:622753577625:web:ebb0314257835573c11608",
    measurementId: "G-P427BGR872"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
window.auth = firebase.auth();
window.db = firebase.firestore();

// ==========================================
// 👤 AUTHENTICATION STATE
// ==========================================

window.currentUser = null;

// Listen for auth state changes
window.auth.onAuthStateChanged((user) => {
    window.currentUser = user;
    updateAuthUI();

    if (user) {
        console.log('✅ User logged in:', user.email);
        loadUserData();
    } else {
        console.log('❌ User logged out');
        mySavedPlants = []; // Clear local saved plants
    }
});

// ==========================================
// 🔐 AUTH FUNCTIONS
// ==========================================

// Register new user
async function registerUser(email, password, name) {
    try {
        const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);

        // Update display name
        await userCredential.user.updateProfile({
            displayName: name
        });

        // Create user document in Firestore
        await window.db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            savedPlants: [],
            reminders: []
        });

        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

// Login user
async function loginUser(email, password) {
    try {
        const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// Logout user
async function logoutUser() {
    try {
        await window.auth.signOut();
        showNotification('✅ Logged out successfully!', 'success');

        // Refresh UI immediately
        setTimeout(() => {
            switchPage('dashboard');
            analyzeManualData();
        }, 300);

        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('❌ Logout failed: ' + error.message, 'error');
        return { success: false, error: error.message };
    }
}

// ==========================================
// 💾 FIRESTORE DATA FUNCTIONS
// ==========================================

// Load user data (saved plants & reminders)
async function loadUserData() {
    if (!window.currentUser) return;

    try {
        const userDoc = await window.db.collection('users').doc(window.currentUser.uid).get();

        if (userDoc.exists) {
            const data = userDoc.data();
            mySavedPlants = data.savedPlants || [];

            // Refresh UI
            const activePage = document.querySelector('.page-content.active');
            if (activePage) {
                if (activePage.id === 'page-myplants') renderMyPlantsPage();
                if (activePage.id === 'page-reminders') renderRemindersPage();
                if (activePage.id === 'page-dashboard') analyzeManualData();
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Save plant to user's collection
async function savePlantToFirestore(plantId) {
    if (!window.currentUser) {
        showAuthModal('login');
        return { success: false, error: 'Please login first' };
    }

    try {
        await window.db.collection('users').doc(window.currentUser.uid).update({
            savedPlants: firebase.firestore.FieldValue.arrayUnion(plantId)
        });

        if (!mySavedPlants.includes(plantId)) {
            mySavedPlants.push(plantId);
        }

        return { success: true };
    } catch (error) {
        console.error('Error saving plant:', error);
        return { success: false, error: error.message };
    }
}

// Remove plant from user's collection
async function removePlantFromFirestore(plantId) {
    if (!window.currentUser) return { success: false, error: 'Not logged in' };

    try {
        await window.db.collection('users').doc(window.currentUser.uid).update({
            savedPlants: firebase.firestore.FieldValue.arrayRemove(plantId)
        });

        mySavedPlants = mySavedPlants.filter(id => id !== plantId);

        return { success: true };
    } catch (error) {
        console.error('Error removing plant:', error);
        return { success: false, error: error.message };
    }
}

// Save watering reminder
async function saveWateringReminder(plantId, frequencyDays) {
    if (!window.currentUser) return { success: false, error: 'Not logged in' };

    try {
        const reminder = {
            plantId: plantId,
            frequencyDays: frequencyDays,
            lastWatered: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await window.db.collection('users').doc(window.currentUser.uid)
            .collection('reminders').doc(plantId).set(reminder);

        return { success: true };
    } catch (error) {
        console.error('Error saving reminder:', error);
        return { success: false, error: error.message };
    }
}

// Get user's reminders
async function getUserReminders() {
    if (!window.currentUser) return [];

    try {
        const snapshot = await window.db.collection('users').doc(window.currentUser.uid)
            .collection('reminders').get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting reminders:', error);
        return [];
    }
}

// Mark plant as watered
async function markAsWatered(plantId) {
    if (!window.currentUser) return { success: false, error: 'Not logged in' };

    try {
        await window.db.collection('users').doc(window.currentUser.uid)
            .collection('reminders').doc(plantId).update({
                lastWatered: firebase.firestore.FieldValue.serverTimestamp()
            });

        return { success: true };
    } catch (error) {
        console.error('Error marking as watered:', error);
        return { success: false, error: error.message };
    }
}

// ==========================================
// 🎨 UI FUNCTIONS
// ==========================================

// Update UI based on auth state
function updateAuthUI() {
    const authButton = document.getElementById('auth-button');
    const userDisplay = document.getElementById('user-display');

    if (authButton) {
        if (window.currentUser) {
            authButton.innerHTML = `
                <div class="flex items-center gap-2 cursor-pointer" onclick="showUserMenu()">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span class="text-green-700 font-bold text-sm">${window.currentUser.displayName ? window.currentUser.displayName.charAt(0).toUpperCase() : 'U'}</span>
                    </div>
                    <span class="text-sm font-medium text-gray-700 hidden lg:block">${window.currentUser.displayName || 'User'}</span>
                </div>
            `;
        } else {
            authButton.innerHTML = `
                <button onclick="showAuthModal('login')" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                    Login
                </button>
            `;
        }
    }

    lucide.createIcons();
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('auth-password');
    const eyeIcon = document.getElementById('password-eye-icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
        passwordInput.type = 'password';
        eyeIcon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

// Show auth modal (login/register)
function showAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    const modalTitle = document.getElementById('auth-modal-title');
    const authForm = document.getElementById('auth-form');
    const switchAuthMode = document.getElementById('switch-auth-mode');

    if (!modal) return;

    modal.classList.remove('hidden');
    modal.dataset.mode = mode;

    if (mode === 'login') {
        modalTitle.textContent = 'Welcome Back! 🌿';
        document.getElementById('name-field').classList.add('hidden');
        document.getElementById('auth-submit-btn').textContent = 'Login';
        switchAuthMode.innerHTML = `Don't have an account? <button type="button" onclick="showAuthModal('register')" class="text-green-600 font-bold">Register</button>`;
    } else {
        modalTitle.textContent = 'Join Plantify! 🌱';
        document.getElementById('name-field').classList.remove('hidden');
        document.getElementById('auth-submit-btn').textContent = 'Register';
        switchAuthMode.innerHTML = `Already have an account? <button type="button" onclick="showAuthModal('login')" class="text-green-600 font-bold">Login</button>`;
    }
}

// Close auth modal
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
}

// Handle auth form submit
async function handleAuthSubmit(event) {
    event.preventDefault();

    const modal = document.getElementById('auth-modal');
    const mode = modal.dataset.mode;
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;
    const submitBtn = document.getElementById('auth-submit-btn');
    const errorDiv = document.getElementById('auth-error');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Please wait...';
    errorDiv.classList.add('hidden');

    let result;
    if (mode === 'login') {
        result = await loginUser(email, password);
    } else {
        result = await registerUser(email, password, name);
    }

    if (result.success) {
        closeAuthModal();
        document.getElementById('auth-form').reset();

        // Show success notification
        const message = mode === 'login' ? '✅ Welcome back!' : '🎉 Account created successfully!';
        showNotification(message, 'success');

        // Refresh dashboard after login
        setTimeout(() => {
            switchPage('dashboard');
        }, 300);
    } else {
        errorDiv.textContent = result.error;
        errorDiv.classList.remove('hidden');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = mode === 'login' ? 'Login' : 'Register';
}

// Show user menu (logout option)
function showUserMenu() {
    const existing = document.getElementById('user-menu');
    if (existing) {
        existing.remove();
        return;
    }

    const menu = document.createElement('div');
    menu.id = 'user-menu';
    menu.className = 'absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-[999] min-w-[200px]';
    menu.innerHTML = `
        <div class="px-4 py-3 border-b border-gray-100">
            <p class="text-sm font-bold text-gray-800">${window.currentUser?.displayName || 'User'}</p>
            <p class="text-xs text-gray-500 truncate">${window.currentUser?.email}</p>
        </div>
        <div class="px-2 pt-2">
            <button onclick="handleLogout()" class="w-full px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 rounded-xl transition-colors font-medium">
                <i data-lucide="log-out" class="w-4 h-4"></i>
                Logout
            </button>
        </div>
    `;

    document.getElementById('auth-button').appendChild(menu);
    lucide.createIcons();

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!e.target.closest('#auth-button')) {
                const menu = document.getElementById('user-menu');
                if (menu) menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

// Handle logout with proper cleanup
function handleLogout() {
    const menu = document.getElementById('user-menu');
    if (menu) menu.remove();
    logoutUser();
}

// ==========================================
// 🔔 NOTIFICATION SYSTEM
// ==========================================

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.getElementById('toast-notification');
    if (existing) existing.remove();

    // Create notification
    const toast = document.createElement('div');
    toast.id = 'toast-notification';

    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-indigo-600';
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';

    toast.className = `fixed top-6 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 font-bold text-sm animate-slide-down`;
    toast.innerHTML = `
        <i data-lucide="${icon}" class="w-5 h-5"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);
    lucide.createIcons();

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

console.log('🔥 Firebase initialized for Plantify');
