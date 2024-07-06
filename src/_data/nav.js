export default async function () {
  return {
    menu: [
      { name: 'Posts', url: '/posts', icon: 'article'},
      { name: 'Music', url: '/music', icon: 'headphones' },
      { name: 'Watching', url: '/watching', icon: 'device-tv' },
      { name: 'Books', url: '/books', icon: 'books' },
      { name: 'Links', icon: 'link' },
      { name: 'About', url: '/about', icon: 'info-circle' },
      { name: 'Search', icon: 'search' },
      { name: 'Feeds', icon: 'rss' },
      { name: 'Mastodon', icon: 'brand-mastodon' },
    ],
    footer: [
      { name: 'Uses' },
      { name: 'Colophon' },
      { name: 'Blogroll' },
      { name: 'Save' },
    ],
    social: [
      { name: 'Email', url: '/contact', icon: 'at' },
      { name: 'GitHub', url: 'https://github.com/cdransf', icon: 'brand-github' },
      { name: 'npm', url: 'https://www.npmjs.com/~cdransf', icon: 'brand-npm'},
      { name: 'Mastodon', url: 'https://social.lol/@cory', icon: 'brand-mastodon' },
      { name: 'Coffee', url: 'https://buymeacoffee.com/cory', icon: 'coffee' },
      { name: 'Now', url: '/now', icon: 'clock-hour-3' },
      { name: 'Webrings', url: '/webrings', icon: 'heart-handshake' },
    ],
  }
}
