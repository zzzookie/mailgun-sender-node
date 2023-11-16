const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Campaings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Translations, { foreignKey: 'camp_id' });
      this.hasMany(models.Send_stats, { foreignKey: 'camp_id' });
    }
  }
  Campaings.init({
    name: DataTypes.STRING,
    mg_template: DataTypes.STRING,
    default_lang: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Campaings',
  });
  return Campaings;
};
