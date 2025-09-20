import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase.from("quotes").select("*");
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { text, author } = req.body;
    if (!text || text.trim() === "")
      return res.status(400).json({ error: "Quote text is required" });

    const { data, error } = await supabase
      .from("quotes")
      .insert([{ text: text.trim(), author: author?.trim() || "Unknown" }])
      .select();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (req.method === "DELETE") {
    const id = Number(req.query.id);
    const { data, error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ removed: data[0] });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
