const fs = require('fs-extra')
const path = require('path')
const mustache = require('mustache')
const showdown = require('showdown')
const prettier = require('prettier')
const config = require('./config.json')

const rootPath = path.join(__dirname, '../')
const converter = new showdown.Converter({simpleLineBreaks: true})
const errLog = console.error.bind(console)
const log = console.log.bind(console)

const getTmpl = async () =>
  await fs.readFile(path.join(rootPath, config.tmpl), 'utf8')
const createOutputFolder = async () =>
  await fs.ensureDir(path.join(rootPath, config.output))
const getInput = async () =>
  await fs.readFile(path.join(rootPath, config.input), 'utf8')
const moveStyles = async () =>
  await fs.copy(path.join(rootPath, 'styles'), path.join(rootPath, config.output, 'styles'), {overwrite: true})
const compileToHTML = async () => {
  const input = getInput()
  const tmpl = getTmpl()
  const folder = createOutputFolder()

  try {
    await tmpl
    await input
    await folder
    const content = await input.then(text => converter.makeHtml(text))
    const html = await tmpl.then(t =>
        mustache.render(t, Object.assign({}, config.site, {content})))
    const prettierHtml = prettier.format(html, {parser: 'html'})
    return prettierHtml
  } catch(e) { errLog(e) }
}

async function main() {
  log('!!!! compile started !!!!')
  const html = await compileToHTML()
  try {
    const outputPath = path.join(rootPath, config.output, 'index.html')
    await fs.writeFile(outputPath, html)

    log('!!!! move styles !!!!')
    await moveStyles()
    log('!!!! move finish !!!!')
  } catch(e) { errLog(e) }
  log('!!!! compile finish !!!!')
}

if (typeof require != 'undefined' && require.main==module) {
  main()
}