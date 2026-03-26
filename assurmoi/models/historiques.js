const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Historique extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'utilisateur_id', as: 'utilisateur' }); this.belongsTo(models.Sinistre, { foreignKey: 'sinistre_id', as: 'sinistre' }); this.belongsTo(models.Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
    }
  }

  Historique.init(
    {
      utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sinistre_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      dossier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date_action: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Historique',
      tableName: 'Historiques',
    },
  );

  return Historique;
};
