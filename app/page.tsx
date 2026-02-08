import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Main from './Main'
import speakingData from '@/data/speakingData.json'
import { findNextUpcomingTalk } from '@/lib/talks'

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  const nextTalk = findNextUpcomingTalk(speakingData.talks)
  const upcomingTalk = nextTalk
    ? {
        ...nextTalk.talk,
        events: [nextTalk.event],
      }
    : null

  return <Main posts={posts} upcomingTalk={upcomingTalk} />
}
