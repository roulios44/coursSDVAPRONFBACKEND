'use strict';

const bcrypt = require('bcrypt');

const TEST_USERS = [
  {
    role: 'ADMIN',
    nom: 'Admin',
    prenom: 'Systeme',
    email: 'admin@assurmoi.local',
    telephone: '0600000001',
    motDePasse: 'admin123',
    statut: 'actif',
    doubleAuthActive: true,
  },
  {
    role: 'CHARGE_CLIENTELE',
    nom: 'Martin',
    prenom: 'Claire',
    email: 'clientele@assurmoi.local',
    telephone: '0600000002',
    motDePasse: 'client123',
    statut: 'actif',
    doubleAuthActive: false,
  },
  {
    role: 'CHARGE_SUIVI',
    nom: 'Bernard',
    prenom: 'Louis',
    email: 'suivi@assurmoi.local',
    telephone: '0600000003',
    motDePasse: 'suivi123',
    statut: 'actif',
    doubleAuthActive: false,
  },
  {
    role: 'ASSURE',
    nom: 'Durand',
    prenom: 'Emma',
    email: 'assure@assurmoi.local',
    telephone: '0600000004',
    motDePasse: 'assure123',
    statut: 'actif',
    doubleAuthActive: false,
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const roles = await queryInterface.sequelize.query(
      'SELECT id, nom FROM Roles',
      { type: Sequelize.QueryTypes.SELECT },
    );

    const roleIdByName = new Map(roles.map((role) => [role.nom, role.id]));
    const usersToInsert = [];

    for (const user of TEST_USERS) {
      const roleId = roleIdByName.get(user.role);
      if (!roleId) {
        continue;
      }

      usersToInsert.push({
        role_id: roleId,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        mot_de_passe: await bcrypt.hash(user.motDePasse, 10),
        statut: user.statut,
        double_auth_active: user.doubleAuthActive,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert('Users', usersToInsert, { ignoreDuplicates: true });
    }

    const assureUser = await queryInterface.sequelize.query(
      "SELECT id FROM Users WHERE email = 'assure@assurmoi.local' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (assureUser[0]) {
      await queryInterface.bulkInsert(
        'Assures',
        [
          {
            utilisateur_id: assureUser[0].id,
            nom: 'Durand',
            prenom: 'Emma',
            email: 'assure@assurmoi.local',
            telephone: '0600000004',
            adresse: '10 rue des Lilas, Paris',
            type_assure: 'particulier',
            createdAt: now,
            updatedAt: now,
          },
        ],
        { ignoreDuplicates: true },
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Assures', {
      email: ['assure@assurmoi.local'],
    });

    await queryInterface.bulkDelete('Users', {
      email: TEST_USERS.map((user) => user.email),
    });
  },
};
