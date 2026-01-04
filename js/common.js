// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const userEmail = currentUser ? currentUser.email : 'guest';

if (!currentUser && !window.location.href.includes('login.html')) {
    window.location.href = 'login.html'; // Redirect to login if not logged in
}

// Update Top Nav
document.addEventListener('DOMContentLoaded', () => {
    const welcomeEl = document.getElementById('topWelcome');
    if (welcomeEl && currentUser) {
        welcomeEl.textContent = `Welcome, ${currentUser.name}`;
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
});