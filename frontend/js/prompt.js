document.addEventListener('DOMContentLoaded', () => {
    // Get all add-to-cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    // Get the popup
    const popupMessage = document.getElementById('popup-message');
    
    // Add event listener to each add-to-cart button
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Show the popup message
            popupMessage.classList.add('show');
            
            // After 2 seconds (2000 ms), fade out the popup
            setTimeout(() => {
                popupMessage.classList.remove('show');
            }, 1000); // Adjust the time (2000ms = 2 seconds) to how long you want the popup to show
        });
    });
});
