const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TwoFactorCode extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'utilisateur' });
    }
  }

  TwoFactorCode.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      consumed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'TwoFactorCode',
      tableName: 'TwoFactorCodes',
      underscored: false,
    },
  );

  return TwoFactorCode;
};
