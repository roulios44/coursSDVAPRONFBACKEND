const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PasswordResetToken extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'utilisateur' });
    }
  }

  PasswordResetToken.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'PasswordResetToken',
      tableName: 'PasswordResetTokens',
      underscored: false,
    },
  );

  return PasswordResetToken;
};
