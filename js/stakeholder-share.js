document.addEventListener('DOMContentLoaded', () => {
    const stakeholderSections = document.getElementById('stakeholder-sections');
    const totalStakeholderShareElement = document.getElementById('total-stakeholder-share');
    const clearStakeholderShareButton = document.getElementById('clear-stakeholder-share');

    let totalStakeholderShare = 0;
    const orders = JSON.parse(localStorage.getItem('totalSales')) || [];

    // Group sales entries by date
    const groupedOrders = orders.reduce((acc, order) => {
        const date = order.date.split(' ')[0]; // Extract only the date (e.g., "12/01/2024")
        if (!acc[date]) acc[date] = [];
        acc[date].push(order);
        return acc;
    }, {});

    // Display sales grouped by date
    Object.keys(groupedOrders).forEach(date => {
        let dailyTotalShare = 0;

        // Create a section for this date
        const section = document.createElement('div');
        section.className = 'daily-section';
        section.innerHTML = `<h2>Date: ${date}</h2>`;
        stakeholderSections.appendChild(section);

        // Create a table for this date
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date & Time</th>
                    <th>Total Amount</th>
                    <th>15% Stakeholder Share</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        section.appendChild(table);

        const tbody = table.querySelector('tbody');

        groupedOrders[date].forEach(order => {
            const stakeholderShare = (order.totalAmount * 0.15).toFixed(2);
            dailyTotalShare += parseFloat(stakeholderShare);

            // Create a row for each sale entry
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.date}</td>
                <td>N${order.totalAmount.toFixed(2)}</td>
                <td>N${stakeholderShare}</td>
            `;
            tbody.appendChild(row);
        });

        // Append the daily total row
        const totalRow = document.createElement('tr');
        totalRow.className = 'daily-total';
        totalRow.innerHTML = `
            <td colspan="2">Daily Total 15% Share:</td>
            <td>N${dailyTotalShare.toFixed(2)}</td>
        `;
        tbody.appendChild(totalRow);

        // Update the overall total
        totalStakeholderShare += dailyTotalShare;
    });

    // Display the total 15% stakeholder share
    totalStakeholderShareElement.textContent = `N${totalStakeholderShare.toFixed(2)}`;

    // Clear stakeholder share data
    clearStakeholderShareButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the 15% Stakeholder Share data?')) {
            localStorage.removeItem('totalSales');
            stakeholderSections.innerHTML = '';
            totalStakeholderShare = 0;
            totalStakeholderShareElement.textContent = 'N0.00';
        }
    });
});
