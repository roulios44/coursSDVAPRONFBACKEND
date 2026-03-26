const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sinistre extends Model {
    static associate(models) {
      this.belongsTo(models.Contrat, { foreignKey: 'contrat_id', as: 'contrat' }); this.belongsTo(models.Vehicule, { foreignKey: 'vehicule_id', as: 'vehicule' }); this.belongsTo(models.User, { foreignKey: 'cree_par', as: 'createur' }); this.hasOne(models.Dossier, { foreignKey: 'sinistre_id', as: 'dossier' }); this.hasMany(models.Document, { foreignKey: 'sinistre_id', as: 'documents' }); this.hasMany(models.Historique, { foreignKey: 'sinistre_id', as: 'historiques' });
    }
  }

  Sinistre.init(
    {
      contrat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      vehicule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cree_par: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date_heure_appel: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      date_heure_sinistre: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      conducteur_nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      conducteur_prenom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      conducteur_est_assure: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      contexte: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      responsabilite_engagee: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      pourcentage_responsabilite: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      statut: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'brouillon',
      },
    },
    {
      sequelize,
      modelName: 'Sinistre',
      tableName: 'Sinistres',
    },
  );

  return Sinistre;
};
