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
    role: 'City Lead',
    href: 'https://www.buildclub.ai/',
    meetupUrl: 'https://www.meetup.com/build-club-brisbane/',
  },
  {
    name: 'Brisbane Full Stack User Group',
    description:
      'Monthly meetup at SSW Brisbane covering .NET, Angular, React, Blazor, Azure, and full-stack development.',
    role: 'Organizer',
    href: 'https://www.ssw.com.au/netug/brisbane',
    meetupUrl: 'https://www.meetup.com/brisbane-full-stack-user-group/',
  },
  {
    name: 'AI Hack Day',
    description:
      'Free, community-run AI hackathons across Australian cities. Presentations, coding challenges, and mentoring — all in a day.',
    role: 'Organizer',
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
