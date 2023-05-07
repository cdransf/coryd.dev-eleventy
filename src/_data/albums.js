const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const MUSIC_KEY = process.env.API_KEY_LASTFM
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=cdme_&api_key=${MUSIC_KEY}&limit=8&format=json&period=7day`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  }).catch()
  const albums = await res
  return albums['topalbums'].album
}
