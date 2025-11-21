import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables!");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl);
  console.error("SUPABASE_SERVICE_ROLE_KEY:", !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyConnection() {
  console.log("Testing Supabase connection...");
  
  try {
    // Try to select from the generations table (limit 1)
    // We expect this to succeed (returning 0 or 1 row) if the table exists
    const { data, error } = await supabase
      .from("generations")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("❌ Connection failed or table 'generations' not found.");
      console.error("Error:", error.message);
      process.exit(1);
    }

    console.log("✅ Successfully connected to Supabase!");
    console.log("✅ Table 'generations' exists.");
    
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

verifyConnection();
