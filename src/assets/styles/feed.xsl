<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <style type="text/css">
          @font-face {
            font-family: 'MonoLisa';
            src: url('/assets/fonts/MonoLisa.min.woff2') format('woff2');
            font-display: optional
          }

          :root {
            --sizing-xs: .25rem;
            --sizing-sm: .5rem;
            --sizing-md: .75rem;
            --sizing-lg: 1rem;
            --sizing-base: 1.5rem;
            --sizing-xl: 1.75rem;
            --sizing-2xl: 2rem;
            --sizing-3xl: 2.25rem;

            --font-mono: 'MonoLisa', Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, ui-monospace, monospace;

            --blue-50: #eff5ff;
            --blue-100: #e2ecff;
            --blue-200: #c5d8ff;
            --blue-300: #a8c4ff;
            --blue-400: #7aa6ff;
            --blue-500: #4b88ff;
            --blue-600: #3168e9;
            --blue-700: #2458d4;
            --blue-800: #1d4bac;
            --blue-900: #1c3e91;
            --blue-950: #183275;

            --gray-50: #f6f7f8;
            --gray-100: #eceef1;
            --gray-200: #dfe3e8;
            --gray-300: #c5ccd5;
            --gray-400: #adb4c0;
            --gray-500: #959eae;
            --gray-600: #7f899b;
            --gray-700: #707b8e;
            --gray-800: #626d7f;
            --gray-900: #545e71;
            --gray-950: #4a5365;
            --gray-darkest: #1a1d22;

            --white: #fff;
            --black: #000;

            --gray-light: var(--gray-200);
            --gray-lighter: var(--gray-100);
            --gray-dark: var(--gray-950);

            --accent-color: var(--blue-600);
            --accent-color-hover: var(--blue-800);
            --color-lightest: var(--gray-50);
            --color-darkest: var(--gray-darkest);

            --text-color: var(--color-darkest);
            --background-color: var(--color-lightest);
            --border-color: var(--gray-200);

            --code-bg-color: #1a1d22;
            --code-text-color: #f6f7f8;

            --font-size-xs: .7rem;
            --font-size-sm: .85rem;
            --font-size-base: 1rem;
            --font-size-lg: 1.15rem;
            --font-size-xl: 1.3rem;
            --font-size-2xl: 1.45rem;
            --font-size-3xl: 1.6rem;

            --font-weight-base: 400;
            --font-weight-bold: 600;
            --font-weight-extrabold: 800;
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --gray-light: var(--gray-800);
              --gray-lighter: var(--gray-900);
              --gray-dark: var(--gray-200);
              --text-color: var(--color-lightest);
              --background-color: var(--color-darkest);
              --accent-color: var(--blue-400);
              --accent-color-hover: var(--blue-200);
              --border-color: var(--gray-800);
            }
          }

          ::-moz-selection {
            color: var(--color-lightest);
            background: var(--accent-color);
          }

          ::selection {
            color: var(--color-lightest);
            background: var(--accent-color);
          }

          ::-webkit-scrollbar {
            width: var(--sizing-xs);
            height: var(--sizing-xs);
          }

          body {
            font-family: var(--font-mono);
            font-size: var(--font-size-base);
            font-weight: var(--font-weight-base);
            line-height: 2;
            letter-spacing: -.05rem;
            word-spacing: -.125rem;
            color: var(--text-color);
            background-color: var(--background-color);
          }

          html {
            font-size: 100%;
            -webkit-text-size-adjust: none;
          }

          .main-wrapper {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          main {
            flex: 1 1 0%;
            width: 80%;
            margin-left: auto;
            margin-right: auto;
          }

          .default-wrapper {
            padding-top: var(--sizing-2xl);
          }

          .default-wrapper > p:first-of-type {
            margin-top: 0;
          }

          .main-title {
            padding-top: var(--sizing-3xl);
          }

          .main-title h1 {
            font-weight: var(--font-weight-extrabold);
            margin: 0;
            padding: 0;
          }

          .main-title h1 a {
            text-decoration: none;
          }

          h1 { font-size: var(--font-size-2xl); }
          h2 { font-size: var(--font-size-xl); }
          h3 { font-size: var(--font-size-lg); }

          h1, h2, h3 {
            font-weight: var(--font-weight-bold);
            line-height: 1.5;
            margin-bottom: var(--sizing-base);
          }

          a {
            color: var(--accent-color);
            text-decoration: none;
          }

          a:focus,
          a:focus-within {
            outline: 2px dashed var(--accent-color);
            text-decoration: none;
          }

          a:hover,
          a:focus,
          a:active {
            color: var(--accent-color-hover);
            transition-property: color;
            transition-timing-function: var(--transition-ease-in-out);
            transition-duration: var(--transition-duration-default);
          }

          .date {
            margin: 0;
            color: var(--gray-dark);
            font-size: var(--font-size-sm);
          }

          .item {
            padding: var(--sizing-base) 0;
            border-bottom: 1px solid var(--border-color);
          }

          .item h3 {
            margin-top: 0;
            margin-bottom: var(--sizing-base);
          }

          .item p:first-of-type {
            margin-top: 0;
          }

          .item:first-of-type {
            padding-top: 0;
          }

          .item:last-of-type {
            border-bottom: 0;
          }

          .description {
            margin-bottom: var(--sizing-base);
          }

          p {
            margin-bottom: var(--sizing-base)
          }

          p a {
            text-decoration: underline;
            text-decoration-line: underline;
            text-decoration-style: dashed;
            text-underline-offset: var(--sizing-xs);
          }

          p:last-of-type {
            margin-bottom: 0;
          }

          hr {
            height: 1px;
            background-color: var(--border-color);
            border: 0;
            margin: var(--sizing-base) 0;
          }

          .highlight-text {
            color: var(--color-lightest);
            background-color: var(--accent-color);
            padding: var(--sizing-xs);
          }

          pre {
            background-color: var(--code-bg-color);
            color: var(--code-text-color);
            padding: var(--sizing-base);
            border: 1px solid var(--border-color);
            overflow: auto;
            margin: var(--sizing-base) 0;
            font-family: var(--font-mono);
            font-size: var(--body-font-size);
          }

          code {
            background-color: var(--code-bg-color);
            color: var(--code-text-color);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: var(--font-mono);
          }

          pre code {
            padding: 0;
            background: none;
            border: none;
          }

          pre.small {
            padding: var(--sizing-md);
          }

          @media screen and (min-width: 768px) {
            h1 { font-size: var(--font-size-3xl); }
            h2 { font-size: var(--font-size-2xl); }
            h3 { font-size: var(--font-size-xl); }

            main {
              max-width: 768px;
            }
          }
        </style>
      </head>
      <body>
        <div class="main-wrapper">
          <main>
            <section class="main-title">
              <h1><a href="/feeds" tabindex="0"><xsl:value-of select="/rss/channel/title"/></a></h1>
            </section>
            <div class="default-wrapper">
              <p><xsl:value-of select="/rss/channel/description"/></p>
              <p><a href="/feeds">View more of the feeds from my site.</a> <strong class="highlight-text">Or subscribe by adding the URL below to your feed reader of choice.</strong></p>
              <p>
                <pre class="small">
                  <code><xsl:value-of select="/rss/channel/feedUrl"/></code>
                </pre>
              </p>
              <hr />
              <section>
                <xsl:for-each select="/rss/channel/item">
                  <div class="item">
                    <p class="date">Published: <xsl:value-of select="pubDate"/></p>
                    <h3>
                      <a>
                        <xsl:attribute name="href">
                          <xsl:value-of select="link"/>
                        </xsl:attribute>
                        <xsl:value-of select="title"/>
                      </a>
                    </h3>
                    <xsl:value-of select="description" disable-output-escaping="yes"/>
                  </div>
                </xsl:for-each>
              </section>
            </div>
          </main>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>