"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Documents", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sinistre_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dossier_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      etape_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      type_document: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nom_fichier: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      chemin_fichier: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date_depot: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      valide: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      valide_par: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("Documents");
  },
};
