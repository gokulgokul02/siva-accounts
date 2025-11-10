-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_name TEXT NOT NULL,
  place TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create places table
CREATE TABLE IF NOT EXISTS places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_name TEXT NOT NULL UNIQUE,
  default_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diesel_expenses table
CREATE TABLE IF NOT EXISTS diesel_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(date);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_diesel_expenses_date ON diesel_expenses(date);

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE diesel_expenses ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your authentication needs)
-- For development, you can use these policies. For production, implement proper authentication.

-- Trips policies
CREATE POLICY "Allow all operations on trips" ON trips
  FOR ALL USING (true) WITH CHECK (true);

-- Places policies
CREATE POLICY "Allow all operations on places" ON places
  FOR ALL USING (true) WITH CHECK (true);

-- Diesel expenses policies
CREATE POLICY "Allow all operations on diesel_expenses" ON diesel_expenses
  FOR ALL USING (true) WITH CHECK (true);

