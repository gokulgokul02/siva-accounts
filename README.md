# Siva Cabs Accounts Management System

A comprehensive React-based cab accounts management system with trip tracking, place management, diesel expense tracking, and downloadable reports.

## Features

- **Trip Management**: Add, edit, and delete trips with customer details, places, amounts, and payment status
- **Place Management**: Manage frequently traveled places with default amounts
- **Diesel Expense Tracking**: Track diesel expenses separately
- **Summary Dashboard**: Real-time view of total paid and pending amounts
- **Report Generation**: Generate daily, monthly, and yearly reports with diesel deduction
- **Mobile Responsive**: Fully responsive design for mobile and desktop devices
- **Auto-fill Amounts**: When selecting a place, the amount field auto-fills with the default amount

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to Settings > Database to get your database connection string

#### Option A: Automatic Setup (Recommended)

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `DATABASE_URL` - Your database connection string (replace `[YOUR-PASSWORD]` with your actual password)
3. Run the setup script:
   ```bash
   npm run setup:db
   ```

This will automatically create all required tables, indexes, and RLS policies.

#### Option B: Manual Setup

1. Go to SQL Editor in your Supabase dashboard
2. Run the SQL script from `supabase-schema.sql` to create the required tables
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Database Schema

### Tables

1. **trips**: Stores trip information
   - id (UUID)
   - date (DATE)
   - customer_name (TEXT)
   - place (TEXT)
   - amount (NUMERIC)
   - status (TEXT: 'paid' or 'unpaid')
   - created_at, updated_at (TIMESTAMP)

2. **places**: Stores frequently traveled places
   - id (UUID)
   - place_name (TEXT, UNIQUE)
   - default_amount (NUMERIC)
   - created_at, updated_at (TIMESTAMP)

3. **diesel_expenses**: Stores diesel expenses
   - id (UUID)
   - date (DATE)
   - amount (NUMERIC)
   - created_at, updated_at (TIMESTAMP)

## Usage

1. **Add Trips**: Use the form on the home page to add new trips. The date field is pre-filled with today's date but can be edited.
2. **Manage Places**: Go to the Places page to add frequently traveled places with default amounts.
3. **Track Diesel**: Use the Diesel page to record diesel expenses.
4. **View Reports**: Generate and download reports (daily/monthly/yearly) from the Reports page. Diesel expenses are automatically deducted from the net amount.

## Technologies Used

- React 18
- Vite
- React Router
- Supabase (PostgreSQL)
- Tailwind CSS

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

# siva-accounts
