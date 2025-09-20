import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "quotes.json");

// Helper functions
const loadQuotes = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveQuotes = (quotes) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(quotes, null, 2));
};

export default function handler(req, res) {
  if (req.method === "GET") {
    // Get all quotes
    const quotes = loadQuotes();
    return res.status(200).json(quotes);
  }

  if (req.method === "POST") {
    // Add new quote
    const { text, author } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Quote text is required" });
    }

    let quotes = loadQuotes();

    if (quotes.some((q) => q.text.toLowerCase() === text.trim().toLowerCase())) {
      return res.status(400).json({ error: "This quote already exists" });
    }

    const newQuote = {
      id: Date.now(),
      text: text.trim(),
      author: author ? author.trim() : "Unknown",
    };

    quotes.push(newQuote);
    saveQuotes(quotes);

    return res.status(201).json(newQuote);
  }

  if (req.method === "DELETE") {
    const id = Number(req.query.id);
    let quotes = loadQuotes();
    const index = quotes.findIndex((q) => q.id === id);

    if (index === -1) return res.status(404).json({ error: "Quote not found" });

    const removed = quotes.splice(index, 1)[0];
    saveQuotes(quotes);
    return res.status(200).json({ removed });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  res.status(405).end(Method ${req.method} Not Allowed);
}