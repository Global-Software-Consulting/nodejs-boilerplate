const allRoles = {
  user: ['sendWhatsapp'],
  admin: ['getUsers', 'manageUsers', 'sendWhatsapp', 'manageWhatsapp'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
