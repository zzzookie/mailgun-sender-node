const { Op } = require('sequelize');
const { Campaings, Translations, Send_stats } = require('./db/models');

const parse = (obj) => JSON.parse(JSON.stringify(obj));

class Database {
  async getCampaingByName(campaignName, userLangs) {
    try {
      const campaign = parse(await Campaings.findOne({
        where: { name: campaignName },
        attributes: ['id', 'name', 'mg_template', 'default_lang'],
        include: {
          model: Translations,
          attributes: ['lang', 'from', 'subject'],
          where: {
            lang: { [Op.any]: userLangs },
          },
        },
      }));

      if (!campaign || campaign.length === 0) {
        const campaingOnly = await Campaings.findOne({
          where: { name: campaignName },
        });

        console.error(campaingOnly
          ? `Error: A campaign with "${campaignName}" does not have any of the requested languages (${[...Array.from(userLangs)]})`
          : `Error: A campaign with "${campaignName}" name was not found in the database`);
        process.exit(1);
      }
      return campaign;
    } catch (error) {
      console.error(`Error while usinc getCampaignsByName method: ${error.message}`);
      throw error;
    }
  }

  async sendStats(statsData) {
    let sendedStats = [];
    try {
      sendedStats = parse(await Send_stats.bulkCreate(statsData));
    } catch (error) {
      console.error(`Error while using sendStats method: ${error.message}`);
    }
    return sendedStats;
  }

  async getDuplicatedRecipients(camp_id, emails) {
    let duplicatedRecipients;
    try {
      duplicatedRecipients = parse(await Send_stats.findAll({
        where: {
          camp_id,
          email: { [Op.any]: emails },
          success: true,
        },
        attributes: ['id', 'lang', 'email', 'ts', 'success'],
      }));
    } catch (error) {
      console.error(`Error while using getSuccessfulRecipients method: ${error.message}`);
    }
    return duplicatedRecipients;
  }
}

module.exports = Database;
