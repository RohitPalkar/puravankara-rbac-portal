import type {
  Zone, City, Role, User, Module, Action, Project, AuditLog, SubModule,
  Department, Delegation, Notification, ApprovalConfig, ApprovalRequest,
  MockUserProfile, PermissionMapping, PermissionResponse, Brand,
} from 'src/types';

const EMPLOYEE_DIRECTORY: { employeeId: string; name: string; email: string; mobile: string }[] = [
  { employeeId: 'EMP-001', name: 'Rohit Palkar', email: 'rohit@puravankara.com', mobile: '+91-9876543210' },
  { employeeId: 'EMP-002', name: 'Priya Sharma', email: 'priya@puravankara.com', mobile: '+91-9876543211' },
  { employeeId: 'EMP-003', name: 'Amit Verma', email: 'amit@puravankara.com', mobile: '+91-9876543212' },
  { employeeId: 'EMP-004', name: 'Sneha Patel', email: 'sneha@puravankara.com', mobile: '+91-9876543213' },
  { employeeId: 'EMP-005', name: 'Vikas Gupta', email: 'vikas@puravankara.com', mobile: '+91-9876543214' },
  { employeeId: 'EMP-006', name: 'Anita Desai', email: 'anita@puravankara.com', mobile: '+91-9876543215' },
  { employeeId: 'EMP-007', name: 'Rajesh Kumar', email: 'rajesh@puravankara.com', mobile: '+91-9876543216' },
  { employeeId: 'EMP-008', name: 'Meera Nair', email: 'meera@puravankara.com', mobile: '+91-9876543217' },
];

