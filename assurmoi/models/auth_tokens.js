const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuthToken extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'utilisateur' });
    }
  }

  AuthToken.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      token_hash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      revoked_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'AuthToken',
      tableName: 'AuthTokens',
      underscored: false,
    },
  );

  return AuthToken;
};
