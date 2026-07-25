import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRBACConfiguration1785000000006 implements MigrationInterface {
  name = 'SeedRBACConfiguration1785000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ===================================================================
    // 1. SEED MODULES (from bootstrap.seeder.ts MODULES_SEED)
    // ===================================================================
    const modulesData = [
      { name: 'Geography', code: 'GEOGRAPHY', is_permission_configurable: false },
      { name: 'Organization', code: 'ORGANIZATION', is_permission_configurable: false },
      { name: 'Product Config', code: 'PRODUCT_CONFIG', is_permission_configurable: false },
      { name: 'Projects', code: 'PROJECTS', is_permission_configurable: false },
      { name: 'Users', code: 'USERS', is_permission_configurable: false },
      { name: 'Permissions', code: 'PERMISSIONS', is_permission_configurable: false },
      { name: 'Brands', code: 'BRANDS', is_permission_configurable: true },
      { name: 'IOM', code: 'IOM', is_permission_configurable: true },
      { name: 'EOI', code: 'EOI', is_permission_configurable: true },
      { name: 'Inventory', code: 'INVENTORY', is_permission_configurable: true },
      { name: 'Batch', code: 'BATCH', is_permission_configurable: true },
      { name: 'eSignature', code: 'ESIGNATURE', is_permission_configurable: true },
      { name: 'Incentive', code: 'INCENTIVE', is_permission_configurable: true },
      { name: 'Booking Form', code: 'BOOKING_FORM', is_permission_configurable: true },
    ];
    const modIds: Record<string, number> = {};
    for (const m of modulesData) {
      const existing = await queryRunner.query(
        `SELECT id FROM modules WHERE code = $1`,
        [m.code],
      );
      if (existing.length > 0) {
        modIds[m.name] = existing[0].id;
      } else {
        const r = await queryRunner.query(
          `INSERT INTO modules (name, code, is_active, is_permission_configurable) VALUES ($1, $2, true, $3) RETURNING id`,
          [m.name, m.code, m.is_permission_configurable],
        );
        modIds[m.name] = r[0].id;
      }
    }

    // ===================================================================
    // 2. SEED SUB-MODULES
    // ===================================================================
    type SubDef = { name: string; moduleName: string; displayOrder: number; isPermissionConfigurable: boolean };
    const subModulesData: SubDef[] = [
      // Geography
      { name: 'ZONES', moduleName: 'Geography', displayOrder: 1, isPermissionConfigurable: false },
      { name: 'CITIES', moduleName: 'Geography', displayOrder: 2, isPermissionConfigurable: false },
      // Organization
      { name: 'DEPARTMENTS', moduleName: 'Organization', displayOrder: 1, isPermissionConfigurable: false },
      { name: 'ROLES', moduleName: 'Organization', displayOrder: 2, isPermissionConfigurable: false },
      // Product Config
      { name: 'MODULES', moduleName: 'Product Config', displayOrder: 1, isPermissionConfigurable: false },
      { name: 'SUB_MODULES', moduleName: 'Product Config', displayOrder: 2, isPermissionConfigurable: false },
      { name: 'ACTIONS', moduleName: 'Product Config', displayOrder: 3, isPermissionConfigurable: false },
      // Projects
      { name: 'PROJECTS', moduleName: 'Projects', displayOrder: 1, isPermissionConfigurable: false },
      // Users
      { name: 'USERS', moduleName: 'Users', displayOrder: 1, isPermissionConfigurable: false },
      // Permissions
      { name: 'PERMISSIONS', moduleName: 'Permissions', displayOrder: 1, isPermissionConfigurable: false },
      // Brands
      { name: 'BRANDS', moduleName: 'Brands', displayOrder: 1, isPermissionConfigurable: true },
      // IOM
      { name: 'Loyalty IOM', moduleName: 'IOM', displayOrder: 1, isPermissionConfigurable: true },
      { name: 'Stamp IOM', moduleName: 'IOM', displayOrder: 2, isPermissionConfigurable: true },
      // EOI
      { name: 'EOI Records', moduleName: 'EOI', displayOrder: 1, isPermissionConfigurable: true },
      { name: 'EOI Dashboard', moduleName: 'EOI', displayOrder: 2, isPermissionConfigurable: true },
      { name: 'EOI Leaderboard', moduleName: 'EOI', displayOrder: 3, isPermissionConfigurable: true },
      { name: 'EOI Manager', moduleName: 'EOI', displayOrder: 4, isPermissionConfigurable: true },
      { name: 'CP Link', moduleName: 'EOI', displayOrder: 5, isPermissionConfigurable: true },
      { name: 'Bank Details', moduleName: 'EOI', displayOrder: 6, isPermissionConfigurable: true },
      // Inventory
      { name: 'Add / Update Inventory', moduleName: 'Inventory', displayOrder: 1, isPermissionConfigurable: true },
      { name: 'Unit Mapping', moduleName: 'Inventory', displayOrder: 2, isPermissionConfigurable: true },
      // Batch
      { name: 'Listing', moduleName: 'Batch', displayOrder: 1, isPermissionConfigurable: true },
      { name: 'Tracker', moduleName: 'Batch', displayOrder: 2, isPermissionConfigurable: true },
      // eSignature
      { name: 'Agreement Management', moduleName: 'eSignature', displayOrder: 1, isPermissionConfigurable: true },
      // Incentive
      { name: 'Records', moduleName: 'Incentive', displayOrder: 1, isPermissionConfigurable: true },
      { name: 'Leaderboard', moduleName: 'Incentive', displayOrder: 2, isPermissionConfigurable: true },
      { name: 'Incentive Policy', moduleName: 'Incentive', displayOrder: 3, isPermissionConfigurable: true },
      { name: 'Booster Policy', moduleName: 'Incentive', displayOrder: 4, isPermissionConfigurable: true },
      { name: 'Modify Booking Dates', moduleName: 'Incentive', displayOrder: 5, isPermissionConfigurable: true },
      { name: 'Incentive Payouts', moduleName: 'Incentive', displayOrder: 6, isPermissionConfigurable: true },
      { name: 'Dashboard', moduleName: 'Incentive', displayOrder: 7, isPermissionConfigurable: true },
      { name: 'Reports', moduleName: 'Incentive', displayOrder: 8, isPermissionConfigurable: true },
      { name: 'Incentive Slabs', moduleName: 'Incentive', displayOrder: 9, isPermissionConfigurable: true },
      // Booking Form
      { name: 'Pre Booking Form', moduleName: 'Booking Form', displayOrder: 1, isPermissionConfigurable: true },
      { name: 'Post Booking Form', moduleName: 'Booking Form', displayOrder: 2, isPermissionConfigurable: true },
    ];

    // Map submodule name to its id, also store the modId for action linking
    const subModInfo: { id: number; modId: number; moduleName: string; name: string }[] = [];
    for (const sm of subModulesData) {
      const modId = modIds[sm.moduleName];
      if (!modId) continue;
      const existing = await queryRunner.query(
        `SELECT id FROM sub_modules WHERE module_id = $1 AND name = $2`,
        [modId, sm.name],
      );
      if (existing.length > 0) {
        subModInfo.push({ id: existing[0].id, modId, moduleName: sm.moduleName, name: sm.name });
      } else {
        const r = await queryRunner.query(
          `INSERT INTO sub_modules (module_id, name, display_order, is_active, is_permission_configurable) VALUES ($1, $2, $3, true, $4) RETURNING id`,
          [modId, sm.name, sm.displayOrder, sm.isPermissionConfigurable],
        );
        subModInfo.push({ id: r[0].id, modId, moduleName: sm.moduleName, name: sm.name });
      }
    }

    // Helper to find subModInfo by name
    const subId = (name: string): number | undefined =>
      subModInfo.find((s) => s.name === name)?.id;
    const subModId = (name: string): number | undefined =>
      subModInfo.find((s) => s.name === name)?.modId;

    // ===================================================================
    // 3. SEED ACTIONS
    // ===================================================================
    type ActionDef = { code: string; name: string; label: string };
    const actionsData: ActionDef[] = [
      // IOM actions
      { code: 'GENERATE_IOM', name: 'Generate IOM', label: 'Generate IOM' },
      { code: 'VIEW_IOM', name: 'View IOM', label: 'View IOM' },
      { code: 'APPROVE_IOM', name: 'Approve IOM', label: 'Approve IOM' },
      { code: 'REJECT_IOM', name: 'Reject IOM', label: 'Reject IOM' },
      { code: 'DELETE_IOM', name: 'Delete IOM', label: 'Delete IOM' },
      { code: 'EDIT_IOM', name: 'Edit IOM', label: 'Edit IOM' },
      { code: 'ADD_LOYALTY_POINTS', name: 'Add Loyalty Points', label: 'Add Loyalty Points' },
      { code: 'SIGNATURE_UPLOAD', name: 'Signature Upload', label: 'Signature Upload' },
      { code: 'REQUEST_INVOICE', name: 'Request Invoice', label: 'Request Invoice' },
      { code: 'SUBMIT_INVOICE', name: 'Submit Invoice', label: 'Submit Invoice' },
      { code: 'CLOSE_INVOICE', name: 'Close Invoice', label: 'Close Invoice' },
      { code: 'VIEW_INVOICE', name: 'View Invoice', label: 'View Invoice' },
      // EOI actions
      { code: 'PREVIEW_FORM', name: 'Preview Form', label: 'Preview Form' },
      { code: 'BOOKING_FORM', name: 'Booking Form', label: 'Booking Form' },
      { code: 'APPROVE_FORM', name: 'Approve Form', label: 'Approve Form' },
      { code: 'REQUEST_RESUBMISSION', name: 'Request for Resubmission', label: 'Request for Resubmission' },
      { code: 'APPROVE_UNIT', name: 'Approve Unit', label: 'Approve Unit' },
      { code: 'BLOCK_UNIT', name: 'Block Unit', label: 'Block Unit' },
      { code: 'REQUEST_CANCELLATION', name: 'Request Cancellation', label: 'Request Cancellation' },
      { code: 'CANCEL_REFUND', name: 'Cancel & Refund', label: 'Cancel & Refund' },
      { code: 'CHANGE_REQUEST', name: 'Change Request', label: 'Change Request' },
      { code: 'CREATE_LEAD_SFDC', name: 'Create Lead on SFDC', label: 'Create Lead on SFDC' },
      { code: 'CONVERT_LEAD_SFDC', name: 'Convert Lead on SFDC', label: 'Convert Lead on SFDC' },
      { code: 'PUSH_APPLICANT_DATA', name: 'Push Applicant Data', label: 'Push Applicant Data' },
      { code: 'EDIT_EOI_DETAILS', name: 'Edit EOI Details', label: 'Edit EOI Details' },
      { code: 'ASSIGN_RM', name: 'Assign RM', label: 'Assign RM' },
      { code: 'TRANSACTION_DETAILS', name: 'Transaction Details / View', label: 'Transaction Details / View' },
      { code: 'UPDATE_SFDC_IDS', name: 'Update SFDC IDs', label: 'Update SFDC IDs' },
      { code: 'EXPORT_BOOKING_FORM', name: 'Export Booking Form', label: 'Export Booking Form' },
      { code: 'DELETE_RECORD', name: 'Delete Record', label: 'Delete Record' },
      { code: 'RESTORE_RECORD', name: 'Restore Record', label: 'Restore Record' },
      { code: 'PRE_BOOKING_DOCUMENTS', name: 'Pre-Booking Documents', label: 'Pre-Booking Documents' },
      { code: 'CX_PAGE_LINK', name: 'Cx Page Link', label: 'Cx Page Link' },
      { code: 'DASHBOARD_VIEW', name: 'View', label: 'View' },
      { code: 'DASHBOARD_EXPORT', name: 'Export', label: 'Export' },
      { code: 'LEADERBOARD_CREATE', name: 'Create', label: 'Create' },
      { code: 'LEADERBOARD_EXPORT', name: 'Export', label: 'Export' },
      { code: 'VIEW_LIST', name: 'View List', label: 'View List' },
      { code: 'COPY_LINK', name: 'Copy Link', label: 'Copy Link' },
      { code: 'BANK_VIEW_LIST', name: 'View List', label: 'View List' },
      { code: 'BANK_SHARE', name: 'Share', label: 'Share' },
      // Inventory actions
      { code: 'UPLOAD_INVENTORY', name: 'Upload Inventory', label: 'Upload Inventory' },
      { code: 'MAP_UNIT_TO_VOUCHER', name: 'Map Unit to Voucher', label: 'Map Unit to Voucher' },
      // Batch actions
      { code: 'BATCH_CREATE', name: 'Create', label: 'Create' },
      { code: 'BATCH_EDIT', name: 'Edit', label: 'Edit' },
      { code: 'BATCH_DELETE', name: 'Delete', label: 'Delete' },
      { code: 'MAP_EOIS', name: 'Map EOIs', label: 'Map EOIs' },
      { code: 'NOTIFY_CUSTOMER', name: 'Notify Customer', label: 'Notify Customer' },
      { code: 'OPEN_BATCH', name: 'Open Batch', label: 'Open Batch' },
      { code: 'LOCK_BATCH', name: 'Lock Batch', label: 'Lock Batch' },
      { code: 'SHARE_PREVIEW', name: 'Share Preview', label: 'Share Preview' },
      { code: 'TRACKER_VIEW', name: 'View', label: 'View' },
      // eSignature actions
      { code: 'AGREEMENT_ADD', name: 'Add', label: 'Add' },
      { code: 'AGREEMENT_EDIT', name: 'Edit', label: 'Edit' },
      { code: 'SIGNED_PDF', name: 'Signed PDF', label: 'Signed PDF' },
      { code: 'VIEW_LINK', name: 'View Link', label: 'View Link' },
      { code: 'AGREEMENT_LISTING', name: 'Listing', label: 'Listing' },
      { code: 'SIGN_NOW', name: 'Sign Now', label: 'Sign Now' },
      // Incentive actions
      { code: 'RECORDS_USERS', name: 'Users', label: 'Users' },
      { code: 'RECORDS_BOOKINGS', name: 'Bookings', label: 'Bookings' },
      { code: 'INCENTIVE_REPORTS', name: 'Incentive Reports', label: 'Incentive Reports' },
      { code: 'INC_LEADERBOARD_VIEW', name: 'View', label: 'View' },
      { code: 'INC_LEADERBOARD_EXPORT', name: 'Export', label: 'Export' },
      { code: 'POLICY_CREATE', name: 'Create', label: 'Create' },
      { code: 'POLICY_VIEW', name: 'View', label: 'View' },
      { code: 'POLICY_EDIT', name: 'Edit', label: 'Edit' },
      { code: 'POLICY_ACTIVATE', name: 'Activate / Deactivate', label: 'Activate / Deactivate' },
      { code: 'BOOSTER_CREATE', name: 'Create', label: 'Create' },
      { code: 'BOOSTER_VIEW', name: 'View', label: 'View' },
      { code: 'BOOSTER_EDIT', name: 'Edit', label: 'Edit' },
      { code: 'BOOSTER_ACTIVATE', name: 'Activate / Deactivate', label: 'Activate / Deactivate' },
      { code: 'MODIFY_UPLOAD', name: 'Upload', label: 'Upload' },
      { code: 'EXPORT_INCENTIVE_PAYOUT', name: 'Export Incentive Payout', label: 'Export Incentive Payout' },
      { code: 'UPLOAD_INCENTIVE_PAYOUT', name: 'Upload Incentive Payout', label: 'Upload Incentive Payout' },
      { code: 'REPORT_ANALYSIS', name: 'Report Analysis', label: 'Report Analysis' },
      { code: 'FREEZE_RECORD', name: 'Freeze Record for Incentive Payout', label: 'Freeze Record for Incentive Payout' },
      { code: 'INC_DASHBOARD_VIEW', name: 'View', label: 'View' },
      { code: 'REPORTS_VIEW', name: 'View', label: 'View' },
      { code: 'REPORTS_GENERATE', name: 'Generate', label: 'Generate' },
      { code: 'SLABS_VIEW', name: 'View', label: 'View' },
      // Booking Form actions
      { code: 'UPLOAD_COST_SHEET', name: 'Upload Cost Sheet & Allotment Letter', label: 'Upload Cost Sheet & Allotment Letter' },
      { code: 'SHARE_BOOKING_FORM', name: 'Share Booking Form', label: 'Share Booking Form' },
      { code: 'EDIT_BOOKING_FORM_DRAFT', name: 'Edit Booking Form Draft', label: 'Edit Booking Form Draft' },
      { code: 'CREATE_APPLICANT', name: 'Create Applicant', label: 'Create Applicant' },
      { code: 'VIEW_APPLICANT', name: 'View Applicant', label: 'View Applicant' },
      { code: 'EDIT_APPLICANT', name: 'Edit Applicant', label: 'Edit Applicant' },
      { code: 'DELETE_APPLICANT', name: 'Delete Applicant', label: 'Delete Applicant' },
      { code: 'UNIT_SWAP', name: 'Unit Swap', label: 'Unit Swap' },
      { code: 'MULTI_UNIT_BOOKING', name: 'Multi Unit Booking', label: 'Multi Unit Booking' },
      { code: 'OFFICE_USE_SECTION', name: 'Office Use Section', label: 'Office Use Section' },
    ];

    const actIds: Record<string, number> = {};
    for (const a of actionsData) {
      const existing = await queryRunner.query(
        `SELECT id FROM actions WHERE code = $1`,
        [a.code],
      );
      if (existing.length > 0) {
        actIds[a.code] = existing[0].id;
      } else {
        const r = await queryRunner.query(
          `INSERT INTO actions (code, name, label, is_active) VALUES ($1, $2, $3, true) RETURNING id`,
          [a.code, a.name, a.label],
        );
        actIds[a.code] = r[0].id;
      }
    }

    // ===================================================================
    // 4. SEED ACTION GROUPS
    // ===================================================================
    type AGDef = { subModuleName: string; name: string; code: string; displayOrder: number };
    const actionGroupsData: AGDef[] = [
      // IOM > Loyalty IOM
      { subModuleName: 'Loyalty IOM', name: 'IOM Management', code: 'IOM_MGMT', displayOrder: 1 },
      { subModuleName: 'Loyalty IOM', name: 'Loyalty', code: 'IOM_LOYALTY', displayOrder: 2 },
      { subModuleName: 'Loyalty IOM', name: 'Signature', code: 'IOM_SIGNATURE', displayOrder: 3 },
      { subModuleName: 'Loyalty IOM', name: 'Invoice', code: 'IOM_INVOICE', displayOrder: 4 },
      // EOI > EOI Records
      { subModuleName: 'EOI Records', name: 'Booking', code: 'EOI_BOOKING', displayOrder: 1 },
      { subModuleName: 'EOI Records', name: 'CRM', code: 'EOI_CRM', displayOrder: 2 },
      { subModuleName: 'EOI Records', name: 'Applicant', code: 'EOI_APPLICANT', displayOrder: 3 },
      { subModuleName: 'EOI Records', name: 'SFDC', code: 'EOI_SFDC', displayOrder: 4 },
      { subModuleName: 'EOI Records', name: 'Export', code: 'EOI_EXPORT', displayOrder: 5 },
      { subModuleName: 'EOI Records', name: 'Recovery', code: 'EOI_RECOVERY', displayOrder: 6 },
      { subModuleName: 'EOI Records', name: 'Documents', code: 'EOI_DOCUMENTS', displayOrder: 7 },
      { subModuleName: 'EOI Records', name: 'Utilities', code: 'EOI_UTILITIES', displayOrder: 8 },
      // EOI > EOI Dashboard
      { subModuleName: 'EOI Dashboard', name: 'Dashboard', code: 'EOI_DASHBOARD', displayOrder: 1 },
      // EOI > EOI Leaderboard
      { subModuleName: 'EOI Leaderboard', name: 'Leaderboard', code: 'EOI_LEADERBOARD', displayOrder: 1 },
      // EOI > CP Link
      { subModuleName: 'CP Link', name: 'Link', code: 'EOI_CP_LINK', displayOrder: 1 },
      // EOI > Bank Details
      { subModuleName: 'Bank Details', name: 'Bank Details', code: 'EOI_BANK_DETAILS', displayOrder: 1 },
      // Inventory > Add / Update Inventory
      { subModuleName: 'Add / Update Inventory', name: 'Inventory', code: 'INV_INVENTORY', displayOrder: 1 },
      // Inventory > Unit Mapping
      { subModuleName: 'Unit Mapping', name: 'Unit Mapping', code: 'INV_UNIT_MAPPING', displayOrder: 1 },
      // Batch > Listing
      { subModuleName: 'Listing', name: 'Batch Management', code: 'BATCH_MGMT', displayOrder: 1 },
      // Batch > Tracker
      { subModuleName: 'Tracker', name: 'Tracker', code: 'BATCH_TRACKER', displayOrder: 1 },
      // eSignature > Agreement Management
      { subModuleName: 'Agreement Management', name: 'Agreement', code: 'ESIGN_AGREEMENT', displayOrder: 1 },
      // Incentive > Records
      { subModuleName: 'Records', name: 'Records', code: 'INC_RECORDS', displayOrder: 1 },
      // Incentive > Leaderboard
      { subModuleName: 'Leaderboard', name: 'Leaderboard', code: 'INC_LEADERBOARD', displayOrder: 1 },
      // Incentive > Incentive Policy
      { subModuleName: 'Incentive Policy', name: 'Policy', code: 'INC_POLICY', displayOrder: 1 },
      // Incentive > Booster Policy
      { subModuleName: 'Booster Policy', name: 'Policy', code: 'INC_BOOSTER_POLICY', displayOrder: 1 },
      // Incentive > Modify Booking Dates
      { subModuleName: 'Modify Booking Dates', name: 'Upload', code: 'INC_MODIFY_UPLOAD', displayOrder: 1 },
      // Incentive > Incentive Payouts
      { subModuleName: 'Incentive Payouts', name: 'Payout', code: 'INC_PAYOUT', displayOrder: 1 },
      // Incentive > Dashboard
      { subModuleName: 'Dashboard', name: 'Dashboard', code: 'INC_DASHBOARD', displayOrder: 1 },
      // Incentive > Reports
      { subModuleName: 'Reports', name: 'Reports', code: 'INC_REPORTS', displayOrder: 1 },
      // Incentive > Incentive Slabs
      { subModuleName: 'Incentive Slabs', name: 'Slabs', code: 'INC_SLABS', displayOrder: 1 },
      // Booking Form > Pre Booking Form
      { subModuleName: 'Pre Booking Form', name: 'Documents', code: 'BF_DOCUMENTS', displayOrder: 1 },
      { subModuleName: 'Pre Booking Form', name: 'Booking Form', code: 'BF_FORM', displayOrder: 2 },
      { subModuleName: 'Pre Booking Form', name: 'Applicant Management', code: 'BF_APPLICANT', displayOrder: 3 },
      { subModuleName: 'Pre Booking Form', name: 'Unit Management', code: 'BF_UNIT', displayOrder: 4 },
      // Booking Form > Post Booking Form
      { subModuleName: 'Post Booking Form', name: 'Office Use', code: 'BF_OFFICE_USE', displayOrder: 1 },
    ];

    // Map: subModuleName -> { agCode -> agId }
    const agInfo: Record<string, Record<string, number>> = {};
    for (const ag of actionGroupsData) {
      const smId = subId(ag.subModuleName);
      if (!smId) continue;
      const existing = await queryRunner.query(
        `SELECT id FROM action_groups WHERE sub_module_id = $1 AND code = $2`,
        [smId, ag.code],
      );
      let agId: number;
      if (existing.length > 0) {
        agId = existing[0].id;
      } else {
        const r = await queryRunner.query(
          `INSERT INTO action_groups (sub_module_id, name, code, display_order, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id`,
          [smId, ag.name, ag.code, ag.displayOrder],
        );
        agId = r[0].id;
      }
      if (!agInfo[ag.subModuleName]) agInfo[ag.subModuleName] = {};
      agInfo[ag.subModuleName][ag.code] = agId;

      // Link actions to this action group (and update actions.action_group_id)
      const actionsInGroup = this.getActionsForGroup(ag.code);
      for (const actionCode of actionsInGroup) {
        const actId = actIds[actionCode];
        if (!actId) continue;
        await queryRunner.query(
          `UPDATE actions SET action_group_id = $1 WHERE id = $2 AND action_group_id IS NULL`,
          [agId, actId],
        );
      }
    }

    // ===================================================================
    // 5. SEED MODULE-ACTIONS (set permissions visibility)
    // ===================================================================
    // For permission-configurable sub-modules, link their action-group actions.
    // For non-configurable sub-modules (Geography, Organization, etc.), we link
    // a minimal set so the permission engine works.

    // Helper: link action to sub-module
    const linkAction = async (modId: number, smId: number, actId: number) => {
      await queryRunner.query(
        `INSERT INTO module_actions (module_id, sub_module_id, action_id, is_active) VALUES ($1, $2, $3, true) ON CONFLICT DO NOTHING`,
        [modId, smId, actId],
      );
    };

    // Non-configurable sub-modules get VIEW, CREATE, UPDATE, DELETE, APPROVE, REJECT, EXPORT, IMPORT
    const baseActionsForSub = async (smName: string) => {
      const info = subModInfo.find((s) => s.name === smName);
      if (!info) return;
      // Check if these base actions exist; create if not
      const baseCodes = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'IMPORT'];
      for (const code of baseCodes) {
        let actId = actIds[code];
        if (!actId) {
          const existing = await queryRunner.query(`SELECT id FROM actions WHERE code = $1`, [code]);
          if (existing.length > 0) {
            actId = existing[0].id;
            actIds[code] = actId;
          } else {
            const r = await queryRunner.query(
              `INSERT INTO actions (code, name, label, is_active) VALUES ($1, $2, $3, true) RETURNING id`,
              [code, code.charAt(0) + code.slice(1).toLowerCase(), code.charAt(0) + code.slice(1).toLowerCase()],
            );
            actId = r[0].id;
            actIds[code] = actId;
          }
        }
        await linkAction(info.modId, info.id, actId);
      }
    };

    // Link configurable sub-module actions
    const linkGroupActions = async (smName: string, groupCode: string) => {
      const info = subModInfo.find((s) => s.name === smName);
      if (!info) return;
      const actionsInGroup = this.getActionsForGroup(groupCode);
      for (const actionCode of actionsInGroup) {
        const actId = actIds[actionCode];
        if (!actId) continue;
        await linkAction(info.modId, info.id, actId);
      }
    };

    // Non-configurable: ZONES, CITIES, DEPARTMENTS, ROLES, MODULES, SUB_MODULES, ACTIONS, PROJECTS, USERS, PERMISSIONS
    await baseActionsForSub('ZONES');
    await baseActionsForSub('CITIES');
    await baseActionsForSub('DEPARTMENTS');
    await baseActionsForSub('ROLES');
    await baseActionsForSub('MODULES');
    await baseActionsForSub('SUB_MODULES');
    await baseActionsForSub('ACTIONS');
    await baseActionsForSub('PROJECTS');
    await baseActionsForSub('USERS');
    await baseActionsForSub('PERMISSIONS');
    await baseActionsForSub('BRANDS');

    // IOM
    await linkGroupActions('Loyalty IOM', 'IOM_MGMT');
    await linkGroupActions('Loyalty IOM', 'IOM_LOYALTY');
    await linkGroupActions('Loyalty IOM', 'IOM_SIGNATURE');
    await linkGroupActions('Loyalty IOM', 'IOM_INVOICE');

    // EOI Records
    await linkGroupActions('EOI Records', 'EOI_BOOKING');
    await linkGroupActions('EOI Records', 'EOI_CRM');
    await linkGroupActions('EOI Records', 'EOI_APPLICANT');
    await linkGroupActions('EOI Records', 'EOI_SFDC');
    await linkGroupActions('EOI Records', 'EOI_EXPORT');
    await linkGroupActions('EOI Records', 'EOI_RECOVERY');
    await linkGroupActions('EOI Records', 'EOI_DOCUMENTS');
    await linkGroupActions('EOI Records', 'EOI_UTILITIES');

    // EOI Dashboard
    await linkGroupActions('EOI Dashboard', 'EOI_DASHBOARD');

    // EOI Leaderboard
    await linkGroupActions('EOI Leaderboard', 'EOI_LEADERBOARD');

    // CP Link
    await linkGroupActions('CP Link', 'EOI_CP_LINK');

    // Bank Details
    await linkGroupActions('Bank Details', 'EOI_BANK_DETAILS');

    // Inventory
    await linkGroupActions('Add / Update Inventory', 'INV_INVENTORY');
    await linkGroupActions('Unit Mapping', 'INV_UNIT_MAPPING');

    // Batch
    await linkGroupActions('Listing', 'BATCH_MGMT');
    await linkGroupActions('Tracker', 'BATCH_TRACKER');

    // eSignature
    await linkGroupActions('Agreement Management', 'ESIGN_AGREEMENT');

    // Incentive
    await linkGroupActions('Records', 'INC_RECORDS');
    await linkGroupActions('Leaderboard', 'INC_LEADERBOARD');
    await linkGroupActions('Incentive Policy', 'INC_POLICY');
    await linkGroupActions('Booster Policy', 'INC_BOOSTER_POLICY');
    await linkGroupActions('Modify Booking Dates', 'INC_MODIFY_UPLOAD');
    await linkGroupActions('Incentive Payouts', 'INC_PAYOUT');
    await linkGroupActions('Dashboard', 'INC_DASHBOARD');
    await linkGroupActions('Reports', 'INC_REPORTS');
    await linkGroupActions('Incentive Slabs', 'INC_SLABS');

    // Booking Form
    await linkGroupActions('Pre Booking Form', 'BF_DOCUMENTS');
    await linkGroupActions('Pre Booking Form', 'BF_FORM');
    await linkGroupActions('Pre Booking Form', 'BF_APPLICANT');
    await linkGroupActions('Pre Booking Form', 'BF_UNIT');
    await linkGroupActions('Post Booking Form', 'BF_OFFICE_USE');

    // ===================================================================
    // 6. SEED DEPARTMENTS
    // ===================================================================
    const departmentNames = ['CRM', 'Finance', 'HR', 'Marketing', 'Operations', 'Sales'];
    const deptIds: Record<string, number> = {};
    for (const d of departmentNames) {
      const existing = await queryRunner.query(
        `SELECT id FROM departments WHERE name = $1`,
        [d],
      );
      if (existing.length > 0) {
        deptIds[d] = existing[0].id;
      } else {
        const r = await queryRunner.query(
          `INSERT INTO departments (name, max_hierarchy_levels, is_active) VALUES ($1, 4, true) RETURNING id`,
          [d],
        );
        deptIds[d] = r[0].id;
      }
    }

    // ===================================================================
    // 7. SEED DEPARTMENT HIERARCHY LEVELS
    // ===================================================================
    const hierarchyLevels = [
      { levelNumber: 1, roleName: 'Executive', displayOrder: 1 },
      { levelNumber: 2, roleName: 'Manager', displayOrder: 2 },
      { levelNumber: 3, roleName: 'Head', displayOrder: 3 },
      { levelNumber: 4, roleName: 'Director', displayOrder: 4 },
    ];
    // Map: deptName -> [levelNumber -> levelId]
    const hlIds: Record<string, Record<number, number>> = {};
    for (const deptName of departmentNames) {
      hlIds[deptName] = {};
      for (const hl of hierarchyLevels) {
        const existing = await queryRunner.query(
          `SELECT id FROM department_hierarchy_levels WHERE department_id = $1 AND level_number = $2`,
          [deptIds[deptName], hl.levelNumber],
        );
        if (existing.length > 0) {
          hlIds[deptName][hl.levelNumber] = existing[0].id;
        } else {
          const r = await queryRunner.query(
            `INSERT INTO department_hierarchy_levels (department_id, level_number, role_name, display_order, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id`,
            [deptIds[deptName], hl.levelNumber, hl.roleName, hl.displayOrder],
          );
          hlIds[deptName][hl.levelNumber] = r[0].id;
        }
      }
    }

    // ===================================================================
    // 8. SEED ROLES (department-specific roles)
    // ===================================================================
    interface RoleDef {
      name: string;
      hierarchyLevelRank: number;
      deptName: string;
    }
    const rolesData: RoleDef[] = [];
    for (const deptName of departmentNames) {
      for (const hl of hierarchyLevels) {
        rolesData.push({
          name: `${deptName} ${hl.roleName}`,
          hierarchyLevelRank: hl.levelNumber,
          deptName,
        });
      }
    }

    const roleIds: Record<string, number> = {};
    for (const r of rolesData) {
      const existing = await queryRunner.query(
        `SELECT id FROM roles WHERE name = $1`,
        [r.name],
      );
      if (existing.length > 0) {
        roleIds[r.name] = existing[0].id;
      } else {
        const result = await queryRunner.query(
          `INSERT INTO roles (name, hierarchy_level_rank, is_active, is_system_role) VALUES ($1, $2, true, false) RETURNING id`,
          [r.name, r.hierarchyLevelRank],
        );
        roleIds[r.name] = result[0].id;
      }
    }

    // ===================================================================
    // 9. SEED DEPARTMENT_ROLES (link departments to roles)
    // ===================================================================
    for (const r of rolesData) {
      const roleId = roleIds[r.name];
      const deptId = deptIds[r.deptName];
      if (!roleId || !deptId) continue;
      const existing = await queryRunner.query(
        `SELECT 1 FROM department_roles WHERE department_id = $1 AND role_id = $2`,
        [deptId, roleId],
      );
      if (existing.length === 0) {
        await queryRunner.query(
          `INSERT INTO department_roles (department_id, role_id) VALUES ($1, $2)`,
          [deptId, roleId],
        );
      }
    }

    // ===================================================================
    // 10. GRANT SUPER_ADMIN ALL PERMISSIONS (role_action_permissions)
    // ===================================================================
    const superAdminRole = await queryRunner.query(
      `SELECT id FROM roles WHERE name = 'SUPER_ADMIN'`,
    );
    if (superAdminRole.length > 0) {
      const saRoleId = superAdminRole[0].id;
      // Get all module_actions entries
      const allModActions = await queryRunner.query(
        `SELECT id, module_id, sub_module_id, action_id FROM module_actions WHERE is_active = true`,
      );
      for (const ma of allModActions) {
        const existing = await queryRunner.query(
          `SELECT 1 FROM role_action_permissions WHERE role_id = $1 AND action_id = $2`,
          [saRoleId, ma.action_id],
        );
        if (existing.length === 0) {
          await queryRunner.query(
            `INSERT INTO role_action_permissions (role_id, module_id, sub_module_id, action_id) VALUES ($1, $2, $3, $4)`,
            [saRoleId, ma.module_id, ma.sub_module_id, ma.action_id],
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This is a data seed migration; the down method removes seeded data
    // Do NOT delete SUPER_ADMIN role or existing users
    await queryRunner.query(`DELETE FROM role_action_permissions`);
    await queryRunner.query(`DELETE FROM department_roles`);
    await queryRunner.query(`DELETE FROM roles WHERE is_system_role = false`);
    await queryRunner.query(`DELETE FROM department_hierarchy_levels`);
    await queryRunner.query(`DELETE FROM departments`);
    await queryRunner.query(`DELETE FROM module_actions`);
    await queryRunner.query(`UPDATE actions SET action_group_id = NULL`);
    await queryRunner.query(`DELETE FROM action_groups`);
    await queryRunner.query(`DELETE FROM actions WHERE code NOT IN ('VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'IMPORT')`);
    await queryRunner.query(`DELETE FROM sub_modules`);
    await queryRunner.query(`DELETE FROM modules`);
  }

  // Maps action group codes to their action codes (from bootstrap.seeder.ts)
  private getActionsForGroup(groupCode: string): string[] {
    const map: Record<string, string[]> = {
      'IOM_MGMT': ['GENERATE_IOM', 'VIEW_IOM', 'APPROVE_IOM', 'REJECT_IOM', 'DELETE_IOM', 'EDIT_IOM'],
      'IOM_LOYALTY': ['ADD_LOYALTY_POINTS'],
      'IOM_SIGNATURE': ['SIGNATURE_UPLOAD'],
      'IOM_INVOICE': ['REQUEST_INVOICE', 'SUBMIT_INVOICE', 'CLOSE_INVOICE', 'VIEW_INVOICE'],
      'EOI_BOOKING': ['PREVIEW_FORM', 'BOOKING_FORM', 'APPROVE_FORM', 'REQUEST_RESUBMISSION', 'APPROVE_UNIT', 'BLOCK_UNIT', 'REQUEST_CANCELLATION', 'CANCEL_REFUND', 'CHANGE_REQUEST'],
      'EOI_CRM': ['CREATE_LEAD_SFDC', 'CONVERT_LEAD_SFDC', 'PUSH_APPLICANT_DATA'],
      'EOI_APPLICANT': ['EDIT_EOI_DETAILS', 'ASSIGN_RM', 'TRANSACTION_DETAILS'],
      'EOI_SFDC': ['UPDATE_SFDC_IDS'],
      'EOI_EXPORT': ['EXPORT_BOOKING_FORM'],
      'EOI_RECOVERY': ['DELETE_RECORD', 'RESTORE_RECORD'],
      'EOI_DOCUMENTS': ['PRE_BOOKING_DOCUMENTS'],
      'EOI_UTILITIES': ['CX_PAGE_LINK'],
      'EOI_DASHBOARD': ['DASHBOARD_VIEW', 'DASHBOARD_EXPORT'],
      'EOI_LEADERBOARD': ['LEADERBOARD_CREATE', 'LEADERBOARD_EXPORT'],
      'EOI_CP_LINK': ['VIEW_LIST', 'COPY_LINK'],
      'EOI_BANK_DETAILS': ['BANK_VIEW_LIST', 'BANK_SHARE'],
      'INV_INVENTORY': ['UPLOAD_INVENTORY'],
      'INV_UNIT_MAPPING': ['MAP_UNIT_TO_VOUCHER'],
      'BATCH_MGMT': ['BATCH_CREATE', 'BATCH_EDIT', 'BATCH_DELETE', 'MAP_EOIS', 'NOTIFY_CUSTOMER', 'OPEN_BATCH', 'LOCK_BATCH', 'SHARE_PREVIEW'],
      'BATCH_TRACKER': ['TRACKER_VIEW'],
      'ESIGN_AGREEMENT': ['AGREEMENT_ADD', 'AGREEMENT_EDIT', 'SIGNED_PDF', 'VIEW_LINK', 'AGREEMENT_LISTING', 'SIGN_NOW'],
      'INC_RECORDS': ['RECORDS_USERS', 'RECORDS_BOOKINGS', 'INCENTIVE_REPORTS'],
      'INC_LEADERBOARD': ['INC_LEADERBOARD_VIEW', 'INC_LEADERBOARD_EXPORT'],
      'INC_POLICY': ['POLICY_CREATE', 'POLICY_VIEW', 'POLICY_EDIT', 'POLICY_ACTIVATE'],
      'INC_BOOSTER_POLICY': ['BOOSTER_CREATE', 'BOOSTER_VIEW', 'BOOSTER_EDIT', 'BOOSTER_ACTIVATE'],
      'INC_MODIFY_UPLOAD': ['MODIFY_UPLOAD'],
      'INC_PAYOUT': ['EXPORT_INCENTIVE_PAYOUT', 'UPLOAD_INCENTIVE_PAYOUT', 'REPORT_ANALYSIS', 'FREEZE_RECORD'],
      'INC_DASHBOARD': ['INC_DASHBOARD_VIEW'],
      'INC_REPORTS': ['REPORTS_VIEW', 'REPORTS_GENERATE'],
      'INC_SLABS': ['SLABS_VIEW'],
      'BF_DOCUMENTS': ['UPLOAD_COST_SHEET'],
      'BF_FORM': ['SHARE_BOOKING_FORM', 'EDIT_BOOKING_FORM_DRAFT'],
      'BF_APPLICANT': ['CREATE_APPLICANT', 'VIEW_APPLICANT', 'EDIT_APPLICANT', 'DELETE_APPLICANT'],
      'BF_UNIT': ['UNIT_SWAP', 'MULTI_UNIT_BOOKING'],
      'BF_OFFICE_USE': ['OFFICE_USE_SECTION'],
    };
    return map[groupCode] || [];
  }
}
