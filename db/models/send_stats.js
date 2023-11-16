const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Send_stats extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Campaings, { foreignKey: 'camp_id' });
    }
  }
  Send_stats.init({
    ts: DataTypes.DATE,
    camp_id: DataTypes.INTEGER,
    lang: DataTypes.STRING,
    email: DataTypes.STRING,
    ext_id: DataTypes.STRING,
    success: DataTypes.BOOLEAN,
    error_msg: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Send_stats',
  });
  return Send_stats;
};
