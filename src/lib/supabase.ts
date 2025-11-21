import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a single supabase client for interacting with your database
// We use the service role key to bypass RLS for server-side operations
// Be careful not to expose this client to the browser
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
