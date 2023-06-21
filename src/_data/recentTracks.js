const { AssetCache } = require('@11ty/eleventy-fetch')

const sortTrim = (array, length = 8) =>
  Object.values(array)
    .sort((a, b) => b.plays - a.plays)
    .splice(0, length)

module.exports = async function () {
  const APPLE_BEARER = process.env.API_BEARER_APPLE_MUSIC
  const APPLE_TOKEN = process.env.API_TOKEN_APPLE_MUSIC
  const asset = new AssetCache('recent_tracks_data')
  const PAGE_SIZE = 30
  const PAGES = 8
  const response = {
    artists: {},
    albums: {},
    tracks: {},
  }

  let CURRENT_PAGE = 0
  let res = []

  if (asset.isCacheValid('1h')) return await asset.getCachedValue()

  while (CURRENT_PAGE < PAGES) {
    const URL = `https://api.music.apple.com/v1/me/recent/played/tracks?limit=${PAGE_SIZE}&offset=${
      PAGE_SIZE * CURRENT_PAGE
    }`
    const tracks = await fetch(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APPLE_BEARER}`,
        'music-user-token': `${APPLE_TOKEN}`,
      },
    })
      .then((data) => data.json())
      .catch()
    res = [...res, ...tracks.data]
    CURRENT_PAGE++
  }

  res.forEach((track) => {
    // aggregate artists
    if (!response.artists[track.attributes.artistName]) {
      response.artists[track.attributes.artistName] = {
        name: track.attributes.artistName,
        plays: 1,
      }
    } else {
      response.artists[track.attributes.artistName].plays++
    }

    // aggregate albums
    if (!response.albums[track.attributes.albumName]) {
      response.albums[track.attributes.albumName] = {
        name: track.attributes.albumName,
        artist: track.attributes.artistName,
        art: track.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300'),
        plays: 1,
      }
    } else {
      response.albums[track.attributes.albumName].plays++
    }

    // aggregate tracks
    if (!response.tracks[track.attributes.name]) {
      response.tracks[track.attributes.name] = {
        name: track.attributes.name,
        plays: 1,
      }
    } else {
      response.tracks[track.attributes.name].plays++
    }
  })
  response.artists = sortTrim(response.artists)
  response.albums = sortTrim(response.albums)
  response.tracks = sortTrim(response.tracks, 5)
  await asset.save(response, 'json')
  return response
}
