import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    const keys = await kv.keys("quote:*");
    if (keys.length === 0) {
      return res.status(200).json({ text: "No quotes yet", author: "System" });
    }

    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const quote = await kv.get(randomKey);

    return res.status(200).json(quote);
  } catch (e) {
    console.error("Error fetching random quote:", e);
    return res.status(500).json({ message: "Error fetching random quote" });
  }
}
