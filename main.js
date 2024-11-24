// main.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create an Express application
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the public directory

// MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: 'recipes_page',
});
pool.getConnection((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to the MySQL database.');
  }
});


// User registration endpoint
app.post('/users/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Insert user into the database
        await pool.promise().query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ message: 'Database error. Please try again.' });
    }
});

// User login endpoint
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.promise().query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            res.json({ userId: rows[0].id, message: 'Login successful!' });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Database error. Please try again.' });
    }
});

// Add recipe endpoint
app.post('/recipes/add', async (req, res) => {
    const { title, description, ingredients, steps, category, author_id } = req.body;

    try {
        await pool.promise().query('INSERT INTO recipes (title, description, ingredients, steps, category, author_id) VALUES (?, ?, ?, ?, ?, ?)', [title, description, ingredients, steps, category, author_id]);
        res.status(201).json({ message: 'Recipe added successfully!' });
    } catch (error) {
        console.error('Error adding recipe:', error);
        res.status(500).json({ message: 'Database error. Please try again.' });
    }
});

// Fetch all recipes with author username
app.get('/recipes', async (req, res) => {
    try {
        const [recipes] = await pool.promise().query(`
            SELECT recipes.id AS ownerName
            FROM recipes
            JOIN users ON recipes.author_id = users.id
        `);
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes with username:', error);
        res.status(500).json({ message: 'Database error. Please try again.' });
    }
});


// Fetch recipe by ID with owner name
app.get('/recipes/:id', async (req, res) => {
    try {
        const recipeId = req.params.id;
        const query = `
            SELECT recipes.*, users.username AS ownerName 
            FROM recipes 
            LEFT JOIN users ON recipes.author_id = users.id 
            WHERE recipes.id = ?`;
        const [rows] = await pool.promise().query(query, [recipeId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        res.json(rows[0]); // Return the recipe with owner's username
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Search recipes by ingredient
app.get('/recipes/search/ingredient', async (req, res) => {
    const ingredient = req.query.ingredient;

    try {
        const [recipes] = await pool.promise().query(
            `SELECT * FROM recipes WHERE ingredients LIKE ?`,
            [`%${ingredient}%`]
        );
        res.json(recipes);
    } catch (error) {
        console.error('Error searching recipes by ingredient:', error);
        res.status(500).json({ message: 'Database error. Please try again.' });
    }
});

// Search recipes by category
app.get('/recipes/search/category', async (req, res) => {
    const category = req.query.category;

    try {
        const [recipes] = await pool.promise().query(
            `SELECT * FROM recipes WHERE category = ?`,
            [category]
        );
        res.json(recipes);
    } catch (error) {
        console.error('Error searching recipes by category:', error);
        res.status(500).json({ message: 'Database error. Please try again.' });
    }
});



// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
