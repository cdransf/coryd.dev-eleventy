import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PAGE_SIZE = 50

const fetchBlockData = async (collection, itemId) => {
  const { data, error } = await supabase
    .from(collection)
    .select('*')
    .eq('id', itemId)
    .single()

  if (error) {
    console.error(`Error fetching data from ${collection} for item ${itemId}:`, error)
    return null
  }

  return data
}

const fetchTagsForPost = async (postId) => {
  const { data, error } = await supabase
    .from('posts_tags')
    .select('tags(id, name)')
    .eq('posts_id', postId)

  if (error) {
    console.error(`Error fetching tags for post ${postId}:`, error)
    return []
  }

  return data.map(pt => pt.tags.name)
}

const fetchBlocksForPost = async (postId) => {
  const { data, error } = await supabase
    .from('posts_blocks')
    .select('collection, item, sort')
    .eq('posts_id', postId)

  if (error) {
    console.error(`Error fetching blocks for post ${postId}:`, error)
    return []
  }

  const blocks = await Promise.all(data.map(async block => {
    const blockData = await fetchBlockData(block.collection, block.item)

    return {
      type: block['collection'],
      sort: block['sort'],
      ...blockData
    }
  }))

  return blocks
}

const fetchAllPosts = async () => {
  let posts = []
  let page = 0
  let fetchMore = true
  const uniqueSlugs = new Set()

  while (fetchMore) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        image(filename_disk)
      `)
      .order('date', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching posts:', error)
      return posts
    }

    if (data.length < PAGE_SIZE) fetchMore = false

    for (const post of data) {
      if (uniqueSlugs.has(post['slug'])) continue

      uniqueSlugs.add(post.slug)
      post['tags'] = await fetchTagsForPost(post['id'])
      post['blocks'] = await fetchBlocksForPost(post['id'])
      if (post?.['image']?.['filename_disk']) post['image'] = post['image']['filename_disk']
      posts.push(post)
    }

    page++
  }
  return posts
}

export default async function () {
  return await fetchAllPosts()
}