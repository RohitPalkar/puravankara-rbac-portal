export const _mock = {
  fullName: (index: number) => `User ${index}`,
  image: { avatar: (index: number) => '' },
  phoneNumber: (index: number) => '+1-123-456-7890',
  countryNames: (index: number) => 'USA',
};

export const _contacts = [
  {
    id: '1',
    role: 'Admin',
    name: 'Rohit Palkar',
    email: 'rohit@puravankara.com',
    status: 'online',
    address: 'Mumbai',
    avatarUrl: '',
    phoneNumber: '+91-9876543210',
    lastActivity: '2024-01-01T12:00:00Z',
  },
];

export const _notifications = [
  {
    id: 'n1',
    type: 'info',
    title: 'Welcome to Puravankara RBAC Portal',
    category: 'system',
    isUnRead: true,
    avatarUrl: null,
    createdAt: '2024-01-01T12:00:00Z',
  },
];
