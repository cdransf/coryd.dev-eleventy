module.exports = async function () {
  return {
    footer: [{ name: 'Uses' }, { name: 'Referrals' }],
    menu: [
      { name: 'Now' },
      { name: 'About' },
      { name: 'Tags', icon: 'tags' },
      { name: 'Search', icon: 'search' },
      { name: 'Feeds', icon: 'rss' },
      { name: 'Webrings', icon: 'heart-handshake' },
    ],
    social: [
      { name: 'Email', url: 'mailto:coryd@fastmail.com', icon: 'at' },
      { name: 'GitHub', url: 'https://github.com/cdransf', icon: 'brand-github' },
      { name: 'Mastodon', url: 'https://social.lol/@cory', icon: 'brand-mastodon' },
      {
        name: 'Apple Music',
        url: 'https://music.apple.com/profile/cdransf',
        icon: 'device-airpods',
      },
      { name: 'Trakt', url: 'https://trakt.tv/users/cdransf', icon: 'device-tv' },
      { name: 'Goodreads', url: 'https://www.goodreads.com/cdransf', icon: 'books' },
      { name: 'Buy Me a Coffee', url: 'https://www.buymeacoffee.com/cory', icon: 'cup' },
    ],
    resume: [
      { name: 'GitHub', url: 'https://github.com/cdransf', icon: 'brand-github' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/in/cdransf/', icon: 'brand-linkedin' },
      {
        name: 'Calendar',
        url: 'https://coryd.dev/calendar',
        icon: 'calendar-plus',
      },
    ],
  }
}
