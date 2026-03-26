"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Notifications", {
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
      assure_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dossier_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      type_notification: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      date_envoi: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("Notifications");
  },
};
