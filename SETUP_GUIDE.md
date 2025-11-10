# Database Setup Guide

## Quick Setup (Automatic)

You can automatically create all database tables by running:

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Set up your .env file
# Copy .env.example to .env and fill in your Supabase credentials
# Make sure to add DATABASE_URL with your database password

# 3. Run the setup script
npm run setup:db
```

The script will automatically:
- Connect to your Supabase database
- Create all required tables (trips, places, diesel_expenses)
- Set up indexes for better performance
- Configure Row Level Security (RLS) policies

### Getting Your Database URL

1. Go to your Supabase Dashboard
2. Navigate to **Settings > Database**
3. Find the **Connection string** section
4. Copy the **URI** format connection string
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Add it to your `.env` file as `DATABASE_URL`

Example:
```
DATABASE_URL=postgresql://postgres:your_password@db.abcdefghijklmnop.supabase.co:5432/postgres
```

⚠️ **Important**: Never commit your `.env` file or database password to version control!

## Manual Setup (Alternative)

## Understanding the 404 Error

If you're seeing errors like:
```
GET https://your-project.supabase.co/rest/v1/trips?select=... 404 (Not Found)
Error: Could not find the table 'public.trips' in the schema cache
```

This means the database tables haven't been created in your Supabase project yet.

## Solution: Create the Tables

### Step 1: Open Supabase Dashboard
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one if you haven't)

### Step 2: Open SQL Editor
1. In the left sidebar, click on **SQL Editor**
2. Click **New Query**

### Step 3: Run the Schema
1. Open the file `supabase-schema.sql` from this project
2. Copy the entire contents of the file
3. Paste it into the SQL Editor in Supabase
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

### Step 4: Verify Tables Were Created
1. In the left sidebar, go to **Table Editor**
2. You should now see three tables:
   - `trips`
   - `places`
   - `diesel_expenses`

### Step 5: Verify RLS Policies
1. In the **Table Editor**, click on the `trips` table
2. Go to the **Policies** tab
3. You should see a policy named "Allow all operations on trips"
4. Repeat for `places` and `diesel_expenses` tables

## Common Issues

### Issue: Tables still not accessible after creating them
**Solution**: 
- Make sure you ran the entire SQL script, including the RLS policies
- Check that the policies were created successfully
- Verify your Supabase URL and API key in `.env` file

### Issue: Environment variables not set
**Solution**:
1. Create a `.env` file in the project root
2. Add:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Get these values from: Supabase Dashboard → Settings → API
4. Restart your development server after adding the `.env` file

### Issue: RLS blocking access
**Solution**: 
- The schema includes permissive policies, but if you're still having issues:
  1. Go to Table Editor → Select table → Policies tab
  2. Ensure the policy "Allow all operations on [table]" exists
  3. If not, create it manually or re-run the schema SQL

## Testing the Setup

After completing the setup:
1. Refresh your application
2. The errors should disappear
3. You should be able to:
   - Add trips
   - Manage places
   - Track diesel expenses
   - View the summary dashboard

## Need Help?

If you continue to experience issues:
1. Check the browser console for specific error messages
2. Verify your Supabase project is active (not paused)
3. Ensure your API keys are correct
4. Check Supabase project logs for any errors

