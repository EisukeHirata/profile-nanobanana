
require('dotenv').config({ path: '.env.local' });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateCredits() {
  const email = "hirata.busirug@gmail.com";
  const credits = 50; // Giving 50 credits as a fix

  console.log(`Updating credits for ${email} to ${credits}...`);
  
  const { data, error } = await supabase
    .from("profiles")
    .update({ credits: credits })
    .eq("email", email)
    .select();

  if (error) {
    console.error("Error updating credits:", error);
  } else {
    console.log("Credits updated:", data);
  }
}

updateCredits();