export const mockZones: Zone[] = [
  { id: '1', name: 'Mumbai Metro', salaryCap: 5000000, status: 'active', createdBy: 'Rohit Palkar', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Bangalore Urban', salaryCap: 6000000, status: 'active', createdBy: 'Priya Sharma', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
  { id: '3', name: 'Chennai Region', salaryCap: 4500000, status: 'active', createdBy: 'Rohit Palkar', createdAt: '2024-02-01', updatedAt: '2024-02-01' },
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
  { id: '1', name: 'Sales & Marketing', maxHierarchyLevels: 7, createdBy: 'Sanjay K', status: 'active', createdAt: '2025-06-24', updatedAt: '2025-06-24' },
  { id: '2', name: 'Project Management', maxHierarchyLevels: 5, createdBy: 'Rohit P', status: 'active', createdAt: '2025-06-24', updatedAt: '2025-06-24' },
  { id: '3', name: 'Finance & Accounts', maxHierarchyLevels: 7, createdBy: 'Anita S', status: 'active', createdAt: '2025-06-24', updatedAt: '2025-06-24' },
  { id: '4', name: 'Human Resources', maxHierarchyLevels: 6, createdBy: 'Sanjay K', status: 'active', createdAt: '2025-06-24', updatedAt: '2025-06-24' },
];

export const mockRoles: Role[] = [
  { id: '1', name: 'Regional Executive', code: 'REX', description: 'Manages regional sales operations', level: 'L2', departmentId: '1', departmentName: 'Sales & Marketing', createdBy: 'Rohit P', status: 'active', createdAt: '2025-07-09', updatedAt: '2025-07-09' },
  { id: '2', name: 'Project Lead', code: 'PLD', description: 'Leads project delivery teams', level: 'L3', departmentId: '2', departmentName: 'Project Management', createdBy: 'Anita S', status: 'active', createdAt: '2025-07-09', updatedAt: '2025-07-09' },
  { id: '3', name: 'Finance Executive', code: 'FEX', description: 'Handles financial reporting and analysis', level: 'L4', departmentId: '3', departmentName: 'Finance & Accounts', createdBy: 'Sanjay K', status: 'active', createdAt: '2025-07-09', updatedAt: '2025-07-09' },
  { id: '4', name: 'HR Associate', code: 'HRA', description: 'Supports recruitment and employee engagement', level: 'L2', departmentId: '4', departmentName: 'Human Resources', createdBy: 'Rohit P', status: 'active', createdAt: '2025-07-09', updatedAt: '2025-07-09' },
];

export const mockBrands: Brand[] = [
  {
    id: '1', brandName: 'Puravankara', salaryMultiplier: 1.0,
    razorpayMerchantId: 'rzp_pura', razorpaySecretKey: 'sk_pura',
    easebuzzBookingSalt: 'sal_booking', easebuzzBookingKey: 'key_booking', easebuzzBookingSubMerchantId: 'sub_booking',
    easebuzzMilestoneSalt: 'sal_milestone', easebuzzMilestoneKey: 'key_milestone', easebuzzMilestoneSubMerchantId: 'sub_milestone',
    billingName: 'Puravankara Projects Ltd', panNumber: 'AAACP1234H', gstin: '29AAACP1234H1Z5',
    address1: '24, Richmond Road', address2: 'Bangalore - 560025', pinCode: '560025',
    logoUrl: '', reraRegularizationPercentage: 85, reraQualificationPercentage: 90, maximumRegularizationDays: 60,
    rtmRegularizationPercentage: 80, rtmQualificationPercentage: 85, regularizationStartDate: '2024-01-01',
    termsAndConditions: '<p>Standard T&C for Puravankara brand.</p>',
    status: 'active', createdBy: 'Rohit Palkar', createdAt: '2024-01-01', updatedAt: '2024-06-01',
  },
  {
    id: '2', brandName: 'Provident', salaryMultiplier: 0.8,
    razorpayMerchantId: 'rzp_prov', razorpaySecretKey: 'sk_prov',
    easebuzzBookingSalt: 'sal_prov_booking', easebuzzBookingKey: 'key_prov_booking', easebuzzBookingSubMerchantId: 'sub_prov_booking',
    easebuzzMilestoneSalt: 'sal_prov_milestone', easebuzzMilestoneKey: 'key_prov_milestone', easebuzzMilestoneSubMerchantId: 'sub_prov_milestone',
    billingName: 'Provident Housing Ltd', panNumber: 'AABCP5678K', gstin: '29AABCP5678K1Z2',
    address1: '45, Electronic City', address2: 'Bangalore - 560100', pinCode: '560100',
    logoUrl: '', reraRegularizationPercentage: 75, reraQualificationPercentage: 80, maximumRegularizationDays: 45,
    rtmRegularizationPercentage: 70, rtmQualificationPercentage: 75, regularizationStartDate: '2024-03-01',
    termsAndConditions: '<p>Standard T&C for Provident brand.</p>',
    status: 'active', createdBy: 'Priya Sharma', createdAt: '2024-03-01', updatedAt: '2024-06-15',
  },
];

export const mockModules: Module[] = [
  { id: '1', name: 'Dashboard', code: 'DASHBOARD', icon: 'solar:home-smile-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Geography', code: 'GEOGRAPHY', icon: 'solar:map-point-bold-duotone', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Organization', code: 'ORGANIZATION', icon: 'solar:buildings-bold-duotone', sortOrder: 3, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: 'Product Config', code: 'PRODUCT_CONFIG', icon: 'solar:widget-bold-duotone', sortOrder: 4, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', name: 'Projects', code: 'PROJECTS', icon: 'solar:folder-bold-duotone', sortOrder: 5, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '6', name: 'Users', code: 'USERS', icon: 'solar:users-group-rounded-bold-duotone', sortOrder: 6, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '7', name: 'Permissions', code: 'PERMISSIONS', icon: 'solar:shield-check-bold-duotone', sortOrder: 7, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '8', name: 'CRM', code: 'CRM', icon: 'solar:user-speak-bold-duotone', sortOrder: 8, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '9', name: 'EOI', code: 'EOI', icon: 'solar:document-text-bold-duotone', sortOrder: 9, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '10', name: 'IOM', code: 'IOM', icon: 'solar:file-check-bold-duotone', sortOrder: 10, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '11', name: 'Inventory', code: 'INVENTORY', icon: 'solar:box-bold-duotone', sortOrder: 11, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '12', name: 'Finance', code: 'FINANCE', icon: 'solar:wallet-bold-duotone', sortOrder: 12, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '13', name: 'Reports', code: 'REPORTS', icon: 'solar:chart-square-bold-duotone', sortOrder: 13, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '14', name: 'Bookings', code: 'BOOKINGS', icon: 'solar:ticket-bold-duotone', sortOrder: 14, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '15', name: 'Loyalty', code: 'LOYALTY', icon: 'solar:star-bold-duotone', sortOrder: 15, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
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
  { id: '11', name: 'Generate IOM', code: 'GEN_IOM', moduleId: '10', moduleName: 'IOM', icon: 'solar:file-add-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '12', name: 'IOM Reports', code: 'IOM_REPORTS', moduleId: '10', moduleName: 'IOM', icon: 'solar:chart-square-bold-duotone', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '13', name: 'Settings', code: 'IOM_SETTINGS', moduleId: '10', moduleName: 'IOM', icon: 'solar:settings-bold-duotone', sortOrder: 3, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '14', name: 'CRM Leads', code: 'CRM_LEADS', moduleId: '8', moduleName: 'CRM', icon: 'solar:user-speak-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '15', name: 'CRM Reports', code: 'CRM_REPORTS', moduleId: '8', moduleName: 'CRM', icon: 'solar:chart-square-bold-duotone', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '16', name: 'EOI Applications', code: 'EOI_APPS', moduleId: '9', moduleName: 'EOI', icon: 'solar:document-text-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '17', name: 'EOI Reports', code: 'EOI_REPORTS', moduleId: '9', moduleName: 'EOI', icon: 'solar:chart-square-bold-duotone', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '18', name: 'Inventory Units', code: 'INV_UNITS', moduleId: '11', moduleName: 'Inventory', icon: 'solar:box-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '19', name: 'Inventory Reports', code: 'INV_REPORTS', moduleId: '11', moduleName: 'Inventory', icon: 'solar:chart-square-bold-duotone', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '20', name: 'Finance Ledger', code: 'FIN_LEDGER', moduleId: '12', moduleName: 'Finance', icon: 'solar:wallet-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '21', name: 'Finance Reports', code: 'FIN_REPORTS', moduleId: '12', moduleName: 'Finance', icon: 'solar:chart-square-bold-duotone', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '22', name: 'Reports Dashboard', code: 'RPT_DASHBOARD', moduleId: '13', moduleName: 'Reports', icon: 'solar:chart-square-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '23', name: 'Bookings Management', code: 'BKG_MGMT', moduleId: '14', moduleName: 'Bookings', icon: 'solar:ticket-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '24', name: 'Rewards', code: 'LOY_REWARDS', moduleId: '15', moduleName: 'Loyalty', icon: 'solar:star-bold-duotone', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '25', name: 'Tiers', code: 'LOY_TIERS', moduleId: '15', moduleName: 'Loyalty', icon: 'solar:layers-bold-duotone', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const mockActions: Action[] = [
  { id: '1', name: 'Create', code: 'CREATE', subModuleId: '1', sortOrder: 1, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Read', code: 'READ', subModuleId: '1', sortOrder: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Update', code: 'UPDATE', subModuleId: '1', sortOrder: 3, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: 'Delete', code: 'DELETE', subModuleId: '1', sortOrder: 4, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', name: 'Approve', code: 'APPROVE', subModuleId: '1', sortOrder: 5, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '6', name: 'Reject', code: 'REJECT', subModuleId: '1', sortOrder: 6, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '7', name: 'Export', code: 'EXPORT', subModuleId: '1', sortOrder: 7, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const mockProjects: Project[] = [
  { id: '1', name: 'Park Avenue Phase 3', code: 'PA3', brand: 'Puravankara', zoneId: '2', zoneName: 'Bangalore Urban', cityId: '3', cityName: 'Bangalore', phase: 'Phase 3', billingEntity: 'Puravankara Projects Ltd', billingAddress: '24, Richmond Road, Bangalore - 560025', gstin: '29AAACP1234H1Z5', paymentGateway: 'Razorpay', incentiveCriteria: 'Sales target > 80%', projectImage: '/images/projects/pa3.png', jvImage: '/images/projects/pa3-jv.png', startDate: '2024-01-01', endDate: '2026-12-31', status: 'active', createdBy: 'Rohit Palkar', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Bella Garden Residency', code: 'BGR', brand: 'Provident', zoneId: '2', zoneName: 'Bangalore Urban', cityId: '3', cityName: 'Bangalore', phase: 'Phase 1', billingEntity: 'Provident Housing Ltd', billingAddress: '45, Electronic City, Bangalore - 560100', gstin: '29AABCP5678K1Z2', paymentGateway: 'PhonePe', incentiveCriteria: 'Collection > 90%', projectImage: '/images/projects/bgr.png', jvImage: '/images/projects/bgr-jv.png', startDate: '2024-03-01', endDate: '2027-06-30', status: 'active', createdBy: 'Priya Sharma', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Greenfield Towers', code: 'GFT', brand: 'Puravankara', zoneId: '3', zoneName: 'Chennai Region', cityId: '4', cityName: 'Chennai', phase: 'Phase 2', billingEntity: 'Puravankara Projects Ltd', billingAddress: '12, OMR, Chennai - 600089', gstin: '33AAACP1234H1Z7', paymentGateway: 'BillDesk', incentiveCriteria: 'Customer satisfaction > 4.5', projectImage: '/images/projects/gft.png', jvImage: '/images/projects/gft-jv.png', startDate: '2024-06-01', endDate: '2027-12-31', status: 'active', createdBy: 'Rohit Palkar', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const mockUsers: User[] = [
  { id: '1', employeeId: 'EMP-001', firstName: 'Rohit', lastName: 'Palkar', name: 'Rohit Palkar', email: 'rohit@puravankara.com', phone: '+91-9876543210', departmentId: '1', departmentName: 'Sales & Marketing', roleId: '1', roleName: 'Regional Executive', level: 'L2', employmentStatus: 'permanent', userGroup: 'management', startDate: '01/01/2024', reportingManagerId: undefined, reportingManagerName: undefined, zoneIds: ['1', '2'], zoneNames: ['Mumbai Metro', 'Bangalore Urban'], createdBy: 'Admin', status: 'active', projects: [{ projectId: '1', projectName: 'Park Avenue Phase 3' }], createdAt: '2025-07-09', updatedAt: '2025-07-09' },
  { id: '2', employeeId: 'EMP-002', firstName: 'Priya', lastName: 'Sharma', name: 'Priya Sharma', email: 'priya@puravankara.com', phone: '+91-9876543211', departmentId: '2', departmentName: 'Project Management', roleId: '2', roleName: 'Project Lead', level: 'L3', employmentStatus: 'permanent', userGroup: 'management', startDate: '15/01/2024', reportingManagerId: '1', reportingManagerName: 'Rohit Palkar', zoneIds: ['1'], zoneNames: ['Mumbai Metro'], createdBy: 'Admin', status: 'active', projects: [{ projectId: '1', projectName: 'Park Avenue Phase 3' }, { projectId: '2', projectName: 'Bella Garden Residency' }], createdAt: '2025-07-09', updatedAt: '2025-07-09' },
  { id: '3', employeeId: 'EMP-003', firstName: 'Amit', lastName: 'Verma', name: 'Amit Verma', email: 'amit@puravankara.com', phone: '+91-9876543212', departmentId: '3', departmentName: 'Finance & Accounts', roleId: '3', roleName: 'Finance Executive', level: 'L4', employmentStatus: 'contract', userGroup: 'executive', startDate: '01/03/2024', reportingManagerId: '2', reportingManagerName: 'Priya Sharma', zoneIds: ['3'], zoneNames: ['Chennai Region'], createdBy: 'Admin', status: 'active', createdAt: '2025-07-09', updatedAt: '2025-07-09' },
  { id: '4', employeeId: 'EMP-004', firstName: 'Sneha', lastName: 'Patel', name: 'Sneha Patel', email: 'sneha@puravankara.com', phone: '+91-9876543213', departmentId: '4', departmentName: 'Human Resources', roleId: '4', roleName: 'HR Associate', level: 'L2', employmentStatus: 'contract', userGroup: 'operations', startDate: '01/06/2024', reportingManagerId: '1', reportingManagerName: 'Rohit Palkar', zoneIds: ['1', '2'], zoneNames: ['Mumbai Metro', 'Bangalore Urban'], createdBy: 'Admin', status: 'inactive', createdAt: '2025-07-09', updatedAt: '2025-07-09' },
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

// Project-to-Zone mapping (which projects belong to which zones)
export const mockProjectZones: Record<string, string[]> = {
  '1': ['1', '2'],  // Park Avenue → Mumbai Metro, Bangalore Urban
  '2': ['2'],       // Bella Garden → Bangalore Urban
  '3': ['3'],       // Greenfield → Chennai Region
};

export const mockPermissionMappings: PermissionMapping[] = [
  {
    id: '1',
    departmentId: '1',
    departmentName: 'Sales & Marketing',
    level: 'L2',
    roleId: '1',
    roleName: 'Regional Executive',
    modules: [
      {
        moduleId: '8', moduleName: 'IOM', moduleIcon: 'solar:file-check-bold-duotone',
        subModules: [
          { subModuleId: 'sm-iom-1', subModuleName: 'Generate IOM', actionIds: ['1', '2', '3', '5', '7'], actionNames: ['View', 'Create', 'Edit', 'Approve', 'Export'] },
          { subModuleId: 'sm-iom-2', subModuleName: 'IOM Reports', actionIds: ['2', '7'], actionNames: ['View', 'Export'] },
          { subModuleId: 'sm-iom-3', subModuleName: 'Settings', actionIds: ['2', '3'], actionNames: ['View', 'Edit'] },
        ],
      },
      {
        moduleId: 'm-loyalty', moduleName: 'Loyalty', moduleIcon: 'solar:star-bold-duotone',
        subModules: [
          { subModuleId: 'sm-loy-1', subModuleName: 'Rewards', actionIds: ['2', '5', '7'], actionNames: ['View', 'Create', 'Export'] },
          { subModuleId: 'sm-loy-2', subModuleName: 'Tiers', actionIds: ['2'], actionNames: ['View'] },
        ],
      },
    ],
    createdBy: 'Rohit Palkar',
    createdAt: '2025-07-09',
    updatedAt: '2025-07-09',
    status: 'active',
  },
  {
    id: '2',
    departmentId: '2',
    departmentName: 'Project Management',
    level: 'L3',
    roleId: '2',
    roleName: 'Project Lead',
    modules: [
      {
        moduleId: '6', moduleName: 'IOM', moduleIcon: 'solar:file-check-bold-duotone',
        subModules: [
          { subModuleId: 'sm-iom-1', subModuleName: 'Generate IOM', actionIds: ['2', '3', '5', '6', '7'], actionNames: ['View', 'Edit', 'Approve', 'Reject', 'Export'] },
        ],
      },
    ],
    createdBy: 'Priya Sharma',
    createdAt: '2025-07-10',
    updatedAt: '2025-07-10',
    status: 'active',
  },
];

// Permission mapping module-to-project demo data for access config
export const mockPermissionModuleProjects: Record<string, string[]> = {
  '8': ['1', '2', '3'],
  '9': ['1', '2'],
  '10': ['1', '3'],
  '11': ['2', '3'],
  '12': ['1'],
  '13': ['1', '2', '3'],
  '14': ['2'],
  '15': ['1', '3'],
};

// RBAC Mock Permission Response (simulates backend API response)
export const mockPermissionResponse: Record<string, PermissionResponse> = {
  'super-admin': {
    user: { id: 'PPL000', name: 'Super Admin', email: 'admin@puravankara.com', role: 'super-admin' },
    permissions: {
      modules: [
        { code: 'DASHBOARD', name: 'Dashboard', route: '/dashboard', allowed: true, actions: ['VIEW', 'EXPORT'] },
        { code: 'BRAND', name: 'Brand', route: '/dashboard/brand-master', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
        { code: 'ZONE_MGMT', name: 'Zone Management', route: '/dashboard/zone-master', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
        { code: 'DEPARTMENTS', name: 'Departments', route: '/dashboard/department-master', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
        { code: 'ROLES', name: 'Roles', route: '/dashboard/role-master', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
        { code: 'PROJECTS', name: 'Projects', route: '/dashboard/project-master', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
        { code: 'PERMISSION_MATRIX', name: 'Permission Mapping', route: '/dashboard/permission-mapping', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
        { code: 'USERS', name: 'Users', route: '/dashboard/user-management', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'RESET_PASSWORD'] },
        { code: 'ACTIVITY_LOGS', name: 'Activity Logs', route: '/dashboard/audit-logs', allowed: true, actions: ['VIEW', 'EXPORT'] },
        { code: 'CRM', name: 'CRM', route: '/apps/crm', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'] },
        { code: 'EOI', name: 'EOI', route: '/apps/eoi', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'] },
        { code: 'IOM', name: 'IOM', route: '/apps/iom', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT'] },
        { code: 'BOOKINGS', name: 'Bookings', route: '/apps/bookings', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'] },
        { code: 'INVENTORY', name: 'Inventory', route: '/apps/inventory', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'] },
        { code: 'FINANCE', name: 'Finance', route: '/apps/finance', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT'] },
        { code: 'REPORTS', name: 'Reports', route: '/apps/reports', allowed: true, actions: ['VIEW', 'EXPORT', 'SCHEDULE'] },
        { code: 'DOCUMENTS', name: 'Documents', route: '/apps/documents', allowed: true, actions: ['VIEW', 'UPLOAD', 'EDIT', 'DELETE'] },
        { code: 'ESIGNATURE', name: 'eSignature', route: '/apps/esignature', allowed: true, actions: ['VIEW', 'SEND', 'SIGN', 'REVOKE'] },
      ],
    },
  },
  'sales-executive': {
    user: { id: 'PPL001', name: 'Sales Executive', email: 'sales@puravankara.com', role: 'sales-executive', departmentId: '1', level: 'L2' },
    permissions: {
      modules: [
        { code: 'DASHBOARD', name: 'Dashboard', route: '/dashboard', allowed: true, actions: ['VIEW'] },
        { code: 'ZONE_MGMT', name: 'Zone Management', route: '/dashboard/zone-master', allowed: false },
        { code: 'DEPARTMENTS', name: 'Departments', route: '/dashboard/department-master', allowed: false },
        { code: 'ROLES', name: 'Roles', route: '/dashboard/role-master', allowed: false },
        { code: 'PROJECTS', name: 'Projects', route: '/dashboard/project-master', allowed: true, actions: ['VIEW'] },
        { code: 'PERMISSION_MATRIX', name: 'Permission Mapping', route: '/dashboard/permission-mapping', allowed: false },
        { code: 'USERS', name: 'Users', route: '/dashboard/user-management', allowed: false },
        { code: 'ACTIVITY_LOGS', name: 'Activity Logs', route: '/dashboard/audit-logs', allowed: false },
        { code: 'CRM', name: 'CRM', route: '/apps/crm', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT'] },
        { code: 'EOI', name: 'EOI', route: '/apps/eoi', allowed: true, actions: ['VIEW', 'CREATE'] },
        { code: 'IOM', name: 'IOM', route: '/apps/iom', allowed: false },
        { code: 'BOOKINGS', name: 'Bookings', route: '/apps/bookings', allowed: true, actions: ['VIEW'] },
        { code: 'INVENTORY', name: 'Inventory', route: '/apps/inventory', allowed: false },
        { code: 'FINANCE', name: 'Finance', route: '/apps/finance', allowed: false },
        { code: 'REPORTS', name: 'Reports', route: '/apps/reports', allowed: true, actions: ['VIEW'] },
        { code: 'DOCUMENTS', name: 'Documents', route: '/apps/documents', allowed: false },
        { code: 'ESIGNATURE', name: 'eSignature', route: '/apps/esignature', allowed: false },
      ],
    },
  },
  'sales-team-lead': {
    user: { id: 'PPL001', name: 'Sales Executive', email: 'sales@puravankara.com', role: 'sales-team-lead', departmentId: '1', level: 'L3' },
    permissions: {
      modules: [
        { code: 'DASHBOARD', name: 'Dashboard', route: '/dashboard', allowed: true, actions: ['VIEW', 'EXPORT'] },
        { code: 'ZONE_MGMT', name: 'Zone Management', route: '/dashboard/zone-master', allowed: false },
        { code: 'DEPARTMENTS', name: 'Departments', route: '/dashboard/department-master', allowed: false },
        { code: 'ROLES', name: 'Roles', route: '/dashboard/role-master', allowed: false },
        { code: 'PROJECTS', name: 'Projects', route: '/dashboard/project-master', allowed: true, actions: ['VIEW'] },
        { code: 'PERMISSION_MATRIX', name: 'Permission Mapping', route: '/dashboard/permission-mapping', allowed: false },
        { code: 'USERS', name: 'Users', route: '/dashboard/user-management', allowed: false },
        { code: 'ACTIVITY_LOGS', name: 'Activity Logs', route: '/dashboard/audit-logs', allowed: false },
        { code: 'CRM', name: 'CRM', route: '/apps/crm', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'] },
        { code: 'EOI', name: 'EOI', route: '/apps/eoi', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'EXPORT'] },
        { code: 'IOM', name: 'IOM', route: '/apps/iom', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'APPROVE'] },
        { code: 'BOOKINGS', name: 'Bookings', route: '/apps/bookings', allowed: true, actions: ['VIEW', 'CREATE'] },
        { code: 'INVENTORY', name: 'Inventory', route: '/apps/inventory', allowed: false },
        { code: 'FINANCE', name: 'Finance', route: '/apps/finance', allowed: false },
        { code: 'REPORTS', name: 'Reports', route: '/apps/reports', allowed: true, actions: ['VIEW', 'EXPORT'] },
        { code: 'DOCUMENTS', name: 'Documents', route: '/apps/documents', allowed: false },
        { code: 'ESIGNATURE', name: 'eSignature', route: '/apps/esignature', allowed: false },
      ],
    },
  },
  'finance-executive': {
    user: { id: 'PPL002', name: 'Finance User', email: 'finance@puravankara.com', role: 'finance-executive', departmentId: '3', level: 'L4' },
    permissions: {
      modules: [
        { code: 'DASHBOARD', name: 'Dashboard', route: '/dashboard', allowed: true, actions: ['VIEW'] },
        { code: 'ZONE_MGMT', name: 'Zone Management', route: '/dashboard/zone-master', allowed: false },
        { code: 'DEPARTMENTS', name: 'Departments', route: '/dashboard/department-master', allowed: false },
        { code: 'ROLES', name: 'Roles', route: '/dashboard/role-master', allowed: false },
        { code: 'PROJECTS', name: 'Projects', route: '/dashboard/project-master', allowed: true, actions: ['VIEW'] },
        { code: 'PERMISSION_MATRIX', name: 'Permission Mapping', route: '/dashboard/permission-mapping', allowed: false },
        { code: 'USERS', name: 'Users', route: '/dashboard/user-management', allowed: false },
        { code: 'ACTIVITY_LOGS', name: 'Activity Logs', route: '/dashboard/audit-logs', allowed: true, actions: ['VIEW'] },
        { code: 'CRM', name: 'CRM', route: '/apps/crm', allowed: false },
        { code: 'EOI', name: 'EOI', route: '/apps/eoi', allowed: false },
        { code: 'IOM', name: 'IOM', route: '/apps/iom', allowed: false },
        { code: 'BOOKINGS', name: 'Bookings', route: '/apps/bookings', allowed: true, actions: ['VIEW'] },
        { code: 'INVENTORY', name: 'Inventory', route: '/apps/inventory', allowed: true, actions: ['VIEW'] },
        { code: 'FINANCE', name: 'Finance', route: '/apps/finance', allowed: true, actions: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'REJECT', 'EXPORT'] },
        { code: 'REPORTS', name: 'Reports', route: '/apps/reports', allowed: true, actions: ['VIEW', 'EXPORT', 'SCHEDULE'] },
        { code: 'DOCUMENTS', name: 'Documents', route: '/apps/documents', allowed: true, actions: ['VIEW', 'UPLOAD'] },
        { code: 'ESIGNATURE', name: 'eSignature', route: '/apps/esignature', allowed: true, actions: ['VIEW', 'SEND', 'SIGN'] },
      ],
    },
  },
};

export const MOCK_USER_PROFILES: Record<string, MockUserProfile> = {
  'super-admin': {
    user: { id: 'usr-sa', employeeId: 'EMP-000', name: 'Super Admin', email: 'admin@puravankara.com', departmentId: '1', departmentName: 'Sales & Marketing' },
    roles: [
      { roleId: 'super-admin', roleName: 'Super Admin', isPrimary: true },
    ],
    permissionResponses: {
      'super-admin': mockPermissionResponse['super-admin'],
    },
  },
  'sales-executive': {
    user: { id: 'usr-se', employeeId: 'EMP-001', name: 'Rohit Palkar', email: 'sales@puravankara.com', departmentId: '1', departmentName: 'Sales & Marketing' },
    roles: [
      { roleId: 'sales-executive', roleName: 'Sales Executive', isPrimary: true },
      { roleId: 'sales-team-lead', roleName: 'Sales Team Lead', isPrimary: false },
    ],
    permissionResponses: {
      'sales-executive': mockPermissionResponse['sales-executive'],
      'sales-team-lead': mockPermissionResponse['sales-team-lead'],
    },
  },
  'finance-user': {
    user: { id: 'usr-fn', employeeId: 'EMP-003', name: 'Amit Verma', email: 'finance@puravankara.com', departmentId: '3', departmentName: 'Finance & Accounts' },
    roles: [
      { roleId: 'finance-executive', roleName: 'Finance Executive', isPrimary: true },
    ],
    permissionResponses: {
      'finance-executive': mockPermissionResponse['finance-executive'],
    },
  },
};
