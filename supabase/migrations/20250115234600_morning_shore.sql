/*
  # Add INSERT policy for profiles table

  1. Security Changes
    - Add INSERT policy to allow authenticated users to create their own profile
    - This fixes the 403 error when creating new profiles
*/

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);