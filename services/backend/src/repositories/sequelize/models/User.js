const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
    },
  );

  /* eslint-disable no-param-reassign */
  User.beforeCreate(async (user) => {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 8);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 8);
    }
  });
  /* eslint-enable no-param-reassign */

  return User;
};
