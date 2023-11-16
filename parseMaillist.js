const fs = require('node:fs/promises');

async function parseMaillist(fileName) {
  try {
    const usersStrArr = (await fs.readFile(fileName, 'utf8')).trim().split('\n');
    if (usersStrArr[0].includes('name') || usersStrArr[0].includes('email')) {
      usersStrArr.shift();
    }
    const users = usersStrArr.map((user) => {
      const [name, email, lang, ext_id] = user.split(',').map((field) => {
        let fieldTr = field.trim();
        fieldTr = fieldTr.startsWith('"') && fieldTr.endsWith('"') ? fieldTr.slice(1, -1) : fieldTr;
        return fieldTr;
      });
      return { name, email, lang, ext_id };
    });
    return users;
  } catch (err) {
    console.error(`Error: Parsing file error ${err.message}`);
    process.exit(1);
  }
}

module.exports = parseMaillist;
