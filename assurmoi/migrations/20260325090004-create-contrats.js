"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Contrats", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      assure_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      numero_contrat: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      type_contrat: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      franchise: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: true,
      },
      date_debut: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      date_fin: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      statut: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Contrats");
  },
};
