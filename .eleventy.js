import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import tablerIcons from 'eleventy-plugin-tabler-icons'
import pluginRss from '@11ty/eleventy-plugin-rss'
import postGraph from '@rknightuk/eleventy-plugin-post-graph'
import embedEverything from 'eleventy-plugin-embed-everything'
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img'

import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFootnote from 'markdown-it-footnote'
import htmlmin from 'html-minifier-terser'
import path from 'path';

import filters from './config/filters/index.js'
import { slugifyString } from './config/utils/index.js'
import { svgToJpeg } from './config/events/index.js'
import { tagList, tagMap, postStats } from './config/collections/index.js'

import { execSync } from 'child_process'

// load .env
import dotenvFlow from 'dotenv-flow'
dotenvFlow.config()

// get app version
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const appVersion = require('./package.json').version

/**
 *  @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 */
export default async function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(tablerIcons)
  eleventyConfig.addPlugin(postGraph, {
    boxColorLight: '#d9dee4',
    highlightColorLight: '#2563eb',
    textColorLight: '#1f2937',
    boxColorDark: '#4b515d',
    highlightColorDark: '#60a5fa',
    textColorDark: '#fff',
  })
  eleventyConfig.addPlugin(embedEverything);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: 'html',
    formats: ['avif', 'webp', 'jpeg'],
    widths: [320, 570, 880, 1024, 1248],
    defaultAttributes: {
      loading: 'lazy',
      decoding: 'async',
      sizes: '90vw',
    },
    outputDir: './_site/assets/img/cache/',
    urlPath: '/assets/img/cache/',
    filenameFormat: (id, src, width, format) => {
      const { name } = path.parse(src);
      return `${name}-${width}w.${format}`;
    },
  });

  // quiet build output
  eleventyConfig.setQuietMode(true)

  // template options
  eleventyConfig.setLiquidOptions({
    jsTruthy: true,
  })

  // passthrough
  eleventyConfig.addPassthroughCopy('src/assets')
  eleventyConfig.addPassthroughCopy('_redirects')
  eleventyConfig.addPassthroughCopy({
    'node_modules/@zachleat/pagefind-search/pagefind-search.js': 'assets/scripts/components/pagefind-search.js',
  })
  eleventyConfig.addPassthroughCopy({
    'node_modules/@daviddarnes/mastodon-post/mastodon-post.js': 'assets/scripts/components/mastodon-post.js'
  })
  eleventyConfig.addPassthroughCopy({
    'node_modules/@daviddarnes/share-button/share-button.js': 'assets/scripts/components/share-button.js'
  })

  // enable merging of tags
  eleventyConfig.setDataDeepMerge(true)

  // create excerpts
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_alias: 'post_excerpt',
    excerpt_separator: '<!-- excerpt -->',
  })

  // collections
  eleventyConfig.addCollection('tagList', tagList)
  eleventyConfig.addCollection('tagMap', tagMap)
  eleventyConfig.addCollection('postStats', postStats)

  const md = markdownIt({ html: true, linkify: true })
  md.use(markdownItAnchor, {
    level: [1, 2],
    permalink: markdownItAnchor.permalink.headerLink({
      safariReaderFix: true,
    }),
  })
  md.use(markdownItFootnote)
  eleventyConfig.setLibrary('md', md)

  // filters
  eleventyConfig.addLiquidFilter('markdown', (content) => {
    if (!content) return
    return md.render(content)
  })
  Object.keys(filters).forEach((filterName) => {
    eleventyConfig.addLiquidFilter(filterName, filters[filterName])
  })
  eleventyConfig.addFilter('slugify', slugifyString)

  // shortcodes
  eleventyConfig.addShortcode('appVersion', () => appVersion)

  // transforms
  eleventyConfig.addTransform('html-minify', (content, path) => {
    if (path && path.endsWith('.html')) {
      return htmlmin.minify(content, {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        decodeEntities: true,
        includeAutoGeneratedTags: false,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeComments: true,
        useShortDoctype: true,
        processScripts: ['application/ld+json'], // minify JSON-LD scripts
      })
    }
    return content
  })

  // events
  eleventyConfig.on('afterBuild', svgToJpeg)
  eleventyConfig.on('eleventy.after', () => {
    execSync(`npx pagefind --site _site --glob "**/*.html"`, { encoding: 'utf-8' })
  })

  return {
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  }
}
