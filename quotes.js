import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { quote } = req.body;

      if (!quote) {
        return res.status(400).json({ message: "Quote is required" });
      }

      // Generate an ID for the quote
      const id = Date.now().toString();

      // Store in KV
      await kv.set(`quote:${id}`, quote);

      return res.status(200).json({ message: "Quote saved", id });
    } catch (error) {
      console.error("KV error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  if (req.method === "GET") {
    try {
      // Get all keys matching "quote:*"
      const keys = await kv.keys("quote:*");

      const quotes = [];
      for (const key of keys) {
        const value = await kv.get(key);
        quotes.push({ id: key, text: value });
      }

      return res.status(200).json(quotes);
    } catch (error) {
      console.error("KV error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
