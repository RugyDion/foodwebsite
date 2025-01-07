document.addEventListener('DOMContentLoaded', function () {
    
    app.get('/favicon.ico', (req, res) => {
        res.sendFile(path.join(__dirname, 'favicon_io', 'favicon.ico'));
    });
    

    // Retrieve JWT auth token from localStorage
    const getAuthToken = () => {
        const token = localStorage.getItem('authToken');
        console.log('Auth Token Retrieved:', token);
        return token;
    };

    // Handle missing JWT token by redirecting to the login page
    const handleMissingToken = () => {
        console.warn('No auth token found. Redirecting to login page.');
        window.location.href = '/admin-login.html';
    };

    // Handle form submission for login
    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('https://localhost:8443/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            
            const result = await response.json();
            if (result.success) {
                // Store token and redirect
                localStorage.setItem('authToken', result.token);
                console.log('Auth Token Stored:', result.token);
                window.location.href = 'https://localhost:8443/dashboard.html'; // Redirect to dashboard
            } else {
                console.error('Login failed:', result.message);
                alert('Login failed: ' + result.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login. Please try again later.');
        }
    });

    // Redirect if already authenticated
    if (getAuthToken()) {
        window.location.href = 'https://localhost:8443/dashboard.html'; // Redirect to dashboard if already logged in
    }


    // Function to check for 401 Unauthorized and handle token expiry
const checkForUnauthorized = (response) => {
    if (response.status === 401) {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/admin-login.html';
    }
};

// Example: Fetch user data after login
fetch('https://localhost:8443/user-data', {
    headers: {
        'Authorization': `Bearer ${getAuthToken()}`
    }
})
.then(response => checkForUnauthorized(response)) // Check if unauthorized
.catch(error => console.error('Error fetching user data:', error));


});
