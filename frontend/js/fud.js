/*....menu toggle...*/

$('#menu-icon').click(function(){
    $('#menu').toggleClass("active");
})




/*...cart listings section...*/
document.addEventListener('DOMContentLoaded', () => {
    const cartItemCount = document.querySelector('.cart-icon span');
    const cartItemList = document.querySelector('.cart_item');
    const cartTotal = document.querySelector('.cart_total');
    const cartIcon = document.querySelector('.cart-icon');
    const sidewy = document.getElementById('sidewy');
    const checkoutButton = document.querySelector('.checkout_btn');

    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    let totalAmount = parseFloat(localStorage.getItem('totalAmount')) || 0;

    updateCartUI();

    function addToCart(name, price) {
        const existingItem = cartItems.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cartItems.push({ name, price, quantity: 1 });
        }

        totalAmount += price;
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        localStorage.setItem('totalAmount', totalAmount.toFixed(2));
        updateCartUI();
    }

    function updateCartUI() {
        updateCartItemCount(cartItems.length);
        updateCartItemList();
        updateCartTotal();
    }

    function updateCartItemCount(count) {
        cartItemCount.textContent = count;
    }

    function updateCartItemList() {
        cartItemList.innerHTML = '';
        cartItems.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('individual-cart-item');
            cartItem.innerHTML = `
                <span>(${item.quantity}x) ${item.name}</span>
                <span class="cart-item-price">N${(item.price * item.quantity).toFixed(2)}</span>
                <button class="remove-btn" data-index="${index}"><i class='bx bx-x'></i></button>
            `;
            cartItemList.appendChild(cartItem);
        });

        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.target.closest('button').dataset.index, 10);
                removeItemFromCart(index);
            });
        });
    }

    function removeItemFromCart(index) {
        if (index >= 0 && index < cartItems.length) {
            const removedItem = cartItems.splice(index, 1)[0];
            totalAmount -= removedItem.price * removedItem.quantity;
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            localStorage.setItem('totalAmount', totalAmount.toFixed(2));
            updateCartUI();
        }
    }

    function updateCartTotal() {
        cartTotal.textContent = `N${totalAmount.toFixed(2)}`;
    }

    cartIcon.addEventListener('click', () => {
        sidewy.classList.toggle('open');
    });

    const closeButton = document.querySelector('.sidebar_clp');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            sidewy.classList.remove('open');
        });
    }

    checkoutButton.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });

    // Handle add-to-cart from the main section
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart')) {
            const button = event.target;
            const card = button.closest('.card');
            const name = card.getAttribute('data-name');
            const priceStr = card.getAttribute('data-price');
            const price = parseFloat(priceStr);

            if (isNaN(price)) {
                console.error('Invalid price:', priceStr);
            } else {
                addToCart(name, price);
            }
        }
    });

    // Handle add-to-cart from search results
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart')) {
            const button = event.target;
            const name = button.getAttribute('data-name');
            const priceStr = button.getAttribute('data-price');
            const price = parseFloat(priceStr);

            if (isNaN(price)) {
                console.error('Invalid price:', priceStr);
            } else {
                addToCart(name, price);
            }
        }
    });

    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    async function fetchItems() {
        try {
            const response = await fetch('JSON/items.json'); // Correct path to items.json
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching items:', error);
            return [];
        }
    }

    async function filterItems(query) {
        const items = await fetchItems();
        searchResults.innerHTML = '';

        if (query.length < 3) {
            searchResults.style.display = 'none';
            return;
        }

        items.forEach(item => {
            const name = item.name.toLowerCase();
            if (name.includes(query.toLowerCase())) {
                const searchItem = document.createElement('div');
                searchItem.classList.add('search-item');
                searchItem.innerHTML = `
                    <div class="search-item-image">
                        <img src="${item.image}" alt="${name}">
                    </div>
                    <div class="search-item-details">
                        <h4>${name}</h4>
                        <p>N${item.price}</p>
                        <button class="add-to-cart" data-name="${name}" data-price="${item.price}">
                            Add to Cart
                        </button>
                    </div>
                `;
                searchResults.appendChild(searchItem);
            }
        });

        searchResults.style.display = searchResults.innerHTML ? 'block' : 'none';
    }

    searchInput.addEventListener('input', () => {
        filterItems(searchInput.value);
    });
});





