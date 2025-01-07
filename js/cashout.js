document.addEventListener('DOMContentLoaded', () => {
    const orderSummary = document.getElementById('order-summary');
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const totalAmount = parseFloat(localStorage.getItem('totalAmount')) || 0;

    const modal = document.getElementById('popup-modal');
    const closeModalButton = document.querySelector('.close-modal');

    function renderOrderSummary() {
        orderSummary.innerHTML = '';
        let calculatedTotal = 0;

        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            calculatedTotal += itemTotal;
            const itemElement = document.createElement('div');
            itemElement.textContent = `${item.quantity}x ${item.name} - N${itemTotal.toFixed(2)}`;
            orderSummary.appendChild(itemElement);
        });

        const totalElement = document.createElement('div');
        totalElement.style.fontWeight = 'bold';
        totalElement.textContent = `Total Amount: N${calculatedTotal.toFixed(2)}`;
        orderSummary.appendChild(totalElement);
    }

    renderOrderSummary();

    document.getElementById('checkout-form').addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const phoneNumber = document.getElementById('number').value;
        const address = document.getElementById('address').value;
        const paymentMethod = document.querySelector('input[name="delivery"]:checked').value;

        if (!name || !phoneNumber || !address) {
            alert('Please fill in all fields.');
            return;
        }

        if (paymentMethod === 'delivery') {
            // Combine delivery info and cart items into one order
            const newOrder = {
                name,
                phoneNumber,
                address,
                items: cartItems,
                totalAmount
            };

            // Retrieve existing orders and add the new one
            const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
            existingOrders.push(newOrder);
            localStorage.setItem('orders', JSON.stringify(existingOrders));

            // Show the popup notification
            modal.style.display = 'flex';
        } else {
            alert('Proceeding to Card Payment...');
            // Handle card payment logic here
        }
    });

    // Close modal functionality
    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
        // Clear the cart after closing the modal
        localStorage.removeItem('cartItems');
        localStorage.removeItem('totalAmount');
    });
});
