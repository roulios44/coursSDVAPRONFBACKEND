"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EtapesDossier", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      dossier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      nom_etape: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      statut: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date_debut: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      date_fin: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      commentaire: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      validation_requise: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      validation_effectuee: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
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
    await queryInterface.dropTable("EtapesDossier");
  },
};
