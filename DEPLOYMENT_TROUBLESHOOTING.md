# Deployment Troubleshooting

## Supabase Client Null Error

If you're seeing this error in production:
```
TypeError: Cannot destructure property 'auth' of 'e' as it is null
```

This indicates missing or invalid Supabase environment variables.

### Solution

1. **Verify Environment Variables in Vercel Dashboard:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Ensure these variables are set:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Check Console Logs:**
   - Look for error messages like "Missing Supabase environment variables"
   - The logs will show which variables are missing

3. **Redeploy After Setting Variables:**
   - After adding/updating environment variables, trigger a new deployment

### Environment Variables Needed

```env
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://fnemwtlabryefecprety.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required - Application
NEXT_PUBLIC_URL=https://your-domain.vercel.app

# Required - Email
RESEND_API_KEY=your-resend-key
FROM_EMAIL=your-from-email

# Optional - Stripe (if using subscriptions)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Fallback Behavior

If Supabase is unavailable, the app will:
- Show fallback audio playlist
- Continue working without user-specific features
- Log errors to console for debugging

### Quick Fix Commands

To test locally with missing env vars:
```bash
# This should show the error clearly
npm run build
npm start
```

To verify env vars are loaded:
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```