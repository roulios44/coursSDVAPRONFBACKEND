const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vehicule extends Model {
    static associate(models) {
      this.belongsTo(models.Contrat, { foreignKey: 'contrat_id', as: 'contrat' }); this.hasMany(models.Sinistre, { foreignKey: 'vehicule_id', as: 'sinistres' });
    }
  }

  Vehicule.init(
    {
      contrat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      immatriculation: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      marque: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      modele: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      valeur_argus: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Vehicule',
      tableName: 'Vehicules',
    },
  );

  return Vehicule;
};
