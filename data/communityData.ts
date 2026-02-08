interface Community {
  name: string
  description: string
  role: string
  href: string
  meetupUrl?: string
}

const communityData: Community[] = [
  {
    name: 'Build Club Brisbane',
    description:
      'Community for builders and makers exploring AI, automation, and product experiments in Brisbane.',
    role: 'Member',
    href: 'https://www.buildclub.ai/',
    meetupUrl: 'https://www.meetup.com/build-club-brisbane/',
  },
  {
    name: 'AI Hack Day',
    description:
      'Hands-on AI hackathon events where developers build practical projects in a day.',
    role: 'Co-organizer',
    href: 'https://aihackday.com/',
  },
  {
    name: 'Brisbane AI User Group',
    description:
      'Local meetup for AI practitioners and developers to share lessons, tools, and real-world usage.',
    role: 'Organizer',
    href: 'https://www.meetup.com/brisbane-ai-user-group/',
  },
  {
    name: 'Global AI Podcast',
    description:
      'Podcast covering AI topics, community stories, and practical insights for working developers.',
    role: 'Co-organizer',
    href: 'https://globalai.community/podcast/',
  },
]

export default communityData
