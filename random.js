import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "quotes.json");

const loadQuotes = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export default function handler(req, res) {
  const quotes = loadQuotes();
  if (quotes.length === 0) return res.status(204).end();

  const rand = quotes[Math.floor(Math.random() * quotes.length)];
  res.status(200).json(rand);
}