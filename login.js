// login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginMessage = document.getElementById('loginMessage');
    const signupMessage = document.getElementById('signupMessage');

    // Helper function to update message display
    function showMessage(element, message, isError = true) {
        element.textContent = message;
        element.classList.remove('error', 'success'); // Clear previous states
        element.classList.add(isError ? 'error' : 'success');
    }

    // Toggle between login and signup forms
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active'); // Add 'active' to show login form
        signupForm.classList.remove('active'); // Remove 'active' from signup form
        loginMessage.textContent = ''; // Clear messages
        signupMessage.textContent = '';
        signupMessage.classList.remove('error', 'success'); // Clear classes
        loginMessage.classList.remove('error', 'success');
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active'); // Add 'active' to show signup form
        loginForm.classList.remove('active'); // Remove 'active' from login form
        loginMessage.textContent = ''; // Clear messages
        signupMessage.textContent = '';
        signupMessage.classList.remove('error', 'success'); // Clear classes
        loginMessage.classList.remove('error', 'success');
    });

    // Handle Login Form Submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Retrieve users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Find a user with matching email and password
        const foundUser = users.find(user => user.email === email && user.password === password);

        if (foundUser) {
            showMessage(loginMessage, 'Login successful!', false); // false for success
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUserEmail', foundUser.email); // Store current user's email
            // Redirect to the main dashboard page
            window.location.href = 'index.html'; // Assuming 'index.html' is your dashboard
        } else {
            showMessage(loginMessage, 'Invalid email or password.', true); // true for error
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUserEmail');
        }
    });

    // Handle Signup Form Submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            showMessage(signupMessage, 'All fields are required.', true);
            return;
        }

        if (password !== confirmPassword) {
            showMessage(signupMessage, 'Passwords do not match.', true);
            return;
        }

        // Retrieve existing users
        let users = JSON.parse(localStorage.getItem('users')) || [];

        // Check if user with this email already exists
        if (users.some(user => user.email === email)) {
            showMessage(signupMessage, 'An account with this email already exists.', true);
            return;
        }

        // Add new user to the array
        users.push({ name, email, password });

        // Save updated users array to localStorage
        localStorage.setItem('users', JSON.stringify(users));

        showMessage(signupMessage, `User ${name} registered successfully! You can now login.`, false); // false for success
        
        // Optionally, automatically switch to the login tab after successful signup
        // You might want to delay this slightly or clear the message first
        setTimeout(() => {
            loginTab.click(); // Programmatically click the login tab
            signupForm.reset(); // Clear signup form fields
        }, 1500); // Wait 1.5 seconds before switching
    });

    // Initial check: if already logged in, redirect to dashboard
    function checkInitialLogin() {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            window.location.href = 'index.html'; // Redirect if already logged in
        }
    }
    checkInitialLogin();

    // Ensure the login form is active by default when page loads
    if (!loginForm.classList.contains('active') && !signupForm.classList.contains('active')) {
        loginTab.click(); // Simulate click to activate login tab
    }
});