"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Sinistres", {
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
      vehicule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cree_par: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date_heure_appel: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      date_heure_sinistre: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      conducteur_nom: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      conducteur_prenom: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      conducteur_est_assure: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      contexte: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      responsabilite_engagee: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      pourcentage_responsabilite: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      statut: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'brouillon',
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
    await queryInterface.dropTable("Sinistres");
  },
};
