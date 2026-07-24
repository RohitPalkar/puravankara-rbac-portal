import { DataSource, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../modules/organization/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { UserAuth } from '../../modules/auth/entities/user-auth.entity';
import { UserRole } from '../../modules/users/entities/user-role.entity';
import { Action } from '../../modules/product-catalog/entities/action.entity';
import { Module } from '../../modules/product-catalog/entities/module.entity';
import { SubModule } from '../../modules/product-catalog/entities/sub-module.entity';
import { ActionGroup } from '../../modules/product-catalog/entities/action-group.entity';
import { ModuleAction } from '../../modules/product-catalog/entities/module-action.entity';
import { Zone } from '../../modules/geography/entities/zone.entity';

const SALT_ROUNDS = 12;

interface ModuleSeed {
  name: string;
  code: string;
  isPermissionConfigurable: boolean;
  subModules: SubModuleSeed[];
}

interface ActionGroupSeed {
  name: string;
  code: string;
  actions: { name: string; code: string }[];
  displayOrder: number;
}

interface SubModuleSeed {
  name: string;
  displayOrder: number;
  actionGroups: ActionGroupSeed[];
}

const MODULES_SEED: ModuleSeed[] = [
  {
    name: 'Geography', code: 'GEOGRAPHY', isPermissionConfigurable: false,
    subModules: [
      { name: 'ZONES', displayOrder: 1, actionGroups: [] },
      { name: 'CITIES', displayOrder: 2, actionGroups: [] },
    ],
  },
  {
    name: 'Organization', code: 'ORGANIZATION', isPermissionConfigurable: false,
    subModules: [
      { name: 'DEPARTMENTS', displayOrder: 1, actionGroups: [] },
      { name: 'ROLES', displayOrder: 2, actionGroups: [] },
    ],
  },
  {
    name: 'Product Config', code: 'PRODUCT_CONFIG', isPermissionConfigurable: false,
    subModules: [
      { name: 'MODULES', displayOrder: 1, actionGroups: [] },
      { name: 'SUB_MODULES', displayOrder: 2, actionGroups: [] },
      { name: 'ACTIONS', displayOrder: 3, actionGroups: [] },
    ],
  },
  {
    name: 'Projects', code: 'PROJECTS', isPermissionConfigurable: false,
    subModules: [
      { name: 'PROJECTS', displayOrder: 1, actionGroups: [] },
    ],
  },
  {
    name: 'Users', code: 'USERS', isPermissionConfigurable: false,
    subModules: [
      { name: 'USERS', displayOrder: 1, actionGroups: [] },
    ],
  },
  {
    name: 'Permissions', code: 'PERMISSIONS', isPermissionConfigurable: false,
    subModules: [
      { name: 'PERMISSIONS', displayOrder: 1, actionGroups: [] },
    ],
  },
  {
    name: 'Brands', code: 'BRANDS', isPermissionConfigurable: true,
    subModules: [
      { name: 'BRANDS', displayOrder: 1, actionGroups: [] },
    ],
  },
  {
    name: 'IOM', code: 'IOM', isPermissionConfigurable: true,
    subModules: [
      {
        name: 'Loyalty IOM', displayOrder: 1,
        actionGroups: [
          {
            name: 'IOM Management', code: 'IOM_MGMT', displayOrder: 1,
            actions: [
              { name: 'Generate IOM', code: 'GENERATE_IOM' },
              { name: 'View IOM', code: 'VIEW_IOM' },
              { name: 'Approve IOM', code: 'APPROVE_IOM' },
              { name: 'Reject IOM', code: 'REJECT_IOM' },
              { name: 'Delete IOM', code: 'DELETE_IOM' },
              { name: 'Edit IOM', code: 'EDIT_IOM' },
            ],
          },
          {
            name: 'Loyalty', code: 'IOM_LOYALTY', displayOrder: 2,
            actions: [
              { name: 'Add Loyalty Points', code: 'ADD_LOYALTY_POINTS' },
            ],
          },
          {
            name: 'Signature', code: 'IOM_SIGNATURE', displayOrder: 3,
            actions: [
              { name: 'Signature Upload', code: 'SIGNATURE_UPLOAD' },
            ],
          },
          {
            name: 'Invoice', code: 'IOM_INVOICE', displayOrder: 4,
            actions: [
              { name: 'Request Invoice', code: 'REQUEST_INVOICE' },
              { name: 'Submit Invoice', code: 'SUBMIT_INVOICE' },
              { name: 'Close Invoice', code: 'CLOSE_INVOICE' },
              { name: 'View Invoice', code: 'VIEW_INVOICE' },
            ],
          },
        ],
      },
      {
        name: 'Stamp IOM', displayOrder: 2, actionGroups: [],
      },
    ],
  },
  {
    name: 'EOI', code: 'EOI', isPermissionConfigurable: true,
    subModules: [
      {
        name: 'EOI Records', displayOrder: 1,
        actionGroups: [
          {
            name: 'Booking', code: 'EOI_BOOKING', displayOrder: 1,
            actions: [
              { name: 'Preview Form', code: 'PREVIEW_FORM' },
              { name: 'Booking Form', code: 'BOOKING_FORM' },
              { name: 'Approve Form', code: 'APPROVE_FORM' },
              { name: 'Request for Resubmission', code: 'REQUEST_RESUBMISSION' },
              { name: 'Approve Unit', code: 'APPROVE_UNIT' },
              { name: 'Block Unit', code: 'BLOCK_UNIT' },
              { name: 'Request Cancellation', code: 'REQUEST_CANCELLATION' },
              { name: 'Cancel & Refund', code: 'CANCEL_REFUND' },
              { name: 'Change Request', code: 'CHANGE_REQUEST' },
            ],
          },
          {
            name: 'CRM', code: 'EOI_CRM', displayOrder: 2,
            actions: [
              { name: 'Create Lead on SFDC', code: 'CREATE_LEAD_SFDC' },
              { name: 'Convert Lead on SFDC', code: 'CONVERT_LEAD_SFDC' },
              { name: 'Push Applicant Data', code: 'PUSH_APPLICANT_DATA' },
            ],
          },
          {
            name: 'Applicant', code: 'EOI_APPLICANT', displayOrder: 3,
            actions: [
              { name: 'Edit EOI Details', code: 'EDIT_EOI_DETAILS' },
              { name: 'Assign RM', code: 'ASSIGN_RM' },
              { name: 'Transaction Details / View', code: 'TRANSACTION_DETAILS' },
            ],
          },
          {
            name: 'SFDC', code: 'EOI_SFDC', displayOrder: 4,
            actions: [
              { name: 'Update SFDC IDs', code: 'UPDATE_SFDC_IDS' },
            ],
          },
          {
            name: 'Export', code: 'EOI_EXPORT', displayOrder: 5,
            actions: [
              { name: 'Export Booking Form', code: 'EXPORT_BOOKING_FORM' },
            ],
          },
          {
            name: 'Recovery', code: 'EOI_RECOVERY', displayOrder: 6,
            actions: [
              { name: 'Delete Record', code: 'DELETE_RECORD' },
              { name: 'Restore Record', code: 'RESTORE_RECORD' },
            ],
          },
          {
            name: 'Documents', code: 'EOI_DOCUMENTS', displayOrder: 7,
            actions: [
              { name: 'Pre-Booking Documents', code: 'PRE_BOOKING_DOCUMENTS' },
            ],
          },
          {
            name: 'Utilities', code: 'EOI_UTILITIES', displayOrder: 8,
            actions: [
              { name: 'Cx Page Link', code: 'CX_PAGE_LINK' },
            ],
          },
        ],
      },
      {
        name: 'EOI Dashboard', displayOrder: 2,
        actionGroups: [
          {
            name: 'Dashboard', code: 'EOI_DASHBOARD', displayOrder: 1,
            actions: [
              { name: 'View', code: 'DASHBOARD_VIEW' },
              { name: 'Export', code: 'DASHBOARD_EXPORT' },
            ],
          },
        ],
      },
      {
        name: 'EOI Leaderboard', displayOrder: 3,
        actionGroups: [
          {
            name: 'Leaderboard', code: 'EOI_LEADERBOARD', displayOrder: 1,
            actions: [
              { name: 'Create', code: 'LEADERBOARD_CREATE' },
              { name: 'Export', code: 'LEADERBOARD_EXPORT' },
            ],
          },
        ],
      },
      {
        name: 'EOI Manager', displayOrder: 4, actionGroups: [],
      },
      {
        name: 'CP Link', displayOrder: 5,
        actionGroups: [
          {
            name: 'Link', code: 'EOI_CP_LINK', displayOrder: 1,
            actions: [
              { name: 'View List', code: 'VIEW_LIST' },
              { name: 'Copy Link', code: 'COPY_LINK' },
            ],
          },
        ],
      },
      {
        name: 'Bank Details', displayOrder: 6,
        actionGroups: [
          {
            name: 'Bank Details', code: 'EOI_BANK_DETAILS', displayOrder: 1,
            actions: [
              { name: 'View List', code: 'BANK_VIEW_LIST' },
              { name: 'Share', code: 'BANK_SHARE' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Inventory', code: 'INVENTORY', isPermissionConfigurable: true,
    subModules: [
      {
        name: 'Add / Update Inventory', displayOrder: 1,
        actionGroups: [
          {
            name: 'Inventory', code: 'INV_INVENTORY', displayOrder: 1,
            actions: [
              { name: 'Upload Inventory', code: 'UPLOAD_INVENTORY' },
            ],
          },
        ],
      },
      {
        name: 'Unit Mapping', displayOrder: 2,
        actionGroups: [
          {
            name: 'Unit Mapping', code: 'INV_UNIT_MAPPING', displayOrder: 1,
            actions: [
              { name: 'Map Unit to Voucher', code: 'MAP_UNIT_TO_VOUCHER' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Batch', code: 'BATCH', isPermissionConfigurable: true,
    subModules: [
      {
        name: 'Listing', displayOrder: 1,
        actionGroups: [
          {
            name: 'Batch Management', code: 'BATCH_MGMT', displayOrder: 1,
            actions: [
              { name: 'Create', code: 'BATCH_CREATE' },
              { name: 'Edit', code: 'BATCH_EDIT' },
              { name: 'Delete', code: 'BATCH_DELETE' },
              { name: 'Map EOIs', code: 'MAP_EOIS' },
              { name: 'Notify Customer', code: 'NOTIFY_CUSTOMER' },
              { name: 'Open Batch', code: 'OPEN_BATCH' },
              { name: 'Lock Batch', code: 'LOCK_BATCH' },
              { name: 'Share Preview', code: 'SHARE_PREVIEW' },
            ],
          },
        ],
      },
      {
        name: 'Tracker', displayOrder: 2,
        actionGroups: [
          {
            name: 'Tracker', code: 'BATCH_TRACKER', displayOrder: 1,
            actions: [
              { name: 'View', code: 'TRACKER_VIEW' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'eSignature', code: 'ESIGNATURE', isPermissionConfigurable: true,
    subModules: [
      {
        name: 'Agreement Management', displayOrder: 1,
        actionGroups: [
          {
            name: 'Agreement', code: 'ESIGN_AGREEMENT', displayOrder: 1,
            actions: [
              { name: 'Add', code: 'AGREEMENT_ADD' },
              { name: 'Edit', code: 'AGREEMENT_EDIT' },
              { name: 'Signed PDF', code: 'SIGNED_PDF' },
              { name: 'View Link', code: 'VIEW_LINK' },
              { name: 'Listing', code: 'AGREEMENT_LISTING' },
              { name: 'Sign Now', code: 'SIGN_NOW' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Incentive', code: 'INCENTIVE', isPermissionConfigurable: true,
    subModules: [
      {
        name: 'Records', displayOrder: 1,
        actionGroups: [
          {
            name: 'Records', code: 'INC_RECORDS', displayOrder: 1,
            actions: [
              { name: 'Users', code: 'RECORDS_USERS' },
              { name: 'Bookings', code: 'RECORDS_BOOKINGS' },
              { name: 'Incentive Reports', code: 'INCENTIVE_REPORTS' },
            ],
          },
        ],
      },
      {
        name: 'Leaderboard', displayOrder: 2,
        actionGroups: [
          {
            name: 'Leaderboard', code: 'INC_LEADERBOARD', displayOrder: 1,
            actions: [
              { name: 'View', code: 'INC_LEADERBOARD_VIEW' },
              { name: 'Export', code: 'INC_LEADERBOARD_EXPORT' },
            ],
          },
        ],
      },
      {
        name: 'Incentive Policy', displayOrder: 3,
        actionGroups: [
          {
            name: 'Policy', code: 'INC_POLICY', displayOrder: 1,
            actions: [
              { name: 'Create', code: 'POLICY_CREATE' },
              { name: 'View', code: 'POLICY_VIEW' },
              { name: 'Edit', code: 'POLICY_EDIT' },
              { name: 'Activate / Deactivate', code: 'POLICY_ACTIVATE' },
            ],
          },
        ],
      },
      {
        name: 'Booster Policy', displayOrder: 4,
        actionGroups: [
          {
            name: 'Policy', code: 'INC_BOOSTER_POLICY', displayOrder: 1,
            actions: [
              { name: 'Create', code: 'BOOSTER_CREATE' },
              { name: 'View', code: 'BOOSTER_VIEW' },
              { name: 'Edit', code: 'BOOSTER_EDIT' },
              { name: 'Activate / Deactivate', code: 'BOOSTER_ACTIVATE' },
            ],
          },
        ],
      },
      {
        name: 'Modify Booking Dates', displayOrder: 5,
        actionGroups: [
          {
            name: 'Upload', code: 'INC_MODIFY_UPLOAD', displayOrder: 1,
            actions: [
              { name: 'Upload', code: 'MODIFY_UPLOAD' },
            ],
          },
        ],
      },
      {
        name: 'Incentive Payouts', displayOrder: 6,
        actionGroups: [
          {
            name: 'Payout', code: 'INC_PAYOUT', displayOrder: 1,
            actions: [
              { name: 'Export Incentive Payout', code: 'EXPORT_INCENTIVE_PAYOUT' },
              { name: 'Upload Incentive Payout', code: 'UPLOAD_INCENTIVE_PAYOUT' },
              { name: 'Report Analysis', code: 'REPORT_ANALYSIS' },
              { name: 'Freeze Record for Incentive Payout', code: 'FREEZE_RECORD' },
            ],
          },
        ],
      },
      {
        name: 'Dashboard', displayOrder: 7,
        actionGroups: [
          {
            name: 'Dashboard', code: 'INC_DASHBOARD', displayOrder: 1,
            actions: [
              { name: 'View', code: 'INC_DASHBOARD_VIEW' },
            ],
          },
        ],
      },
      {
        name: 'Reports', displayOrder: 8,
        actionGroups: [
          {
            name: 'Reports', code: 'INC_REPORTS', displayOrder: 1,
            actions: [
              { name: 'View', code: 'REPORTS_VIEW' },
              { name: 'Generate', code: 'REPORTS_GENERATE' },
            ],
          },
        ],
      },
      {
        name: 'Incentive Slabs', displayOrder: 9,
        actionGroups: [
          {
            name: 'Slabs', code: 'INC_SLABS', displayOrder: 1,
            actions: [
              { name: 'View', code: 'SLABS_VIEW' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Booking Form', code: 'BOOKING_FORM', isPermissionConfigurable: true,
    subModules: [
      {
        name: 'Pre Booking Form', displayOrder: 1,
        actionGroups: [
          {
            name: 'Documents', code: 'BF_DOCUMENTS', displayOrder: 1,
            actions: [
              { name: 'Upload Cost Sheet & Allotment Letter', code: 'UPLOAD_COST_SHEET' },
            ],
          },
          {
            name: 'Booking Form', code: 'BF_FORM', displayOrder: 2,
            actions: [
              { name: 'Share Booking Form', code: 'SHARE_BOOKING_FORM' },
              { name: 'Edit Booking Form Draft', code: 'EDIT_BOOKING_FORM_DRAFT' },
            ],
          },
          {
            name: 'Applicant Management', code: 'BF_APPLICANT', displayOrder: 3,
            actions: [
              { name: 'Create Applicant', code: 'CREATE_APPLICANT' },
              { name: 'View Applicant', code: 'VIEW_APPLICANT' },
              { name: 'Edit Applicant', code: 'EDIT_APPLICANT' },
              { name: 'Delete Applicant', code: 'DELETE_APPLICANT' },
            ],
          },
          {
            name: 'Unit Management', code: 'BF_UNIT', displayOrder: 4,
            actions: [
              { name: 'Unit Swap', code: 'UNIT_SWAP' },
              { name: 'Multi Unit Booking', code: 'MULTI_UNIT_BOOKING' },
            ],
          },
        ],
      },
      {
        name: 'Post Booking Form', displayOrder: 2,
        actionGroups: [
          {
            name: 'Office Use', code: 'BF_OFFICE_USE', displayOrder: 1,
            actions: [
              { name: 'Office Use Section', code: 'OFFICE_USE_SECTION' },
            ],
          },
        ],
      },
    ],
  },
];

const ZONE_NAMES = ['North', 'South', 'East', 'West'];

export async function bootstrapSeeder(dataSource: DataSource): Promise<void> {
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const authRepo = dataSource.getRepository(UserAuth);
  const userRoleRepo = dataSource.getRepository(UserRole);
  const actionRepo = dataSource.getRepository(Action);
  const moduleRepo = dataSource.getRepository(Module);
  const subModuleRepo = dataSource.getRepository(SubModule);
  const actionGroupRepo = dataSource.getRepository(ActionGroup);
  const moduleActionRepo = dataSource.getRepository(ModuleAction);
  const zoneRepo = dataSource.getRepository(Zone);

  // 1. Seed zones
  for (const name of ZONE_NAMES) {
    const existing = await zoneRepo.findOne({ where: { name } });
    if (!existing) {
      await zoneRepo.save(zoneRepo.create({ name, isActive: true }));
    }
  }

  // 2. Seed modules, sub-modules, action groups, and actions
  for (const m of MODULES_SEED) {
    let mod = await moduleRepo.findOne({ where: { name: m.name } });
    if (!mod) {
      mod = await moduleRepo.save(
        moduleRepo.create({
          name: m.name,
          code: m.code,
          isActive: true,
          isPermissionConfigurable: m.isPermissionConfigurable,
        }),
      );
    }

    for (const sm of m.subModules) {
      let sub = await subModuleRepo.findOne({
        where: { moduleId: mod.id, name: sm.name },
      });
      if (!sub) {
        sub = await subModuleRepo.save(
          subModuleRepo.create({
            moduleId: mod.id,
            name: sm.name,
            displayOrder: sm.displayOrder,
            isActive: true,
            isPermissionConfigurable: m.isPermissionConfigurable,
          }),
        );
      }

      for (const ag of sm.actionGroups) {
        let actionGroup = await actionGroupRepo.findOne({
          where: { subModuleId: sub.id, name: ag.name },
        });
        if (!actionGroup) {
          actionGroup = await actionGroupRepo.save(
            actionGroupRepo.create({
              subModuleId: sub.id,
              name: ag.name,
              code: ag.code,
              displayOrder: ag.displayOrder,
              isActive: true,
            }),
          );
        }

        for (const a of ag.actions) {
          let action = await actionRepo.findOne({
            where: { code: a.code },
          });
          if (!action) {
            action = await actionRepo.save(
              actionRepo.create({
                code: a.code,
                name: a.name,
                label: a.name,
                isActive: true,
              }),
            );
          }

          const existing = await moduleActionRepo.findOne({
            where: {
              moduleId: mod.id,
              subModuleId: sub.id,
              actionId: action.id,
            },
          });
          if (!existing) {
            await moduleActionRepo.save(
              moduleActionRepo.create({
                moduleId: mod.id,
                subModuleId: sub.id,
                actionId: action.id,
                isActive: true,
              }),
            );
          }
        }
      }
    }
  }

  // 3. Seed SUPER_ADMIN role
  const existingRole = await roleRepo.findOne({
    where: { name: 'SUPER_ADMIN' },
  });
  const superAdminRole =
    existingRole ||
    (await roleRepo.save(
      roleRepo.create({
        name: 'SUPER_ADMIN',
        hierarchyLevelRank: 1,
        isActive: true,
        isSystemRole: true,
      }),
    ));

  // 4. Seed system admin user from ENV or defaults
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@system.local';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456';

  let adminUser = await userRepo.findOne({ where: { email: adminEmail } });
  if (!adminUser) {
    const [lastUser] = await userRepo.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });
    const lastNum = lastUser
      ? parseInt(lastUser.empId.replace('PPL', ''), 10)
      : 0;
    const nextNum = lastNum + 1;
    const empId = `PPL${String(nextNum).padStart(5, '0')}`;
    adminUser = await userRepo.save(
      userRepo.create({
        empId,
        name: 'System Administrator',
        email: adminEmail,
        departmentId: null,
        employmentStatus: 'PERMANENT',
        isActive: true,
      }),
    );
  }

  // Ensure UserAuth record exists and reset if locked
  const passwordHash: string = await bcrypt.hash(adminPassword, SALT_ROUNDS);
  const existingAuth = await authRepo.findOne({
    where: { userId: adminUser.empId },
  });
  if (existingAuth) {
    if (existingAuth.isLocked || existingAuth.failedAttempts > 0) {
      existingAuth.passwordHash = passwordHash;
      existingAuth.failedAttempts = 0;
      existingAuth.isLocked = false;
      await authRepo.save(existingAuth);
    }
  } else {
    await authRepo.save(
      authRepo.create({
        userId: adminUser.empId,
        passwordHash,
        authProvider: 'LOCAL',
      }),
    );
  }

  // Ensure SUPER_ADMIN role assignment exists
  const existingAssignment = await userRoleRepo.findOne({
    where: { userId: adminUser.empId, roleId: superAdminRole.id },
  });
  if (!existingAssignment) {
    await userRoleRepo.save(
      userRoleRepo.create({
        userId: adminUser.empId,
        departmentId: null,
        roleId: superAdminRole.id,
        assignedBy: 'SYSTEM',
        assignedAt: new Date(),
      }),
    );
  }
}
