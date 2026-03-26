'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('Roles', [
      { nom: 'ADMIN', createdAt: now, updatedAt: now },
      { nom: 'GESTIONNAIRE_PORTEFEUILLE', createdAt: now, updatedAt: now },
      { nom: 'CHARGE_SUIVI', createdAt: now, updatedAt: now },
      { nom: 'CHARGE_CLIENTELE', createdAt: now, updatedAt: now },
      { nom: 'ASSURE', createdAt: now, updatedAt: now },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Roles', {
      nom: ['ADMIN', 'GESTIONNAIRE_PORTEFEUILLE', 'CHARGE_SUIVI', 'CHARGE_CLIENTELE', 'ASSURE'],
    });
  },
};
