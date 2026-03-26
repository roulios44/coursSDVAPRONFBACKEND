const { Model } = require('sequelize');
const { ROLE_VALUES } = require('../constants/roles');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      this.hasMany(models.User, { foreignKey: 'role_id', as: 'utilisateurs' });
    }
  }

  Role.init(
    {
      nom: {
        type: DataTypes.ENUM(...ROLE_VALUES),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'Roles',
    },
  );

  return Role;
};
