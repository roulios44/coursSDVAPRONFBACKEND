"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Dossiers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sinistre_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      numero_dossier: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      charge_suivi_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      gestionnaire_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      scenario: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      statut: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date_ouverture: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      date_cloture: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("Dossiers");
  },
};
