const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      this.belongsTo(models.Sinistre, { foreignKey: 'sinistre_id', as: 'sinistre' }); this.belongsTo(models.Dossier, { foreignKey: 'dossier_id', as: 'dossier' }); this.belongsTo(models.EtapeDossier, { foreignKey: 'etape_id', as: 'etape' }); this.belongsTo(models.User, { foreignKey: 'valide_par', as: 'validateur' });
    }
  }

  Document.init(
    {
      sinistre_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      dossier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      etape_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type_document: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nom_fichier: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      chemin_fichier: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date_depot: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      valide: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      valide_par: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Document',
      tableName: 'Documents',
    },
  );

  return Document;
};
