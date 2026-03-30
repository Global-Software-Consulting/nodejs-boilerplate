const allRoles = {
  user: ['manageOwnPayments'],
  admin: ['getUsers', 'manageUsers', 'manageOwnPayments', 'manageAllPayments'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
