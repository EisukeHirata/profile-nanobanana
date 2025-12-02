// Script to check subscription status for a user
// Usage: node check-subscription.js <email>

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const email = process.argv[2];

if (!email) {
  console.error('Usage: node check-subscription.js <email>');
  process.exit(1);
}

async function checkSubscription() {
  console.log(`Checking subscription for: ${email}\n`);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!data) {
    console.log('No profile found for this email');
    return;
  }

  console.log('Profile Data:');
  console.log('─'.repeat(50));
  console.log(`Email:               ${data.email}`);
  console.log(`Credits:             ${data.credits}`);
  console.log(`Subscription Tier:   ${data.subscription_tier || 'null'}`);
  console.log(`Subscription Status: ${data.subscription_status || 'null'}`);
  console.log(`Stripe Customer ID:  ${data.stripe_customer_id || 'null'}`);
  console.log(`Created At:          ${data.created_at}`);
  console.log('─'.repeat(50));

  if (!data.subscription_tier || data.subscription_tier === 'free') {
    console.log('\n⚠️  This user appears to have a FREE subscription');
    console.log('If they should have a paid subscription, check:');
    console.log('1. Stripe webhook events were received');
    console.log('2. Database was updated correctly');
    console.log('3. stripe_customer_id matches Stripe dashboard');
  }
}

checkSubscription();
