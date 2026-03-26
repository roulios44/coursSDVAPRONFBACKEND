const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Assure extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'utilisateur_id', as: 'utilisateur' }); this.hasMany(models.Contrat, { foreignKey: 'assure_id', as: 'contrats' }); this.hasMany(models.Notification, { foreignKey: 'assure_id', as: 'notifications' });
    }
  }

  Assure.init(
    {
      utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
        allowNull: true,
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      adresse: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type_assure: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Assure',
      tableName: 'Assures',
    },
  );

  return Assure;
};
