-- Seed data (optional - for development/testing)
-- This creates a sample org and admin user
-- Note: You'll need to create the auth user first in Supabase dashboard
-- Then update the profile with the correct user ID

-- Example: Create a sample organization
-- INSERT INTO orgs (id, name) VALUES 
-- ('00000000-0000-0000-0000-000000000001', 'Acme Corp');

-- Example: Create a sample profile (after creating auth user)
-- INSERT INTO profiles (id, email, full_name, role, org_id) VALUES
-- ('USER_UUID_FROM_AUTH', 'admin@example.com', 'Admin User', 'admin', '00000000-0000-0000-0000-000000000001');

-- Example: Create sample clients
-- INSERT INTO clients (id, org_id, name, email, phone, company) VALUES
-- ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'John Doe', 'john@example.com', '555-0100', 'Doe Industries'),
-- ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Jane Smith', 'jane@example.com', '555-0101', 'Smith LLC');
