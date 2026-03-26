"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Historiques", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sinistre_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dossier_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date_action: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      details: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("Historiques");
  },
};
