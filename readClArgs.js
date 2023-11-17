const { DEFAULT_FILE_NAME } = process.env;
const commander = require('commander');

function readClArgs() {
  const args = commander
    .option('-ml, --maillist <maillist>', 'Specify a file with a list of mailing addresses in "file" or "file.csv" format')
    .option('-camp, --campaign <campaign>', 'Specify the campaign name (for example, "registration_without_activation")')
    .parse(process.argv)
    .opts();

  if (!args.campaign) {
    console.error('Error: Please specify the Mailgun campaign name');
    process.exit(1);
  }

  let fileName = args.maillist || `./${DEFAULT_FILE_NAME || 'maillist'}.csv`;
  if (!fileName.endsWith('.csv')) {
    fileName += '.csv';
  }

  return { fileName, campaignName: args.campaign.trim() };
}

module.exports = readClArgs;
