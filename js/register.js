// Select necessary DOM elements
const registrationForm = document.getElementById("registrationForm");
const successMessage = document.getElementById("successMessage");
const loginLink = document.getElementById("loginLink");
const roomSelector = document.getElementById("roomSelector");

// User registration
registrationForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const user = { name, username, password };

  // I added this
  async function registerUser() {
    try {
      const response = await fetch(
        "/api/v1/users/register",
        {
          method: "POST",
          body: JSON.stringify({ name, username, password }),
          credentials:"include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // const data = await response.json();
      // console.log(data);
      // // Because of the structure of the website storing this might be a bit complicated for me so I'll leave the frontend authentication in your hands...If you need assistance you can contact me
      // if (!data.token) {
      //   throw new Error("Please register");
      // }

      localStorage.setItem("token", document.cookie.split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]);
    } catch (err) {
      console.log(err);
    }
  }

  registerUser();

  localStorage.setItem("user", JSON.stringify(user));

  successMessage.textContent = `${name} was successfully registered!`;
  successMessage.style.display = "block";
  loginLink.style.display = "block";

  registrationForm.reset();
});

// Reset all users
function resetAllUsers() {
  fetch("/api/v1/users/deleteAll", {
    method:"DELETE"
  })
  alert("All users have been reset!");
}

// Load all foods and populate the dropdown
async function loadFood() {
  try {
    const response = await fetch("/api/Food");
    if (!response.ok) throw new Error("Network response was not ok");

    const foods = await response.json();
    localStorage.setItem("roomData", JSON.stringify(foods)); // Cache in localStorage
    populateFoodSelector(foods);
  } catch (error) {
    console.error("Error fetching food data from server:", error);
  }
}

// Populate food selector dropdown
function populateFoodSelector(food) {
  if (!foodSelector) return; 
  foodSelector.innerHTML = ""; 
  foods.forEach((food) => {
    const option = document.createElement("option");
    option.value = food._id; 
    option.textContent = `${food.type} - Food Name: ${food.name}`;
    foodSelector.appendChild(option);
  });
}

// Load selected food details for editing
async function loadSelectedFood(foodId) {
  if (!foodId) return; 
  try {
    const response = await fetch(`/api/rooms/${foodId}`);
    console.log(foodId);
    if (!response.ok) throw new Error("Network response was not ok");

    const foodData = await response.json();
    document.getElementById("foodType").value = foodData.type;
    document.getElementById("foodPrice").value = foodData.price;
    document.getElementById("foodId").value = foodData._id; 
    document.getElementById("mainPhotoUpload").value = ""; 
  } catch (error) {
    console.error("Error fetching selected room:", error);
  }
}

// Save or update food details
async function saveFoodDetails() {
  console.log("Saving food details...");

  const foodId = document.getElementById("foodId").value; // Get food ID
  const foodType = document.getElementById("foodType").value;
  const foodPrice = document.getElementById("foodPrice").value;

  const mainPhotoUpload = document.getElementById("mainPhotoUpload").files[0];


  const formData = new FormData();
  formData.append("type", foodType);
  formData.append("name", foodName);
  formData.append("price", foodPrice);

  if (mainPhotoUpload) {
    formData.append("mainPhoto", mainPhotoUpload);
  }
 
  try {
    const url = foodId
      ? `/api/foods/${foodId}`
      : "/api/foods";

    const response = await fetch(url, {
      method: roomId ? "PUT" : "POST",
      body: formData,
    });

    console.log("Response status:", response.status); // Log response status

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fetch error response:", errorText);
      throw new Error("Failed to save Food details");
    }
  }


// Call loadFoods on page load
window.onload = loadFoods;

// Event listener for food selector change
if (foodSelector) {
  foodSelector.addEventListener("change", function () {
    const selectedFoodId = this.value;
    loadSelectedFood(selectedFoodId);
  });
}

// Add event listener to save button
const saveButton = document.getElementById("saveButton");
if (saveButton) {
  saveButton.addEventListener("click", saveFoodDetails);
}
