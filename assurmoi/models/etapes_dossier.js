const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EtapeDossier extends Model {
    static associate(models) {
      this.belongsTo(models.Dossier, { foreignKey: 'dossier_id', as: 'dossier' }); this.hasMany(models.Document, { foreignKey: 'etape_id', as: 'documents' });
    }
  }

  EtapeDossier.init(
    {
      dossier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nom_etape: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      statut: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date_debut: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      date_fin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      commentaire: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      validation_requise: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      validation_effectuee: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'EtapeDossier',
      tableName: 'EtapesDossier',
    },
  );

  return EtapeDossier;
};
