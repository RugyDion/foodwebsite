// paymentOnDeliveryReport.js
document.addEventListener('DOMContentLoaded', () => {
    const reportTableBody = document.querySelector('#report-table tbody');
    const emptyReportMessage = document.getElementById('empty-report-message');

    function loadReportData() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];

        reportTableBody.innerHTML = '';

        if (orders.length === 0) {
            emptyReportMessage.style.display = 'block';
        } else {
            emptyReportMessage.style.display = 'none';

            orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.name}</td>
                    <td>${order.phoneNumber}</td>
                    <td>${order.address}</td>
                    <td>
                        ${order.items.map(item => `${item.quantity}x ${item.name} - ₦${item.price.toFixed(2)}`).join('<br>')}
                    </td>
                    <td>₦${order.totalAmount.toFixed(2)}</td>
                    <td>${order.date || 'N/A'}</td>
                `;
                reportTableBody.appendChild(row);
            });
        }
    }

    loadReportData();
});
