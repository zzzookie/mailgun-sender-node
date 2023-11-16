const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Translations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Campaings, { foreignKey: 'id' });
    }
  }
  Translations.init({
    camp_id: DataTypes.INTEGER,
    lang: DataTypes.STRING,
    from: DataTypes.STRING,
    subject: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Translations',
  });
  return Translations;
};
