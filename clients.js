// Helper function to get a cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Helper function to set a cookie
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

    // Handle Registration
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            username: e.target.username.value,
            email: e.target.email.value,
            password: e.target.password.value,
        };

        try {
            const response = await fetch('http://localhost:3000/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            const messageContainer = document.getElementById('registerMessage');

            if (response.ok) {
                messageContainer.textContent = 'Registration successful!';
                messageContainer.style.color = 'green';
                window.location.href = 'login.html'; // Redirect after registration
            } else {
                messageContainer.textContent = `Registration failed: ${result.message}`;
                messageContainer.style.color = 'red';
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    });

// Handle Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        email: e.target.email.value,
        password: e.target.password.value,
    };

    try {
        const response = await fetch('http://localhost:3000/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        alert(result.message);
        if (response.ok) {
            setCookie('userId', result.userId, 7); // Store userId in cookies for 7 days
            window.location.href = 'recipes.html';
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});

// Fetch and display recipes
const recipesList = document.getElementById('recipesList');
if (recipesList) {
    const fetchRecipes = async () => {
        try {
            const response = await fetch('http://localhost:3000/recipes');
            const recipes = await response.json();
            recipesList.innerHTML = recipes.map(recipe => `

                <div class="recipe-form">
                    <h3>${recipe.title}</h3>
                    <p><strong>Description:</strong> ${recipe.description}</p>
                    <p><strong>Category:</strong> ${recipe.category}</p>
                    <p><strong>Owner:</strong> ${recipe.ownerName || 'Unknown'}</p>
                    <button type="button" onclick="openRecipeInNewTab(${recipe.id})">View Full Recipe</button>
                </div>

            `).join('');
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    };
    fetchRecipes();
}

// Handle Add Recipe
document.getElementById('addRecipeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = getCookie('userId');
    if (!userId) {
        alert('You must be logged in to add a recipe.');
        return;
    }

    const data = {
        title: e.target.title.value,
        description: e.target.description.value,
        ingredients: e.target.ingredients.value,
        steps: e.target.steps.value,
        category: e.target.category.value,
        author_id: userId,
    };

    try {
        const response = await fetch('http://localhost:3000/recipes/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        alert(result.message);
        if (response.ok) {
            window.location.href = 'recipes.html';
        }
    } catch (error) {
        console.error('Error adding recipe:', error);
    }
});


// Open the full recipe details in a new tab
const openRecipeInNewTab = (recipeId) => {
    // Open new tab for recipe details
    window.open(`recipesdetails.html?recipeId=${recipeId}`, '_blank');
};



// Handle Add Recipe functionality
document.getElementById('addRecipeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = getCookie('userId');
    if (!userId) {
        alert('You must be logged in to add a recipe.');
        return;
    }

    const data = {
        title: e.target.title.value,
        description: e.target.description.value,
        ingredients: e.target.ingredients.value,
        steps: e.target.steps.value,
        category: e.target.category.value,
        author_id: userId,
    };

    try {
        const response = await fetch('http://localhost:3000/recipes/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        alert(result.message);
        if (response.ok) {
            window.location.href = 'recipes.html';
        }
    } catch (error) {
        console.error('Error adding recipe:', error);
    }
});

// Helper function to get a cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('recipeId');

const fetchRecipeDetails = async () => {
    try {
        const response = await fetch(`http://localhost:3000/recipes/${recipeId}`);
        const recipe = await response.json();

        // Populate the details on the page
        document.getElementById('recipeTitle').textContent = recipe.title;
        document.getElementById('recipeOwner').textContent = recipe.ownerName  || 'Unknown';
        document.getElementById('recipeDescription').textContent = recipe.description;
        document.getElementById('recipeIngredients').textContent = recipe.ingredients;
        document.getElementById('recipeSteps').textContent = recipe.steps;
        document.getElementById('recipeCategory').textContent = recipe.category;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
};

fetchRecipeDetails();

// Search by Ingredient
const searchByIngredient = async () => {
    const ingredient = document.getElementById('ingredientInput').value;

    if (ingredient === '') {
        alert('Please enter an ingredient.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/recipes/search/ingredient?ingredient=${ingredient}`);
        const recipes = await response.json();
        toggleDisplayResults(true); // Show search results, hide all recipes
        displaySearchResults(recipes);
    } catch (error) {
        console.error('Error searching recipes by ingredient:', error);
    }
};

// Search by Category
const searchByCategory = async () => {
    const category = document.getElementById('categorySelect').value;

    if (category === '') {
        alert('Please select a category.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/recipes/search/category?category=${category}`);
        const recipes = await response.json();
        toggleDisplayResults(true); // Show search results, hide all recipes
        displaySearchResults(recipes);
    } catch (error) {
        console.error('Error searching recipes by category:', error);
    }
};

// Function to display search results
const displaySearchResults = (recipes) => {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = ''; // Clear previous results

    if (recipes.length === 0) {
        searchResults.innerHTML = '<p>No recipes found.</p>';
    } else {
        recipes.forEach(recipe => {
            const recipeBox = document.createElement('div');
            recipeBox.classList.add('recipe-box'); // Add class for custom styling

            recipeBox.innerHTML = `
                <h3>${recipe.title}</h3>
                <p><strong>Description:</strong> ${recipe.description}</p>
                <p><strong>Category:</strong> ${recipe.category}</p>
                <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                <p><strong>Steps:</strong> ${recipe.steps}</p>
                <button type="button" onclick="openRecipeInNewTab(${recipe.id})">View Full Recipe</button>
            `;

            searchResults.appendChild(recipeBox); // Add each result to the searchResults container
        });
    }
};


// Function to toggle between showing search results and recipes list
const toggleDisplayResults = (showResults) => {
    const searchResults = document.getElementById('searchResults');
    const recipesList = document.getElementById('recipesList');

    if (showResults) {
        searchResults.style.display = 'block';  // Show search results
        recipesList.style.display = 'none';    // Hide the full recipes list
    } else {
        searchResults.style.display = 'none';  // Hide search results
        recipesList.style.display = 'block';   // Show the full recipes list
    }
};

// Call this function initially to show the full recipe list and hide search results
toggleDisplayResults(false);
