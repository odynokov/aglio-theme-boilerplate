const pug = require('pug')
const path = require('path')
const fs = require('fs')
const postcss = require('postcss')
const postcss_config = require('./postcss.config')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const markdownIt = require('markdown-it')
const hljs = require('highlight.js')

const md = markdownIt({
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
      } catch (err) {
        console.log(err)
        return ''
      }
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
})


function formatJSON(json) {
  return Object.keys(json).reduce((result, key) => {

    if (key === 'description') {
      return Object.assign({}, result, {[key]: md.render(json[key])})
    }

    if (Object.prototype.toString.call(json[key]) === '[object Array]') {
      return Object.assign({}, result, {[key]: json[key].map(formatJSON)})
    }

    return Object.assign({}, result, {[key]: json[key]})

  }, {})
}


async function getJS(file_path) {
  const bundle = await rollup.rollup({
    entry: file_path,
    plugins: [
      babel({
        exclude: 'node_modules/**'
      })
    ]
  })

  const result = bundle.generate({
    format: 'iife'
  }).code

  return result.code
}


function getCSS(file_path) {
  const file_content = fs.readFileSync(file_path, 'utf8');

  return postcss(postcss_config.plugins)
    .process(file_content, {from: __dirname + '/styles/index.css'})
    .then(result => result.css)
}


exports.getConfig = function () {
  return {
    formats: ['1A'],
    options: [
      {
        name: 'Boilerplate',
        description: 'Boilerplate theme'
      }
    ]
  }
}


exports.render = async function(data, options, done) {
  const css = await getCSS(path.join(__dirname, 'styles', 'index.css'))
  const js = await getJS(path.join(__dirname, 'scripts', 'index.js'))

  if (options.export) {
    fs.writeFile(path.join(__dirname, 'example.json'), JSON.stringify(formatJSON(data), null, 2))
  }

  done(
    null,
    pug.renderFile(
      path.join(__dirname, 'templates', 'index.pug'),
      Object.assign({}, {data: formatJSON(data)}, {options}, {css}, {js})
    )
  )
}
