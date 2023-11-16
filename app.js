#!/usr/bin/env node

require('dotenv').config();

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const { Op } = require('sequelize');
const { Campaings, Translations } = require('./db/models');
const parseMaillist = require('./parseMaillist');
const readClArgs = require('./readClArgs');

const { DEFAULT_FILE_NAME, BASE_URL, MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env;

const args = readClArgs();

let fileName = args.maillist || `./${DEFAULT_FILE_NAME || 'maillist'}.csv`;
if (!fileName.endsWith('.csv')) {
  fileName += '.csv';
}

async function mailgunSend() {
  const campaignName = args.campaign.trim();

  const userList = await parseMaillist(fileName);
  const userLangs = new Set(userList.map((user) => user.lang));

  const campaign = JSON.parse(JSON.stringify(
    await Campaings.findOne({
      where: { name: campaignName },
      attributes: ['name', 'mg_template', 'default_lang'],
      include: {
        model: Translations,
        attributes: ['lang', 'from', 'subject'],
        where: {
          lang: { [Op.any]: Array.from(userLangs) },
        },
      },
    }),
  ));

  if (!campaign) {
    const campaingOnly = await Campaings.findOne({
      where: { name: campaignName },
    });

    console.error(campaingOnly
      ? `Error: A campaign with "${campaignName}" does not have any of the requested languages (${[...Array.from(userLangs)]})`
      : `Error: A campaign with "${campaignName}" name was not found in the database`);
    process.exit(1);
  }

  const translations = campaign?.Translations.reduce((acc, translation) => {
    const { lang, ...rest } = translation;
    acc[lang] = { lang, ...rest, to: [] };
    return acc;
  }, {});

  userList.forEach((userWithLang) => {
    const { lang, ...user } = userWithLang;
    if (lang in translations) {
      translations[lang].to.push(user);
    } else {
      translations[campaign.default_lang || 'en'].to.push(user);
    }
  });

  const mailgun = new Mailgun(formData);
  const client = mailgun.client({
    username: 'api',
    key: MAILGUN_API_KEY,
    url: BASE_URL || 'https://api.mailgun.net',
  });

  Object.values(translations).forEach(async (translation) => {
    const { lang, from, subject, to } = translation;

    const messageData = {
      'o:tag': [campaign.mg_template, lang],
      't:version': lang,
      template: campaign.mg_template,
      from,
      subject,
      to: to.map((receiver) => `${receiver.name} <${receiver.email}>`),
    };

    client.messages.create(MAILGUN_DOMAIN, messageData)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });
  });
}

mailgunSend();
