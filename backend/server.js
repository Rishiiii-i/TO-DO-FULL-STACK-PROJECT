const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('MySQL Connection Error:', err);
  } else {
    console.log('Connected to MySQL Database');
  }
});

// Default Route
app.get('/', (req, res) => {
  res.send('Todo API Running...');
});

// Get All Todos
app.get('/todos', (req, res) => {
  db.query(
    'SELECT id, ItemDescription AS text FROM todoItems',
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: 'Failed to fetch todos'
        });
      }

      res.json(results);
    }
  );
});

// Add Todo
app.post('/add-todo', (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({
      error: 'Text is required'
    });
  }

  db.query(
    'INSERT INTO todoItems (ItemDescription) VALUES (?)',
    [text],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: 'Failed to add todo'
        });
      }

      res.status(201).json({
        id: result.insertId,
        text
      });
    }
  );
});

// Update Todo
app.put('/update-todo/:id', (req, res) => {
  const id = req.params.id;
  const { itemDescription } = req.body;

  if (!itemDescription) {
    return res.status(400).json({
      error: 'Text is required'
    });
  }

  db.query(
    'UPDATE todoItems SET ItemDescription = ? WHERE id = ?',
    [itemDescription, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: 'Failed to update todo'
        });
      }

      res.json({
        success: true,
        message: 'Todo updated successfully'
      });
    }
  );
});

// Delete Todo
app.delete('/delete-todo/:id', (req, res) => {
  const id = req.params.id;

  db.query(
    'DELETE FROM todoItems WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: 'Failed to delete todo'
        });
      }

      res.json({
        success: true,
        message: 'Todo deleted successfully'
      });
    }
  );
});

// Start Server
app.listen(5000, () => {
  console.log('Server Running on Port 5000');
});