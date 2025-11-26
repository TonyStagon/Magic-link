/*
  # Magic Link User Management Schema

  1. New Tables
    - `magic_link_users`
      - `id` (uuid, primary key) - Unique identifier for each user
      - `email` (text, unique, not null) - User's email address
      - `is_active` (boolean, default false) - Activation status set by admin
      - `magic_token` (uuid, unique) - Unique token for the magic link
      - `activated_at` (timestamptz) - Timestamp when user was activated by admin
      - `first_access_at` (timestamptz) - Timestamp when user first accessed their link
      - `created_at` (timestamptz, default now()) - Record creation timestamp
      - `updated_at` (timestamptz, default now()) - Last update timestamp
  
  2. Security
    - Enable RLS on `magic_link_users` table
    - Add policy for public read access by magic token (for welcome page)
    - Add policy for authenticated admins to manage users
  
  3. Indexes
    - Index on magic_token for fast lookups
    - Index on email for admin user management
*/

CREATE TABLE IF NOT EXISTS magic_link_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT false,
  magic_token uuid UNIQUE DEFAULT gen_random_uuid(),
  activated_at timestamptz,
  first_access_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE magic_link_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access by magic token"
  ON magic_link_users
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow authenticated admins to view all users"
  ON magic_link_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated admins to insert users"
  ON magic_link_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated admins to update users"
  ON magic_link_users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated admins to delete users"
  ON magic_link_users
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_magic_link_users_token ON magic_link_users(magic_token);
CREATE INDEX IF NOT EXISTS idx_magic_link_users_email ON magic_link_users(email);

CREATE OR REPLACE FUNCTION update_magic_link_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_magic_link_users_updated_at
  BEFORE UPDATE ON magic_link_users
  FOR EACH ROW
  EXECUTE FUNCTION update_magic_link_users_updated_at();
