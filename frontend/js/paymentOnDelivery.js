// paymentOnDelivery.js
document.addEventListener('DOMContentLoaded', () => {
    const ordersTable = document.querySelector('#orders-table tbody');
    const emptyMessage = document.getElementById('empty-message');
    const clearOrdersButton = document.getElementById('clear-orders');

    let lastOrderCount = 0;

    function loadOrders() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const deliveryStatus = JSON.parse(localStorage.getItem('deliveryStatus')) || {};

        ordersTable.innerHTML = '';

        if (orders.length === 0) {
            emptyMessage.style.display = 'block';
            ordersTable.parentElement.style.display = 'none';
        } else {
            emptyMessage.style.display = 'none';
            ordersTable.parentElement.style.display = 'table';

            let newOrderAdded = false;

            orders.forEach((order, index) => {
                const orderDate = order.date ? order.date : `order-${index}`;

                // Set default delivery status for new entries
                if (!(orderDate in deliveryStatus)) {
                    deliveryStatus[orderDate] = false; // Default to "Not Ready"
                    localStorage.setItem('deliveryStatus', JSON.stringify(deliveryStatus));
                }

                const isReady = deliveryStatus[orderDate];

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
                    <td>
                        <button class="print-btn" data-order='${JSON.stringify(order)}'>Print</button>
                        <button class="delivery-btn" data-order-date="${orderDate}">
                            ${isReady ? '✔️ Ready' : 'Ready for Delivery'}
                        </button>
                    </td>
                `;

                if (index >= lastOrderCount) {
                    row.classList.add('new-order');
                    newOrderAdded = true;
                }

                ordersTable.appendChild(row);
            });

            document.querySelectorAll('.print-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const order = JSON.parse(button.dataset.order);
                    printOrder(order);
                });
            });

            document.querySelectorAll('.delivery-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const orderDate = button.dataset.orderDate;
                    toggleDeliveryStatus(orderDate, orders);
                });
            });

            if (newOrderAdded) {
                const newOrders = orders.length - lastOrderCount;
                displayNotification(`${newOrders} new order(s) received!`);
            }

            lastOrderCount = orders.length;
        }
    }

    function toggleDeliveryStatus(orderDate, orders) {
        const deliveryStatus = JSON.parse(localStorage.getItem('deliveryStatus')) || {};
        let readyForDelivery = JSON.parse(localStorage.getItem('readyForDelivery')) || [];
    
        deliveryStatus[orderDate] = !deliveryStatus[orderDate];
        localStorage.setItem('deliveryStatus', JSON.stringify(deliveryStatus));
    
        const order = orders.find(order => order.date === orderDate);
        if (order && deliveryStatus[orderDate]) {
            // Add to readyForDelivery array
            if (!readyForDelivery.some(o => o.date === order.date)) {
                readyForDelivery.push(order);
                localStorage.setItem('readyForDelivery', JSON.stringify(readyForDelivery));
            }
        } else if (order && !deliveryStatus[orderDate]) {
            // Remove from readyForDelivery array
            readyForDelivery = readyForDelivery.filter(o => o.date !== order.date);
            localStorage.setItem('readyForDelivery', JSON.stringify(readyForDelivery));
        }
    
        const button = document.querySelector(`.delivery-btn[data-order-date="${orderDate}"]`);
        if (button) {
            button.textContent = deliveryStatus[orderDate] ? '✔️ Ready' : 'Ready for Delivery';
        }
    }
    

    function printOrder(order) {
        const printContent = `
            <div class="receipt">
                <h2 style="text-align: center;">Order Receipt</h2>
                <hr>
                <p><strong>Items:</strong></p>
                <p>
                    ${order.items.map(item => `${item.quantity}x ${item.name} - ₦${item.price.toFixed(2)}`).join('<br>')}
                </p>
                <p><strong>Total Amount:</strong> ₦${order.totalAmount.toFixed(2)}</p>
                <hr>
                <p><small>Date: ${order.date || 'N/A'}</small></p>
            </div>
        `;

        const printWindow = window.open('', '_blank', 'width=300,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>Print Receipt</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        width: 80mm;
                        margin: 0;
                        padding: 0;
                    }
                    .receipt {
                        padding: 10px;
                        font-size: 12px;
                    }
                    h2 {
                        font-size: 16px;
                        margin-bottom: 10px;
                    }
                    p {
                        margin: 5px 0;
                        line-height: 1.4;
                    }
                    hr {
                        border: 0;
                        border-top: 1px dashed #000;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    function displayNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerText = message;
        document.body.appendChild(notification);

        notification.style.position = 'fixed';
        notification.style.top = '150px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = '#4caf50';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
        notification.style.zIndex = '1000';

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    clearOrdersButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all orders?')) {
            localStorage.removeItem('orders');
            localStorage.removeItem('deliveryStatus');
            localStorage.removeItem('readyForDelivery');
            loadOrders();
        }
    });

    console.log('Updated readyForDelivery:', JSON.parse(localStorage.getItem('readyForDelivery')));

    loadOrders();

    setInterval(() => {
        document.querySelectorAll('.new-order').forEach(row => row.classList.remove('new-order'));
        loadOrders();
    }, 30000);
});
