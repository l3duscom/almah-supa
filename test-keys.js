const { createClient } = require('@supabase/supabase-js');

const url = 'https://qsrlcvzxbkyvgafzkjnu.supabase.co';
const publishableKey = 'sb_publishable_Z492fQ-qsIYdaiCc0QzOrw_sPrN_RyQ';
const secretKey = 'sb_secret_WADaQuil_HN_55EWVXd4DA_TvI8z2tv';

console.log('Testing Supabase keys...');

// Test with publishable key (should be anon key equivalent)
try {
  const supabasePublic = createClient(url, publishableKey);
  console.log('✅ Publishable key client created successfully');
} catch (err) {
  console.log('❌ Publishable key failed:', err.message);
}

// Test with secret key (should be service role equivalent) 
try {
  const supabaseSecret = createClient(url, secretKey);
  console.log('✅ Secret key client created successfully');
} catch (err) {
  console.log('❌ Secret key failed:', err.message);
}