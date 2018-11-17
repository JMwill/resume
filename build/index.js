const fs = require('fs')
const path = require('path')
const util = require('util')
const mustache = require('mustache')
const showdown = require('showdown')
const mkdirp = require('mkdirp')
const prettier = require('prettier')
const config = require('./config.json')

const rootPath = path.join(__dirname, '../')
const fsReadFile = util.promisify(fs.readFile)
const fsWriteFile = util.promisify(fs.writeFile)
const promiseMkdir = util.promisify(mkdirp)
const converter = new showdown.Converter({simpleLineBreaks: true})
const errLog = console.error.bind(console)
const log = console.log.bind(console)

const getTmpl = async () =>
  await fsReadFile(path.join(rootPath, config.tmpl), 'utf8')
const createOutputFolder = async () =>
  await promiseMkdir(path.join(rootPath, config.output))
const getInput = async () =>
  await fsReadFile(path.join(rootPath, config.input), 'utf8')

async function main() {
  log('!!!! compile started !!!!')
  const input = getInput()
  const tmpl = getTmpl()
  const folder = createOutputFolder()

  try {
    await tmpl
    await input
    await folder
  } catch(e) { errLog(e) }

  const content = await input.then(text => converter.makeHtml(text))
  const html = await tmpl.then(t =>
      mustache.render(t, Object.assign({}, config.site, {content})))
  const prettierHtml = prettier.format(html, {parser: 'html'})

  try {
    await fsWriteFile(path.join(rootPath, config.output, 'index.html'), prettierHtml)
  } catch(e) { errLog(e) }
  log('!!!! compile finish !!!!')
}

if (typeof require != 'undefined' && require.main==module) {
  main()
}