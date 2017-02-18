const tmpl = require('art-template');
const fs = require('fs');
const path = require('path');

const folderPath = path.resolve(__dirname, '../');
const data = require(`${folderPath}/resumeInfo.json`);
const page = tmpl(`${folderPath}/index`, data);
fs.writeFile(`${folderPath}/dist/${process.argv[2]}/index.html`, page, { flag: 'w+' }, (err) => {
    if (err) throw err;
    console.log('=============> index.html has generated! <==================');
});
