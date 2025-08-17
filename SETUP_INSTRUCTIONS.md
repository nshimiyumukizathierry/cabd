# CarBD Setup Instructions

## Database Configuration

Your Supabase project details:
- **Project URL**: https://mjnfcixxdofwtshzrpon.supabase.co
- **Database URL**: postgresql://postgres:Thierry054848#@db.mjnfcixxdofwtshzrpon.supabase.co:5432/postgres

## Step-by-Step Setup

### 1. Get Your Supabase Anon Key

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (mjnfcixxdofwtshzrpon)
3. Go to **Settings** → **API**
4. Copy the **anon/public** key
5. Update the `.env.local` file with this key

### 2. Set Up Environment Variables

Create a `.env.local` file in your project root:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://mjnfcixxdofwtshzrpon.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
\`\`\`

### 3. Run Database Setup Scripts

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the content from `scripts/database-setup.sql`
5. Click **Run** to execute the script

### 4. Add Sample Data (Optional)

1. In the SQL Editor, create another new query
2. Copy and paste the content from `scripts/sample-data.sql`
3. Click **Run** to add sample cars

### 5. Create Admin User

1. Run the development server: `npm run dev`
2. Go to http://localhost:3000
3. Register a new account with your email
4. Go back to Supabase dashboard
5. Navigate to **Table Editor** → **profiles**
6. Find your user record and change `role` from `'user'` to `'admin'`

### 6. Verify Setup

1. Log in to your application
2. You should see "Admin Dashboard" in the user menu
3. Navigate to the admin dashboard to manage cars
4. Test adding, editing, and deleting cars

## Troubleshooting

### Common Issues:

1. **Authentication not working**
   - Verify your anon key is correct
   - Check that RLS policies are enabled

2. **Admin features not showing**
   - Ensure your user role is set to 'admin' in the profiles table
   - Log out and log back in after changing the role

3. **Database connection issues**
   - Verify your Supabase project is active
   - Check that the URL matches your project

### Database Schema Verification

After running the setup script, verify these tables exist:
- `profiles` (user accounts)
- `cars` (vehicle inventory)
- `cart_items` (shopping cart)
- `favorites` (user favorites)

## Next Steps

1. Customize the car fields as needed
2. Add more sample data
3. Configure deployment settings
4. Set up custom domain (optional)

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure database scripts ran successfully
4. Check Supabase logs in the dashboard
\`\`\`
