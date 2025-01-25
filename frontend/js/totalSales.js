document.addEventListener('DOMContentLoaded', () => {
    const salesContainer = document.getElementById('sales-container');
    const emptyMessage = document.getElementById('empty-sales-message');
    const clearSalesButton = document.getElementById('clear-sales');

    // Load total sales from localStorage
    function loadTotalSales() {
        const totalSales = JSON.parse(localStorage.getItem('totalSales')) || [];

        // Clear the container to avoid duplicating entries
        salesContainer.innerHTML = '';

        if (totalSales.length === 0) {
            emptyMessage.style.display = 'block';
            clearSalesButton.style.display = 'none';
        } else {
            emptyMessage.style.display = 'none';
            clearSalesButton.style.display = 'inline-block';

            // Group entries by date
            const groupedSales = totalSales.reduce((acc, entry) => {
                const date = entry.date.split(' ')[0]; // Extract date (e.g., "12/01/2024")
                if (!acc[date]) acc[date] = [];
                acc[date].push(entry);
                return acc;
            }, {});

            // Display sales grouped by date
            Object.keys(groupedSales).forEach(date => {
                // Add a date header
                const dateHeader = document.createElement('div');
                dateHeader.className = 'date-header';
                dateHeader.textContent = `Date: ${date}`;
                salesContainer.appendChild(dateHeader);

                // Create a table for sales on this date
                const table = document.createElement('table');
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Note</th>
                            <th>Date/Time</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;

                const tbody = table.querySelector('tbody');
                let dailyTotal = 0;

                groupedSales[date].forEach(entry => {
                    dailyTotal += entry.totalAmount;
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${entry.note}</td>
                        <td>${entry.date}</td>
                        <td>N${entry.totalAmount.toFixed(2)}</td>
                    `;
                    tbody.appendChild(row);
                });

                // Append the daily total row
                const totalRow = document.createElement('tr');
                totalRow.className = 'daily-total';
                totalRow.innerHTML = `
                    <td colspan="2">Daily Total:</td>
                    <td>N${dailyTotal.toFixed(2)}</td>
                `;
                tbody.appendChild(totalRow);

                salesContainer.appendChild(table);
            });
        }
    }

    // Clear all sales entries from localStorage
    clearSalesButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all sales records?')) {
            localStorage.removeItem('totalSales');
            loadTotalSales();
        }
    });

    // Function to add a new sale entry to localStorage
    function addSaleEntry(entry) {
        const totalSales = JSON.parse(localStorage.getItem('totalSales')) || [];
        totalSales.push(entry);
        localStorage.setItem('totalSales', JSON.stringify(totalSales));
        loadTotalSales();
    }

    // Initial load of the sales entries
    loadTotalSales();

    // Example: Adding a new sale entry (replace this with your actual logic for adding sales)
    /*
    addSaleEntry({
        date: new Date().toLocaleString(),
        totalAmount: 1000,
        note: 'Payment on Delivery'
    });
    */
});
