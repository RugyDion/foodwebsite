$('#menu-icon').click(function () {
    $('#menu').toggleClass("active");
});

function checkLogin() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        document.getElementById('welcomeName').textContent = loggedInUser.name;
    } else {
        // If not logged in, redirect to login page
        window.location.href = 'admin-login.html';
    }
}

// Disable back button navigation after login
function disableBackNavigation() {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
        window.history.pushState(null, '', window.location.href);
    };
}

async function init() {
    document.getElementById("welcomeName").textContent = JSON.parse(localStorage.getItem("user")).name;

    // Delivery handler
    const res1 = await fetch("/api/v1/Delivery");
    const completedDelivery = await res1.json() || [];
    document.getElementById("Delivery-count").textContent = completedDelivery.filter(b => b.isConfirmed).length;

    // Card handler
    const res2 = await fetch("/api/v1/Card");
    const card = await res2.json();
    const cardEntries = card.card || [];
    document.getElementById("card-count").textContent = cardEntries.length;
}

// Logout function
async function logout() {
    localStorage.clear();
    await fetch("api/v1/users/logout", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-type": "application/json"
        }
    });
    window.location.href = 'admin-login.html';
}

setInterval(async () => {
    const res = await fetch("/api/v1/users/check", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({ username: JSON.parse(localStorage.getItem("user")).username })
    });
    if (res.ok) {
        const user = await res.json();
        if (user.name) {
            // Normal
        } else {
            logout();
        }
    } else {
        logout();
    }
}, 10600);

// Initialize functions
checkLogin();
disableBackNavigation();
init();

let targetPage = '';

// Function to open the modal
function openModal(page) {
    targetPage = page; // Store the page to redirect after login
    document.getElementById('loginModal').style.display = 'block';
}

// Function to close the modal
function closeModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// Function to validate the login and redirect if successful
async function validateLogin() {
    const modalUsername = document.getElementById('modalUsername').value;
    const modalPassword = document.getElementById('modalPassword').value;

    const res = await fetch("/api/v1/users/login", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({ username: modalUsername, password: modalPassword })
    });
    if (res.ok) {
        closeModal(); // Close the modal
        window.location.href = targetPage; // Redirect to the target page
    } else {
        alert('Invalid credentials! Please try again.');
    }
}

// Close the modal if the user clicks outside of it
window.onclick = function (event) {
    const modal = document.getElementById('loginModal');
    if (event.target == modal) {
        closeModal();
    }
};

document.addEventListener("DOMContentLoaded", function () {
    updateDeliveryCount(); // Ensure count is updated when the page loads
});

// Function to update the booking count in the dashboard card
function updateDeliveryCount() {
    init();
}

// Chart: Sales Data from totalSales.html
document.addEventListener('DOMContentLoaded', () => {
    // Fetch and process sales data from localStorage
    const totalSalesData = JSON.parse(localStorage.getItem('totalSales')) || [];
    const groupedSales = totalSalesData.reduce((acc, entry) => {
        const date = entry.date.split(' ')[0]; // Extract date (e.g., "12/01/2024")
        acc[date] = (acc[date] || 0) + entry.totalAmount;
        return acc;
    }, {});

    // Get the last two dates for chart data
    const sortedDates = Object.keys(groupedSales).sort((a, b) => new Date(a) - new Date(b));
    const [yesterday, today] = sortedDates.slice(-2);
    const yesterdaySales = groupedSales[yesterday] || 0;
    const todaySales = groupedSales[today] || 0;

    // Comparison analysis
    const comparison = todaySales > yesterdaySales
        ? "Today's sales are better than yesterday's."
        : todaySales < yesterdaySales
            ? "Today's sales are worse than yesterday's."
            : "Sales are the same as yesterday.";

    console.log(comparison); // For debugging

    // Create the chart
    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Yesterday', 'Today'],
            datasets: [{
                label: 'Sales (₦)',
                data: [yesterdaySales, todaySales],
                backgroundColor: ['#ff6384', '#36a2eb'],
                borderColor: ['#ff6384', '#36a2eb'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Daily Sales Comparison'
                }
            }
        }
    });

    // Update the total sales dynamically in the dashboard card
    const totalCount = document.getElementById('total-count');
    totalCount.textContent = `₦${todaySales.toLocaleString()}`;
});
