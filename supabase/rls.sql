-- Enable Row Level Security on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's org_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Orgs policies
CREATE POLICY "Users can view their own org"
  ON orgs FOR SELECT
  USING (id = get_user_org_id());

CREATE POLICY "Admins can update their org"
  ON orgs FOR UPDATE
  USING (id = get_user_org_id() AND is_admin());

-- Profiles policies
CREATE POLICY "Users can view profiles in their org"
  ON profiles FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can update any profile in their org"
  ON profiles FOR UPDATE
  USING (org_id = get_user_org_id() AND is_admin());

-- Clients policies
CREATE POLICY "Users can view clients in their org"
  ON clients FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create clients in their org"
  ON clients FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Admins can update clients in their org"
  ON clients FOR UPDATE
  USING (org_id = get_user_org_id() AND is_admin());

CREATE POLICY "Admins can delete clients in their org"
  ON clients FOR DELETE
  USING (org_id = get_user_org_id() AND is_admin());

-- Projects policies
CREATE POLICY "Users can view projects in their org"
  ON projects FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create projects in their org"
  ON projects FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Admins can update projects in their org"
  ON projects FOR UPDATE
  USING (org_id = get_user_org_id() AND is_admin());

CREATE POLICY "Admins can delete projects in their org"
  ON projects FOR DELETE
  USING (org_id = get_user_org_id() AND is_admin());

-- Invoices policies
CREATE POLICY "Users can view invoices in their org"
  ON invoices FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create invoices in their org"
  ON invoices FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Admins can update invoices in their org"
  ON invoices FOR UPDATE
  USING (org_id = get_user_org_id() AND is_admin());

CREATE POLICY "Admins can delete invoices in their org"
  ON invoices FOR DELETE
  USING (org_id = get_user_org_id() AND is_admin());

-- Invoice line items policies
CREATE POLICY "Users can view line items for invoices in their org"
  ON invoice_line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.org_id = get_user_org_id()
    )
  );

CREATE POLICY "Users can create line items for invoices in their org"
  ON invoice_line_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.org_id = get_user_org_id()
    )
  );

CREATE POLICY "Admins can update line items for invoices in their org"
  ON invoice_line_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.org_id = get_user_org_id()
    )
    AND is_admin()
  );

CREATE POLICY "Admins can delete line items for invoices in their org"
  ON invoice_line_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.org_id = get_user_org_id()
    )
    AND is_admin()
  );

-- Notes policies
CREATE POLICY "Users can view notes in their org"
  ON notes FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create notes in their org"
  ON notes FOR INSERT
  WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Admins can update any note in their org"
  ON notes FOR UPDATE
  USING (org_id = get_user_org_id() AND is_admin());

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Admins can delete any note in their org"
  ON notes FOR DELETE
  USING (org_id = get_user_org_id() AND is_admin());
