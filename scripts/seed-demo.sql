-- =============================================================================
-- Demo Seed Data
-- =============================================================================
-- Run this AFTER phase6_demo_reset to restore a demo-friendly dataset.
-- The Super Admin (ADMIN001) must already exist.
-- =============================================================================

BEGIN;

-- 1. Departments
INSERT INTO departments (id, name, zone_id, is_active) VALUES
  (77, 'Finance', 63, true),
  (78, 'Sales', 62, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Department-Zone mappings
INSERT INTO department_zone_mappings (department_id, zone_id) VALUES
  (77, 63), (77, 62), (78, 63), (78, 62)
ON CONFLICT DO NOTHING;

-- 3. Department-Role assignments (link roles to departments)
INSERT INTO department_roles (department_id, role_id) VALUES
  (77, 71), (77, 72), (77, 73),
  (78, 77), (78, 78)
ON CONFLICT DO NOTHING;

-- 4. Department hierarchy levels
INSERT INTO department_hierarchy_levels (department_id, level_number, role_name, role_id, is_active, display_order) VALUES
  (77, 1, 'Approver', 71, true, 1),
  (77, 2, 'Verifier', 72, true, 2),
  (77, 3, 'Head', 73, true, 3),
  (78, 1, 'Sales Executive', 74, false, 1),
  (78, 2, 'Sales Team Lead', 75, false, 2),
  (78, 3, 'Sales Manager', 76, false, 3),
  (78, 4, 'Sales Head', 77, true, 4),
  (78, 5, 'Sales HOD', 78, true, 5)
ON CONFLICT DO NOTHING;

COMMIT;
