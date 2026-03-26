const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'utilisateur_id', as: 'utilisateur' }); this.belongsTo(models.Assure, { foreignKey: 'assure_id', as: 'assure' }); this.belongsTo(models.Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
    }
  }

  Notification.init(
    {
      utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      assure_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      dossier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type_notification: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      date_envoi: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      statut: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'Notifications',
    },
  );

  return Notification;
};
