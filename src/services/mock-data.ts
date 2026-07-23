import type {
  Zone, City, Role, User, Brand, Phase, Module, Action, Project, AuditLog, SubModule,
  UserGroup, Department, Delegation, Notification, ChannelPartner,
  ApprovalConfig, ApprovalRequest, ChannelPartnerType, ProjectIncentiveRule, ProjectPaymentGateway,
} from 'src/types';

export const mockZones: Zone[] = [
  { id: '1', name: 'Mumbai Metro', code: 'MMR', status: 'active', createdBy: 'Rohit Palkar', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Bangalore Urban', code: 'BUR', status: 'active', createdBy: 'Priya Sharma', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
  { id: '3', name: 'Chennai Region', code: 'CHE', status: 'active', createdBy: 'Rohit Palkar', createdAt: '2024-02-01', updatedAt: '2024-02-01' },
];

export const mockBrands: Brand[] = [
  { id: '1', brandName: 'Puravankara', billingName: 'Puravankara Ltd', address1: '130/131, 2nd Floor, Raheja Center', address2: 'Plot No. C-30, Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', country: 'India', pinCode: '400051', panNumber: 'AAACP1234C', gstin: '27AAACP1234C1ZW', logoUrl: '', salaryMultiplier: 1, razorpayMerchantId: 'rzp_live_XXXXXXXX', razorpaySecretKey: 'sk_live_XXXXXXXX', easebuzzBookingSalt: 'salt1', easebuzzBookingKey: 'key1', easebuzzBookingSubMerchantId: 'sub1', easebuzzMilestoneSalt: 'salt2', easebuzzMilestoneKey: 'key2', easebuzzMilestoneSubMerchantId: 'sub2', reraRegularizationPercentage: 5, reraQualificationPercentage: 80, maximumRegularizationDays: 30, rtmRegularizationPercentage: 3, rtmQualificationPercentage: 90, regularizationStartDate: '2024-04-01', termsAndConditions: 'Standard T&C apply as per RERA guidelines.', status: 'active', createdBy: 'Rohit Palkar', createdAt: '2024-01-01', updatedAt: '2024-06-01' },
  { id: '2', brandName: 'Provident Housing', billingName: 'Provident Housing Ltd', address1: '12/3, Bannerghatta Road', city: 'Bangalore', state: 'Karnataka', country: 'India', pinCode: '560076', panNumber: 'BBBCP5678D', gstin: '29BBBCP5678D1ZX', salaryMultiplier: 0.9, reraRegularizationPercentage: 5, reraQualificationPercentage: 75, maximumRegularizationDays: 45, rtmRegularizationPercentage: 3, rtmQualificationPercentage: 85, status: 'active', createdBy: 'Priya Sharma', createdAt: '2024-02-01', updatedAt: '2024-05-15' },
];

export const mockPhases: Phase[] = [
  { id: '1', brandId: '1', brandName: 'Puravankara', cityId: '1', cityName: 'Mumbai', projectId: '1', projectName: 'Park Avenue Phase 3', phaseName: 'Phase 1', sfdcPhaseName: 'PA3-P1', sfdcBlockName: 'Tower A', possessionDate: '2026-12-31', agreementExecutionPercentage: 10, bookingGatewayId: 'sub1', milestoneGatewayId: 'sub2', launchEnabled: true, launchStartDate: '2024-06-01', launchEndDate: '2025-06-30', sustenanceEnabled: false, status: 'active', createdBy: 'Rohit Palkar', createdAt: '2024-01-15', updatedAt: '2024-06-01' },
  { id: '2', brandId: '1', brandName: 'Puravankara', cityId: '2', cityName: 'Navi Mumbai', projectId: '1', projectName: 'Park Avenue Phase 3', phaseName: 'Phase 2', sfdcPhaseName: 'PA3-P2', possessionDate: '2027-06-30', agreementExecutionPercentage: 25, launchEnabled: false, sustenanceEnabled: false, status: 'active', createdBy: 'Rohit Palkar', createdAt: '2024-03-01', updatedAt: '2024-06-01' },
  { id: '3', brandId: '2', brandName: 'Provident Housing', cityId: '3', cityName: 'Bangalore', projectId: '2', projectName: 'Bella Garden Residency', phaseName: 'Tower 1', sfdcPhaseName: 'BGR-T1', possessionDate: '2027-03-31', bookingGatewayId: 'sub1', milestoneGatewayId: 'sub2', launchEnabled: true, launchStartDate: '2024-08-01', launchEndDate: '2025-03-31', sustenanceEnabled: true, sustenanceDate: '2025-04-01', status: 'active', createdBy: 'Priya Sharma', createdAt: '2024-04-01', updatedAt: '2024-06-01' },
];

export const mockChannelPartnerTypes: ChannelPartnerType[] = [
  { id: '1', name: 'Reward Plus', description: 'Reward Plus partner category', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Advantage Club', description: 'Advantage Club partner category', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Regional AOP', description: 'Regional AOP partner category', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: 'Retail Partner', description: 'Retail Partner category', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const mockChannelPartners: ChannelPartner[] = [
  { id: '1', cpId: 'CP-000001', cpName: 'ABC Realty', cpTypeId: '1', cpTypeName: 'Reward Plus', startDate: '2024-01-01', endDate: '2025-12-31', status: 'active', createdBy: 'Rohit Palkar', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', cpId: 'CP-000002', cpName: 'XYZ Developers', cpTypeId: '2', cpTypeName: 'Advantage Club', startDate: '2024-03-01', status: 'active', createdBy: 'Priya Sharma', createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: '3', cpId: 'CP-000003', cpName: 'PQR Holdings', cpTypeId: '4', cpTypeName: 'Retail Partner', startDate: '2024-06-01', endDate: '2026-05-31', status: 'active', createdBy: 'Rohit Palkar', createdAt: '2024-06-01', updatedAt: '2024-06-01' },
];

export const mockCities: City[] = [
  { id: '1', name: 'Mumbai', code: 'MUM', zoneId: '1', zoneName: 'Mumbai Metro', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Navi Mumbai', code: 'NVM', zoneId: '1', zoneName: 'Mumbai Metro', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Bangalore', code: 'BLR', zoneId: '2', zoneName: 'Bangalore Urban', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: 'Chennai', code: 'CHN', zoneId: '3', zoneName: 'Chennai Region', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', name: 'Pune', code: 'PNE', zoneId: '', status: 'active', createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: '6', name: 'Hyderabad', code: 'HYD', zoneId: '', status: 'active', createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: '7', name: 'Kolkata', code: 'KOL', zoneId: '', status: 'active', createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: '8', name: 'Ahmedabad', code: 'AMD', zoneId: '', status: 'active', createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: '9', name: 'Jaipur', code: 'JPR', zoneId: '', status: 'active', createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: '10', name: 'Lucknow', code: 'LKO', zoneId: '', status: 'active', createdAt: '2024-03-01', updatedAt: '2024-03-01' },
];

export const mockDepartments: Department[] = [
  { id: '1', name: 'Sales & Marketing', code: 'S&M', maxHierarchyLevels: 7, createdBy: 'Sanjay K', status: 'active', createdAt: '2025-06-24', updatedAt: '2025-06-24' },
  { id: '2', name: 'Project Management', code: 'PM', maxHierarchyLevels: 5, createdBy: 'Rohit P', status: 'active', createdAt: '2025-06-24', updatedAt: '2025-06-24' },
  { id: '3', name: 'Finance & Accounts', code: 'F&A', maxHierarchyLevels: 7, createdBy: 'Anita S', status: 'active', createdAt: '2025-06-24', updatedAt: '2025-06-24' },
  { id: '4', name: 'Human Resources', code: 'HR', maxHierarchyLevels: 6, createdBy: 'Sanjay K', status: 'active', createdAt: '2025-06-24', updatedAt: '2025-06-24' },
];

export const mockRoles: Role[] = [
  { id: '1', name: 'Regional Executive', level: 'L2', departmentId: '1', departmentName: 'Sales & Marketing', createdBy: 'Rohit P', status: 'active', createdAt: '2025-07-09', updatedAt: '2025-07-09' },
  { id: '2', name: 'Project Lead', level: 'L3', departmentId: '2', departmentName: 'Project Management', createdBy: 'Anita S', status: 'active', createdAt: '2025-07-09', updatedAt: '2025-07-09' },
  { id: '3', name: 'Finance Executive', level: 'L4', departmentId: '3', departmentName: 'Finance & Accounts', createdBy: 'Sanjay K', status: 'active', createdAt: '2025-07-09', updatedAt: '2025-07-09' },
  { id: '4', name: 'HR Associate', level: 'L2', departmentId: '4', departmentName: 'Human Resources', createdBy: 'Rohit P', status: 'active', createdAt: '2025-07-09', updatedAt: '2025-07-09' },
];

export const mockModules: Module[] = [
  { id: '1', name: 'Dashboard', code: 'DASHBOARD', icon: 'solar:home-smile-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Geography', code: 'GEOGRAPHY', icon: 'solar:map-point-bold-duotone', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Organization', code: 'ORGANIZATION', icon: 'solar:buildings-bold-duotone', sortOrder: 3, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: 'Product Config', code: 'PRODUCT_CONFIG', icon: 'solar:widget-bold-duotone', sortOrder: 4, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', name: 'Projects', code: 'PROJECTS', icon: 'solar:folder-bold-duotone', sortOrder: 5, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '6', name: 'Users', code: 'USERS', icon: 'solar:users-group-rounded-bold-duotone', sortOrder: 6, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '7', name: 'Permissions', code: 'PERMISSIONS', icon: 'solar:shield-check-bold-duotone', sortOrder: 7, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const mockSubModules: SubModule[] = [
  { id: '1', name: 'Zones', code: 'ZONES', moduleId: '2', moduleName: 'Geography', icon: 'solar:map-point-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Cities', code: 'CITIES', moduleId: '2', moduleName: 'Geography', icon: 'solar:city-bold-duotone', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Departments', code: 'DEPARTMENTS', moduleId: '3', moduleName: 'Organization', icon: 'solar:buildings-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: 'Roles', code: 'ROLES', moduleId: '3', moduleName: 'Organization', icon: 'solar:user-id-bold-duotone', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', name: 'Modules', code: 'MODULES', moduleId: '4', moduleName: 'Product Config', icon: 'solar:widget-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '6', name: 'Sub Modules', code: 'SUB_MODULES', moduleId: '4', moduleName: 'Product Config', icon: 'solar:widget-5-bold-duotone', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '7', name: 'Actions', code: 'ACTIONS', moduleId: '4', moduleName: 'Product Config', icon: 'solar:flash-drive-bold-duotone', sortOrder: 3, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '8', name: 'Projects', code: 'PROJECTS', moduleId: '5', moduleName: 'Projects', icon: 'solar:folder-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '9', name: 'Users', code: 'USERS', moduleId: '6', moduleName: 'Users', icon: 'solar:users-group-rounded-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '10', name: 'Permissions', code: 'PERMISSIONS', moduleId: '7', moduleName: 'Permissions', icon: 'solar:shield-check-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const mockActions: Action[] = [
  { id: '1', name: 'Create', code: 'CREATE', subModuleId: '1', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Read', code: 'READ', subModuleId: '1', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Update', code: 'UPDATE', subModuleId: '1', sortOrder: 3, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: 'Delete', code: 'DELETE', subModuleId: '1', sortOrder: 4, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const mockProjects: Project[] = [
  {
    id: '1', name: 'Park Avenue Phase 3', code: 'PA3',
    brandId: '1', brandName: 'Puravankara', cityId: '1', cityName: 'Mumbai',
    billingName: 'Puravankara Ltd', panNumber: 'AAACP1234C', gstin: '27AAACP1234C1ZW',
    address1: '130/131, 2nd Floor, Raheja Center', pinCode: '400051',
    startDate: '2024-01-01', endDate: '2026-12-31', status: 'active',
    paymentGateways: [{ id: '1', gatewayType: 'easebuzz_booking', salt: 'salt1', key: 'key1', subMerchantId: 'sub1', isActive: true } as ProjectPaymentGateway],
    incentiveRules: [
      { id: '1', incentiveType: 'rera', regularizationPercentage: 5, payablePercentage: 80, maxDays: 30 } as ProjectIncentiveRule,
    ],
    createdAt: '2024-01-01', updatedAt: '2024-06-01',
  },
  {
    id: '2', name: 'Bella Garden Residency', code: 'BGR',
    brandId: '2', brandName: 'Provident Housing', cityId: '3', cityName: 'Bangalore',
    billingName: 'Provident Housing Ltd', panNumber: 'BBBCP5678D', gstin: '29BBBCP5678D1ZX',
    address1: '12/3, Bannerghatta Road', pinCode: '560076',
    startDate: '2024-03-01', endDate: '2027-06-30', status: 'active',
    incentiveRules: [
      { id: '2', incentiveType: 'rera', regularizationPercentage: 5, payablePercentage: 75, maxDays: 45 } as ProjectIncentiveRule,
      { id: '3', incentiveType: 'rtm', regularizationPercentage: 3, payablePercentage: 85 } as ProjectIncentiveRule,
    ],
    createdAt: '2024-02-01', updatedAt: '2024-05-15',
  },
  {
    id: '3', name: 'Greenfield Towers', code: 'GFT',
    brandId: '1', brandName: 'Puravankara', cityId: '2', cityName: 'Navi Mumbai',
    startDate: '2024-06-01', endDate: '2027-12-31', status: 'active',
    createdAt: '2024-06-01', updatedAt: '2024-06-01',
  },
];

export const mockUserGroups: UserGroup[] = [
  { id: '1', name: 'Operations', description: 'Operations team members', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Management', description: 'Management team members', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Executive', description: 'Executive team members', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: 'Admin', description: 'Administrative team members', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const mockUsers: User[] = [
  { id: '1', employeeId: 'EMP-001', firstName: 'Rohit', lastName: 'Palkar', name: 'Rohit Palkar', email: 'rohit@puravankara.com', phone: '+91-9876543210', departmentId: '1', departmentName: 'Sales & Marketing', roleId: '1', roleName: 'Regional Executive', level: 'L2', reportingManagerId: undefined, reportingManagerName: undefined, zoneIds: ['1', '2'], zoneNames: ['Mumbai Metro', 'Bangalore Urban'], createdBy: 'Admin', status: 'active', projects: [{ projectId: '1', projectName: 'Park Avenue Phase 3' }], createdAt: '2025-07-09', updatedAt: '2025-07-09' },
  { id: '2', employeeId: 'EMP-002', firstName: 'Priya', lastName: 'Sharma', name: 'Priya Sharma', email: 'priya@puravankara.com', phone: '+91-9876543211', departmentId: '2', departmentName: 'Project Management', roleId: '2', roleName: 'Project Lead', level: 'L3', reportingManagerId: '1', reportingManagerName: 'Rohit Palkar', zoneIds: ['1'], zoneNames: ['Mumbai Metro'], createdBy: 'Admin', status: 'active', projects: [{ projectId: '1', projectName: 'Park Avenue Phase 3' }, { projectId: '2', projectName: 'Bella Garden Residency' }], createdAt: '2025-07-09', updatedAt: '2025-07-09' },
  { id: '3', employeeId: 'EMP-003', firstName: 'Amit', lastName: 'Verma', name: 'Amit Verma', email: 'amit@puravankara.com', phone: '+91-9876543212', departmentId: '3', departmentName: 'Finance & Accounts', roleId: '3', roleName: 'Finance Executive', level: 'L4', reportingManagerId: '2', reportingManagerName: 'Priya Sharma', zoneIds: ['3'], zoneNames: ['Chennai Region'], createdBy: 'Admin', status: 'active', createdAt: '2025-07-09', updatedAt: '2025-07-09' },
  { id: '4', employeeId: 'EMP-004', firstName: 'Sneha', lastName: 'Patel', name: 'Sneha Patel', email: 'sneha@puravankara.com', phone: '+91-9876543213', departmentId: '4', departmentName: 'Human Resources', roleId: '4', roleName: 'HR Associate', level: 'L2', reportingManagerId: '1', reportingManagerName: 'Rohit Palkar', zoneIds: ['1', '2'], zoneNames: ['Mumbai Metro', 'Bangalore Urban'], createdBy: 'Admin', status: 'inactive', createdAt: '2025-07-09', updatedAt: '2025-07-09' },
];

export const mockApprovalConfigs: ApprovalConfig[] = [
  { id: '1', name: 'Purchase Order Approval', module: 'Procurement', description: 'All PO above ₹5L require approval', approverRoleId: '2', approverRoleName: 'Project Manager', stages: 2, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Leave Approval', module: 'HR', description: 'Leave requests > 3 days', approverRoleId: '4', approverRoleName: 'HR Manager', stages: 1, isActive: true, createdAt: '2024-01-15', updatedAt: '2024-03-01' },
  { id: '3', name: 'Budget Approval', module: 'Finance', description: 'Budget allocation changes', approverRoleId: '3', approverRoleName: 'Finance Manager', stages: 3, isActive: true, createdAt: '2024-02-01', updatedAt: '2024-02-01' },
  { id: '4', name: 'Vendor Onboarding', module: 'Procurement', description: 'New vendor registration', approverRoleId: '1', approverRoleName: 'Super Admin', stages: 2, isActive: false, createdAt: '2024-03-01', updatedAt: '2024-05-01' },
];

export const mockApprovalRequests: ApprovalRequest[] = [
  { id: '1', type: 'Purchase Order', referenceId: 'PO-2024-001', referenceLabel: 'Steel Supply - PO-2024-001', requestedBy: '2', requestedByName: 'Priya Sharma', approverId: '3', approverName: 'Amit Verma', status: 'pending', createdAt: '2024-06-10', updatedAt: '2024-06-10' },
  { id: '2', type: 'Leave', referenceId: 'LV-2024-042', referenceLabel: 'Annual Leave - Priya Sharma', requestedBy: '2', requestedByName: 'Priya Sharma', approverId: '4', approverName: 'Sneha Patel', status: 'approved', comments: 'Approved', createdAt: '2024-06-08', updatedAt: '2024-06-09' },
  { id: '3', type: 'Budget', referenceId: 'BG-2024-015', referenceLabel: 'Q3 Marketing Budget', requestedBy: '1', requestedByName: 'Rohit Palkar', approverId: '3', approverName: 'Amit Verma', status: 'rejected', comments: 'Exceeds quarterly limit', createdAt: '2024-06-05', updatedAt: '2024-06-07' },
  { id: '4', type: 'Purchase Order', referenceId: 'PO-2024-002', referenceLabel: 'Cement Supply - PO-2024-002', requestedBy: '2', requestedByName: 'Priya Sharma', approverId: '1', approverName: 'Rohit Palkar', status: 'pending', createdAt: '2024-06-12', updatedAt: '2024-06-12' },
  { id: '5', type: 'Vendor', referenceId: 'VN-2024-008', referenceLabel: 'New Vendor - ABC Corp', requestedBy: '1', requestedByName: 'Rohit Palkar', approverId: '2', approverName: 'Priya Sharma', status: 'pending', createdAt: '2024-06-11', updatedAt: '2024-06-11' },
];

export const mockDelegations: Delegation[] = [
  { id: '1', delegatorId: '3', delegatorName: 'Amit Verma', delegateId: '1', delegateName: 'Rohit Palkar', module: 'Finance', startDate: '2024-07-01', endDate: '2024-07-15', isActive: true, createdAt: '2024-06-01', updatedAt: '2024-06-01' },
  { id: '2', delegatorId: '4', delegatorName: 'Sneha Patel', delegateId: '1', delegateName: 'Rohit Palkar', module: 'HR', startDate: '2024-08-01', endDate: '2024-08-31', isActive: true, createdAt: '2024-06-05', updatedAt: '2024-06-05' },
  { id: '3', delegatorId: '2', delegatorName: 'Priya Sharma', delegateId: '3', delegateName: 'Amit Verma', module: 'Procurement', startDate: '2024-06-01', endDate: '2024-06-30', isActive: false, createdAt: '2024-05-20', updatedAt: '2024-06-01' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: '1', action: 'CREATE', entityType: 'User', entityId: '4', entityLabel: 'Sneha Patel', userId: '1', userName: 'Rohit Palkar', details: 'Created user account for Sneha Patel', ipAddress: '192.168.1.100', createdAt: '2024-03-01T10:30:00Z' },
  { id: '2', action: 'UPDATE', entityType: 'Role', entityId: '2', entityLabel: 'Project Manager', userId: '1', userName: 'Rohit Palkar', details: 'Updated Project Manager permissions', ipAddress: '192.168.1.100', createdAt: '2024-03-15T14:20:00Z' },
  { id: '3', action: 'DELETE', entityType: 'City', entityId: '5', entityLabel: 'Pune', userId: '2', userName: 'Priya Sharma', details: 'Deleted city: Pune', ipAddress: '192.168.1.101', createdAt: '2024-04-01T09:00:00Z' },
  { id: '4', action: 'LOGIN', entityType: 'Session', entityId: '1', entityLabel: 'User Login', userId: '1', userName: 'Rohit Palkar', details: 'User logged in from Chrome on macOS', ipAddress: '192.168.1.100', createdAt: '2024-06-12T08:15:00Z' },
  { id: '5', action: 'CREATE', entityType: 'Zone', entityId: '3', entityLabel: 'Chennai Region', userId: '1', userName: 'Rohit Palkar', details: 'Created zone: Chennai Region', ipAddress: '192.168.1.100', createdAt: '2024-05-01T11:00:00Z' },
  { id: '6', action: 'APPROVE', entityType: 'Approval', entityId: '2', entityLabel: 'Leave - LV-2024-042', userId: '4', userName: 'Sneha Patel', details: 'Approved leave request for Priya Sharma', ipAddress: '192.168.1.104', createdAt: '2024-06-09T16:45:00Z' },
  { id: '7', action: 'REJECT', entityType: 'Approval', entityId: '3', entityLabel: 'Budget - BG-2024-015', userId: '3', userName: 'Amit Verma', details: 'Rejected Q3 marketing budget request', ipAddress: '192.168.1.103', createdAt: '2024-06-07T10:30:00Z' },
  { id: '8', action: 'UPDATE', entityType: 'Project', entityId: '1', entityLabel: 'Park Avenue Phase 3', userId: '2', userName: 'Priya Sharma', details: 'Updated project end date', ipAddress: '192.168.1.101', createdAt: '2024-06-10T13:00:00Z' },
];

export const mockNotifications: Notification[] = [
  { id: '1', title: 'Approval Pending', message: 'Purchase Order PO-2024-001 requires your approval', type: 'info', isRead: false, userId: '3', createdAt: '2024-06-12T09:00:00Z' },
  { id: '2', title: 'Leave Approved', message: 'Your annual leave request has been approved', type: 'success', isRead: false, userId: '2', createdAt: '2024-06-09T16:45:00Z' },
  { id: '3', title: 'Budget Rejected', message: 'Q3 marketing budget request was rejected', type: 'error', isRead: true, userId: '1', createdAt: '2024-06-07T10:30:00Z' },
  { id: '4', title: 'Delegation Expiring', message: 'Your delegation to Amit Verma expires in 2 days', type: 'warning', isRead: false, userId: '3', createdAt: '2024-06-12T08:00:00Z' },
  { id: '5', title: 'New User Created', message: 'User account for Sneha Patel was created', type: 'info', isRead: true, userId: '1', createdAt: '2024-03-01T10:30:00Z' },
  { id: '6', title: 'System Update', message: 'Scheduled maintenance tonight at 2 AM', type: 'warning', isRead: false, userId: '1', createdAt: '2024-06-12T07:00:00Z' },
];
