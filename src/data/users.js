// Demo user accounts for frontend-only authentication simulation.
// In the real application, this will be replaced by API calls.

export const DEMO_USERS = [
  {
    id: 'u1',
    name: 'Suresh Sharma',
    email: 'suresh@sharmaproperties.in',
    phone: '9876543210',
    role: 'owner',
    company: 'Sharma Properties',
  },
  {
    id: 'u2',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@gmail.com',
    phone: '9123456780',
    role: 'tenant',
    company: null,
  },
];

// Role-based home routes
export const ROLE_HOME = {
  owner: '/dashboard',
  manager: '/dashboard',
  tenant: '/tenant/dashboard',
};
