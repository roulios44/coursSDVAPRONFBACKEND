"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Vehicules", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      contrat_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      immatriculation: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      marque: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      modele: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      valeur_argus: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Vehicules");
  },
};
