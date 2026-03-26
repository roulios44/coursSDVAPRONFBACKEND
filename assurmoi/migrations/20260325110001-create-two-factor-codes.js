'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TwoFactorCodes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      code: {
        type: Sequelize.STRING(6),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      consumed_at: {
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
    await queryInterface.dropTable('TwoFactorCodes');
  },
};
