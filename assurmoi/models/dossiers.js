const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Dossier extends Model {
    static associate(models) {
      this.belongsTo(models.Sinistre, { foreignKey: 'sinistre_id', as: 'sinistre' }); this.belongsTo(models.User, { foreignKey: 'charge_suivi_id', as: 'chargeSuivi' }); this.belongsTo(models.User, { foreignKey: 'gestionnaire_id', as: 'gestionnaire' }); this.hasMany(models.EtapeDossier, { foreignKey: 'dossier_id', as: 'etapes' }); this.hasMany(models.Document, { foreignKey: 'dossier_id', as: 'documents' }); this.hasMany(models.Notification, { foreignKey: 'dossier_id', as: 'notifications' }); this.hasMany(models.Historique, { foreignKey: 'dossier_id', as: 'historiques' });
    }
  }

  Dossier.init(
    {
      sinistre_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      numero_dossier: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      charge_suivi_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gestionnaire_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      scenario: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      statut: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date_ouverture: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      date_cloture: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Dossier',
      tableName: 'Dossiers',
    },
  );

  return Dossier;
};
