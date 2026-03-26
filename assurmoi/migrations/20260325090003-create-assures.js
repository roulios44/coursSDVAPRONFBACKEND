"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Assures", {
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
      nom: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      prenom: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      telephone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      adresse: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type_assure: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable("Assures");
  },
};
