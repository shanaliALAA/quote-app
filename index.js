const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "quotes.json");

// Middleware
app.use(cors());
app.use(express.json());

// --- Helper functions ---
const loadQuotes = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveQuotes = (quotes) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(quotes, null, 2));
};

// --- API routes ---

// Get all quotes
app.get("/api/quotes", (req, res) => {
  const quotes = loadQuotes();
  res.json(quotes);
});

// Get random quote
app.get("/api/quotes/random", (req, res) => {
  const quotes = loadQuotes();
  if (quotes.length === 0) return res.status(204).send();

  const rand = quotes[Math.floor(Math.random() * quotes.length)];
  res.json(rand);
});

// Add new quote
app.post("/api/quotes", (req, res) => {
  const { text, author } = req.body;
  if (!text || text.trim() === "")
    return res.status(400).json({ error: "Quote text is required" });

  let quotes = loadQuotes();

  // Prevent duplicate quotes
  if (quotes.some((q) => q.text.toLowerCase() === text.trim().toLowerCase())) {
    return res.status(400).json({ error: "This quote already exists" });
  }

  const newQuote = {
    id: Date.now(), // unique ID
    text: text.trim(),
    author: author ? author.trim() : "Unknown",
  };

  quotes.push(newQuote);
  saveQuotes(quotes);
  res.status(201).json(newQuote);
});

// Delete a quote
app.delete("/api/quotes/:id", (req, res) => {
  let quotes = loadQuotes();
  const id = Number(req.params.id);
  const index = quotes.findIndex((q) => q.id === id);

  if (index === -1) return res.status(404).json({ error: "Quote not found" });

  const removed = quotes.splice(index, 1)[0];
  saveQuotes(quotes);
  res.json({ removed });
});

// --- Serve frontend HTML ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
