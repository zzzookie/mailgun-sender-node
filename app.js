#!/usr/bin/env node

require('dotenv').config();

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const parseMaillist = require('./parseMaillist');
const readClArgs = require('./readClArgs');
const Database = require('./database');

const { BASE_URL, MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env;
const { fileName, campaignName } = readClArgs();

const db = new Database();
const mailgun = new Mailgun(formData).client({
  username: 'api',
  key: MAILGUN_API_KEY,
  url: BASE_URL || 'https://api.mailgun.net',
});

async function mailgunSend() {
  const userList = await parseMaillist(fileName);
  const userLangs = Array.from(new Set(userList.map((user) => user.lang)));

  const campaign = await db.getCampaingByName(campaignName, userLangs);

  const translations = campaign?.Translations.reduce((acc, translation) => {
    const { lang, ...rest } = translation;
    acc[lang] = { lang, ...rest, recipients: [] };
    return acc;
  }, {});

  userList.forEach((userWithLang) => {
    const { lang, ...user } = userWithLang;
    if (lang in translations) {
      translations[lang].recipients.push(user);
    } else {
      translations[campaign.default_lang || 'en'].recipients.push(user);
    }
  });

  Object.values(translations).forEach(async (translation) => {
    let statsData = [];
    let { recipients } = translation;
    const { lang, from, subject } = translation;
    const camp_id = campaign.id;
    const emails = recipients.map((recipient) => recipient.email);

    const duplicatedRecipients = await db.getDuplicatedRecipients(camp_id, emails);

    if (duplicatedRecipients !== null || duplicatedRecipients.length !== 0) {
      const duplicatedRecipientsEmails = new Set(duplicatedRecipients.map((r) => r.email));
      const removedIndexes = [];
      const excludedRecipients = [];

      recipients.forEach((recipient, i) => {
        if (duplicatedRecipientsEmails.has(recipient.email)) {
          const send_stats_id = duplicatedRecipients
            .find((r) => recipient.email === r.email && lang === r.lang)?.id;
          excludedRecipients.push({ ...recipient, send_stats_id });
          removedIndexes.push(i);
        }
      });

      recipients = recipients.filter((r, i) => !removedIndexes.includes(i));

      const excludedStatsData = excludedRecipients.map((r) => ({
        camp_id,
        lang,
        email: r.email,
        ext_id: r.ext_id,
        success: false,
        error_msg: `already sent: <${r.send_stats_id}>`,
      }));

      await db.sendStats(excludedStatsData);
    }

    if (recipients.length === 0) {
      console.error(`Nothing has been sent: all the recipients in the list has received "${campaignName}" campaign email before.`);
      console.error('Information has been saved in the statistics.');
      process.exit(1);
    }

    const messageData = {
      'o:tag': [campaign.mg_template, lang],
      't:version': lang,
      template: campaign.mg_template,
      from,
      subject,
      to: recipients.map((recipient) => `${recipient.name} <${recipient.email}>`),
    };

    try {
      const response = await mailgun.messages.create(MAILGUN_DOMAIN, messageData);

      statsData = response.status === 200
        ? recipients.map((r) => ({
          camp_id,
          lang,
          email: r.email,
          ext_id: r.ext_id,
          success: true,
        }))
        : recipients.map((r) => ({
          camp_id,
          lang,
          email: r.email,
          ext_id: r.ext_id,
          success: false,
          error_msg: Object.entries(response?.message),
        }));
    } catch (err) {
      statsData = recipients.map((r) => ({
        camp_id,
        lang,
        email: r.email,
        ext_id: r.ext_id,
        success: false,
        error_msg: Object.entries(err).map((entry) => `${entry[0].toUpperCase()}: ${entry[1]}`).join(', '),
      }));
    }

    await db.sendStats(statsData);
  });
}

mailgunSend();
