const { Model } = require('sequelize');
const { ROLE_VALUES } = require('../constants/roles');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' }); this.hasOne(models.Assure, { foreignKey: 'utilisateur_id', as: 'assure' }); this.hasMany(models.Sinistre, { foreignKey: 'cree_par', as: 'sinistresCrees' }); this.hasMany(models.Dossier, { foreignKey: 'charge_suivi_id', as: 'dossiersSuivis' }); this.hasMany(models.Dossier, { foreignKey: 'gestionnaire_id', as: 'dossiersGeres' }); this.hasMany(models.TwoFactorCode, { foreignKey: 'user_id', as: 'codes2fa' }); this.hasMany(models.PasswordResetToken, { foreignKey: 'user_id', as: 'passwordResetTokens' }); this.hasMany(models.AuthToken, { foreignKey: 'user_id', as: 'authTokens' });
    }
  }

  User.init(
    {
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mot_de_passe: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      statut: {
        type: DataTypes.ENUM('actif', 'inactif'),
        allowNull: false,
        defaultValue: 'actif',
      },
      double_auth_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
    },
  );

  return User;
};
