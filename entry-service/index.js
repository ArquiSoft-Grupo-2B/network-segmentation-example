const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuración de PostgreSQL
const pool = new Pool({
  host: "postgresdb",
  port: 5432,
  user: "user",
  password: "password",
  database: "mydatabase",
});

// Función para inicializar la base de datos
async function initializeDatabase() {
  const maxRetries = 5;
  const retryDelay = 3000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS entries (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Database table initialized successfully");
      return true;
    } catch (err) {
      console.error(`Error initializing database (attempt ${i + 1}/${maxRetries}):`, err.message);
      if (i < maxRetries - 1) {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  throw new Error("Failed to initialize database after multiple attempts");
}

app.get("/", (req, res) => {
  res.send("Backend 2 - Entries API");
});

// Crear una nueva entrada
app.post("/api/entries", async (req, res) => {
  try {
    const { username, content } = req.body;

    if (!username || !content) {
      return res
        .status(400)
        .json({ error: "Username and content are required" });
    }

    const result = await pool.query(
      "INSERT INTO entries (username, content) VALUES ($1, $2) RETURNING *",
      [username, content]
    );

    res.status(201).json({
      message: "Entry created successfully",
      entry: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating entry:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las entradas de un usuario
app.get("/api/entries/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const result = await pool.query(
      "SELECT * FROM entries WHERE username = $1 ORDER BY created_at DESC",
      [username]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las entradas
app.get("/api/entries", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM entries ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ error: error.message });
  }
});

// Inicializar la base de datos antes de iniciar el servidor
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend 2 is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
