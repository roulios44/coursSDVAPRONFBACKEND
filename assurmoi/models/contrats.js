const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contrat extends Model {
    static associate(models) {
      this.belongsTo(models.Assure, { foreignKey: 'assure_id', as: 'assure' }); this.hasMany(models.Vehicule, { foreignKey: 'contrat_id', as: 'vehicules' }); this.hasMany(models.Sinistre, { foreignKey: 'contrat_id', as: 'sinistres' });
    }
  }

  Contrat.init(
    {
      assure_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      numero_contrat: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type_contrat: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      franchise: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true,
      },
      date_debut: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      date_fin: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      statut: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Contrat',
      tableName: 'Contrats',
    },
  );

  return Contrat;
};
