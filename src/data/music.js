import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import { sanitizeMediaString, parseCountryField } from '../../config/utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchDataForPeriod = async (startPeriod, fields, table) => {
  const PAGE_SIZE = 1000
  let rows = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(fields)
      .order('listened_at', { ascending: false })
      .gte('listened_at', startPeriod.toSeconds())
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error(error)
      break
    }

    rows = rows.concat(data)

    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return rows
}

const fetchGenreMapping = async () => {
  const { data, error } = await supabase
    .from('genres')
    .select('id, name')

  if (error) {
    console.error('Error fetching genres:', error)
    return {}
  }
  return data.reduce((acc, genre) => {
    acc[genre.id] = genre.name
    return acc
  }, {})
}

const aggregateData = async (data, groupByField, groupByType) => {
  const aggregation = {}
  const genreMapping = await fetchGenreMapping()

  data.forEach(item => {
    const key = item[groupByField]
    if (!aggregation[key]) {
      if (groupByType === 'track') {
        aggregation[key] = {
          title: item[groupByField],
          plays: 0,
          mbid: item['albums']['mbid'],
          url: `/music/artists/${sanitizeMediaString(item['artist_name'])}-${sanitizeMediaString(parseCountryField(item['artists']['country']))}`,
          image: `/${item['albums']?.['art']?.['filename_disk']}` || '',
          timestamp: item['listened_at'],
          type: groupByType,
          genre: genreMapping[item['artists']['genres']] || ''
        }
      } else {
        aggregation[key] = {
          title: item[groupByField],
          plays: 0,
          mbid: item[groupByType]?.['mbid'] || '',
          url: `/music/artists/${sanitizeMediaString(item['artist_name'])}-${sanitizeMediaString(parseCountryField(item['artists']['country']))}`,
          image: `/${item[groupByType]?.['art']?.['filename_disk']}` || '',
          type: groupByType,
          genre: genreMapping[item['artists']['genres']] || ''
        }
      }
      if (groupByType === 'track' || groupByType === 'albums') aggregation[key]['artist'] = item['artist_name']
    }
    aggregation[key].plays++
  })

  const aggregatedData = Object.values(aggregation).sort((a, b) => b.plays - a.plays)

  aggregatedData.forEach((item, index) => {
    item.rank = index + 1
  })

  return aggregatedData.filter(item => item.plays > 0)
}

const buildRecents = async (data) => {
  return data.map(listen => ({
    title: listen['track_name'],
    artist: listen['artist_name'],
    url: `/music/artists/${sanitizeMediaString(listen['artist_name'])}-${sanitizeMediaString(parseCountryField(listen['artists']['country']))}`,
    timestamp: listen['listened_at'],
    image: `/${listen['albums']?.['art']?.['filename_disk']}` || ''
  }))
}

const aggregateGenres = async (data) => {
  const genreAggregation = {}
  const genreMapping = await fetchGenreMapping()

  data.forEach(item => {
    const genre = genreMapping[item['artists']['genres']] || ''

    if (!genreAggregation[genre]) genreAggregation[genre] = { genre, plays: 0 }
    genreAggregation[genre]['plays']++
  })
  return Object.values(genreAggregation).sort((a, b) => b['plays'] - a['plays'])
}

export default async function() {
  const periods = {
    week: DateTime.now().minus({ days: 7 }).startOf('day'), // last week
    month: DateTime.now().minus({ days: 30 }).startOf('day'), // last 30 days
    threeMonth: DateTime.now().minus({ months: 3 }).startOf('day'), // last three months
  }

  const results = {}
  const selectFields = `
    track_name,
    artist_name,
    album_name,
    album_key,
    listened_at,
    artists (mbid, art(filename_disk), genres, country),
    albums (mbid, art(filename_disk))
  `

  for (const [period, startPeriod] of Object.entries(periods)) {
    const periodData = await fetchDataForPeriod(startPeriod, selectFields, 'listens')
    results[period] = {
      artists: await aggregateData(periodData, 'artist_name', 'artists'),
      albums: await aggregateData(periodData, 'album_name', 'albums'),
      tracks: await aggregateData(periodData, 'track_name', 'track'),
      genres: await aggregateGenres(periodData),
      totalTracks: periodData?.length?.toLocaleString('en-US')
    }
  }

  const recentData = await fetchDataForPeriod(DateTime.now().minus({ days: 7 }), selectFields, 'listens')

  results['recent'] = (await buildRecents(recentData)).sort((a, b) => b.timestamp - a.timestamp)

  return results
}