import { getStore } from '@netlify/blobs'
import { DateTime } from 'luxon'

const sanitizeMediaString = (string) => {
  const normalizedStr = string.normalize('NFD');
  return normalizedStr
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2010]/g, '-')
    .replace(/\.{3}/g, '')
    .replace(/\?/g, '')
    .replace(/[\(\)\[\]\{\}]/g, '')
}

const weekKey = () => {
  const currentDate = DateTime.now();
  return `${currentDate.year}-${currentDate.weekNumber}`
}

const filterOldScrobbles = (scrobbles) => {
  const twoWeeksAgo = DateTime.now().minus({ weeks: 2 });
  return scrobbles.filter(scrobble => {
    const timestamp = DateTime.fromISO(scrobble.timestamp);
    return timestamp >= twoWeeksAgo;
  });
}

export default async (request) => {
  const ACCOUNT_ID_PLEX = Netlify.env.get('ACCOUNT_ID_PLEX');
  const MUSIC_KEY = Netlify.env.get('API_KEY_LASTFM');
  const params = new URL(request['url']).searchParams
  const id = params.get('id')

  if (!id) return new Response(JSON.stringify({
      status: 'Bad request',
    }),
    { headers: { "Content-Type": "application/json" } }
  )

  if (id !== ACCOUNT_ID_PLEX) return new Response(JSON.stringify({
      status: 'Forbidden',
    }),
    { headers: { "Content-Type": "application/json" } }
  )

  const data = await request.formData()
  const payload = JSON.parse(data.get('payload'))
  const artists = getStore('artists')
  const albums = getStore('albums')
  const scrobbles = getStore('scrobbles')

  if (payload?.event === 'media.scrobble') {
    const artist = payload['Metadata']['grandparentTitle']
    const album = payload['Metadata']['parentTitle']
    const track = payload['Metadata']['title']
    const trackNumber = payload['Metadata']['index']
    const timestamp = DateTime.now()
    const artistKey = sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()
    const albumKey = `${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(album).replace(/\s+/g, '-').toLowerCase()}`
    const artistsMap = await artists.get('artists-map', { type: 'json' })
    const albumsMap = await albums.get('albums-map', { type: 'json' })
    let artistInfo = {}
    let albumInfo = {}

    // if there is no artist blob, populate one
    if (!artistsMap[artist]) {
      const artistRes = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&api_key=${MUSIC_KEY}&artist=${sanitizeMediaString(artist).replace(/\s+/g, '+').toLowerCase()}&format=json`,
        {
          type: "json",
        }
      ).then((data) => {
        if (data.ok) return data.json()
        throw new Error('Something went wrong with the Last.fm endpoint.');
      }).catch(err => {
          console.log(err);
          return {}
        });
      const mbidRes = await fetch("https://coryd.dev/api/mbids", {
        type: "json",
      }).then((data) => {
        if (data.ok) return data.json()
        throw new Error('Something went wrong with the mbid endpoint.');
      }).catch(err => {
          console.log(err);
          return {}
        });
      const artistData = artistRes['artist'];
      let mbid = artistData['mbid']
      const mbidMap = () => mbidRes[artistData['name'].toLowerCase()] || '';

      // mbid mismatches
      if (mbidMap() !== "") mbid = mbidMap();

      const genreUrl = `https://musicbrainz.org/ws/2/artist/${mbid}?inc=aliases+genres&fmt=json`;
      const genreRes = await fetch(genreUrl, {
        type: "json",
      }).then((data) => {
        if (data.ok) return data.json()
        throw new Error('Something went wrong with the MusicBrainz endpoint.');
      }).catch(err => {
        console.log(err);
        return {}
      });
      const genre = genreRes['genres'].sort((a, b) => b.count - a.count)[0]?.['name'] || '';
      const artistObj = {
        mbid,
        genre,
        image: `https://cdn.coryd.dev/artists/${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}.jpg`
      }
      artistInfo = artistObj
      artistsMap[artist] = artistObj
      await artists.setJSON('artists-map', artistsMap)
    }

    // if there is no album blob, populate one
    if (!albumsMap[album]) {
      const albumRes = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${MUSIC_KEY}&artist=${sanitizeMediaString(artist).replace(/\s+/g, '+').toLowerCase()}&album=${sanitizeMediaString(album).replace(/\s+/g, '+').toLowerCase()}&format=json`,
        {
          type: "json",
        }
      ).then((data) => {
        if (data.ok) return data.json()
        throw new Error('Something went wrong with the Last.fm endpoint.');
      }).catch(err => {
          console.log(err);
          return {}
        });
      const mbid = albumRes['album']['mbid'] || ''
      const albumObj = {
        mbid,
        image: `https://cdn.coryd.dev/albums/${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(album.replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}.jpg`
      }
      albumsMap[album] = albumObj
      await albums.setJSON('albums-map', albumsMap)
    }

    // scrobble logic
    const trackScrobbleData = {
      track,
      album,
      artist,
      trackNumber,
      timestamp,
      genre
    }
    const scrobbleData = await scrobbles.get(`${weekKey()}`, { type: 'json'})
    const windowData = await scrobbles.get('window', { type: 'json'})
    await scrobbles.setJSON('now-playing', {...trackScrobbleData, ...{ url: `https://musicbrainz.org/artist/${artistInfo?.['mbid']}`}})
    let scrobbleUpdate = scrobbleData
    let windowUpdate = windowData;
    if (scrobbleUpdate?.['data']) scrobbleUpdate['data'].push(trackScrobbleData)
    if (!scrobbleUpdate?.['data']) scrobbleUpdate = { data: [trackScrobbleData] }
    if (windowData?.['data']) windowUpdate['data'].push(trackScrobbleData)
    if (!windowData?.['data']) windowUpdate = { data: [trackScrobbleData] }
    windowUpdate = { data: filterOldScrobbles(windowUpdate.data) }
    await scrobbles.setJSON(`${weekKey()}`, scrobbleUpdate)
    await scrobbles.setJSON('window', windowUpdate)
  }

  return new Response(JSON.stringify({
      status: 'success',
    }),
    { headers: { "Content-Type": "application/json" } }
  )
}

export const config = {
  path: '/api/scrobble',
}