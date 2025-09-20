import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Add validation for environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      // Check if it's a request for random quote
      if (req.url?.includes('/random')) {
        const { data, error } = await supabase.from("quotes").select("*");
        if (error) {
          console.error('Random quote error:', error);
          return res.status(500).json({ error: error.message });
        }
        if (data.length === 0) {
          return res.status(404).json({ error: "No quotes found" });
        }
        // Return random quote
        const randomQuote = data[Math.floor(Math.random() * data.length)];
        return res.status(200).json(randomQuote);
      }

      // Regular GET all quotes
      const { data, error } = await supabase.from("quotes").select("*");
      if (error) {
        console.error('GET all quotes error:', error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      if (!req.body) {
        return res.status(400).json({ error: "Request body is required" });
      }

      const { text, author } = req.body;
      console.log('POST request body:', { text, author });

      if (!text || typeof text !== 'string' || text.trim() === "") {
        return res.status(400).json({ error: "Valid quote text is required" });
      }

      if (author && typeof author !== 'string') {
        return res.status(400).json({ error: "Author must be a string" });
      }

      const insertData = {
        text: text.trim(),
        author: (author && author.trim()) || "Unknown"
      };

      console.log('Inserting quote:', insertData);

      const { data, error } = await supabase
        .from("quotes")
        .insert([insertData])
        .select();
      
      if (error) {
        console.error('POST Error:', error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        console.error('No data returned from insert');
        return res.status(500).json({ error: "Failed to create quote" });
      }

      return res.status(201).json(data[0]);
    }

    if (req.method === "DELETE") {
      // Handle both query parameter and URL path styles
      let id;
      
      // Check for query parameter first: ?id=123
      if (req.query.id) {
        id = Number(req.query.id);
      } 
      // Check for URL path style: /api/quotes/123
      else if (req.url) {
        const urlParts = req.url.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart && !isNaN(Number(lastPart))) {
          id = Number(lastPart);
        }
      }

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Valid ID is required" });
      }

      console.log('Deleting quote with ID:', id);

      const { data, error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", id)
        .select();

      if (error) {
        console.error('DELETE Error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: "Quote deleted successfully", 
        deleted: data[0] || null 
      });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : 'Check server logs'
    });
  }
}