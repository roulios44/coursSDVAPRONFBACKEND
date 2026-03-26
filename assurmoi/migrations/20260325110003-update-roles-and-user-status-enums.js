'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Roles', 'nom', {
      type: Sequelize.ENUM(
        'ADMIN',
        'GESTIONNAIRE_PORTEFEUILLE',
        'CHARGE_SUIVI',
        'CHARGE_CLIENTELE',
        'ASSURE',
      ),
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('Users', 'statut', {
      type: Sequelize.ENUM('actif', 'inactif'),
      allowNull: false,
      defaultValue: 'actif',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Roles', 'nom', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('Users', 'statut', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'actif',
    });
  },
};
