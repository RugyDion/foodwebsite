document.addEventListener('DOMContentLoaded', () => {
    const dispatchTable = document.getElementById('dispatch-table');
    const emptyMessage = document.getElementById('empty-dispatch-message');

    function loadDispatchOrders() {
        const dispatchOrders = JSON.parse(localStorage.getItem('readyForDelivery')) || [];

        dispatchTable.innerHTML = '';

        if (dispatchOrders.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';

            dispatchOrders.forEach((order, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.name || 'N/A'}</td>
                    <td>${order.phoneNumber || 'N/A'}</td>
                    <td>${order.address || 'N/A'}</td>
                    <td>${order.items.map(item => `${item.quantity}x ${item.name} - ₦${item.price.toFixed(2)}`).join('<br>')}</td>
                    <td>₦${order.totalAmount.toFixed(2)}</td>
                    <td>${order.date || 'N/A'}</td>
                    <td>${order.paymentMethod || 'N/A'}</td>
                    <td>${order.paymentStatus === 'onDelivery' ? 'Payment on Delivery' : 'Online Payment'}</td>
                    <td>
                        <button class="delivered-btn" data-index="${index}">Mark as Delivered</button>
                    </td>
                `;
                dispatchTable.appendChild(row);
            });
        }
    }

    // Attach event listener for marking an order as delivered
    if (dispatchTable) {
        dispatchTable.addEventListener('click', (event) => {
            if (event.target && event.target.classList.contains('delivered-btn')) {
                const index = event.target.getAttribute('data-index');
                let dispatchOrders = JSON.parse(localStorage.getItem('readyForDelivery')) || [];

                // Remove the order from the readyForDelivery list after marking as delivered
                dispatchOrders.splice(index, 1);
                localStorage.setItem('readyForDelivery', JSON.stringify(dispatchOrders));

                // Reload the table to reflect the changes
                loadDispatchOrders();
            }
        });
    }

    loadDispatchOrders();
});
