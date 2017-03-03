const version = require('./package.json').version;
const buildType = process.argv[2];
let p = {
    src: `./src/${buildType}`,
    devDest: `./dev/${version}/index.html`,
    buildDest: './dist/index.html'
}
const fs   = require('fs');
const path = require('path');
const tmpl = require('art-template');
const data = require(`./resumeInfo.json`);

const page = tmpl(path.resolve(__dirname, p.src), data);

fs.writeFile(path.resolve(__dirname, p[`${buildType}Dest`]), page, { flag: 'w+' }, (err) => {
    if (err) throw err;
    console.log('=============> index.html has generated! <==================');
});