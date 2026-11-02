interface Project {
  title: string
  description: string
  href?: string
  liveHref?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: "JK's Arcade",
    description:
      'Small browser games I built with AI coding tools, in one installable app: Piece by Pixel, Tumbleverse, Loose Ends, Prism Pop Painter and Block Loop Shooter. Free, no accounts, and most of them play fine on a phone.',
    imgSrc: '/static/images/projects/jk-arcade.jpg',
    href: 'https://github.com/jernejk/jk-arcade',
    liveHref: 'https://jernejk.github.io/jk-arcade/',
  },
  {
    title: 'talk-deck-template',
    description:
      'AI-first talk decks in plain HTML and CSS: a coding agent builds the slides, QA renders and checks every one, and decks run offline. Seven templates, 63 slide patterns and a live gallery.',
    href: 'https://github.com/jernejk/talk-deck-template',
  },
  {
    title: 'efcore-bench-lab',
    description:
      'EF Core benchmarking experiments focused on query behavior, performance bottlenecks, practical optimization and repeatable coding-agent workflows.',
    href: 'https://github.com/jernejk/efcore-bench-lab',
  },
  {
    title: 'home-automation-offline-gpt',
    description:
      'Offline GPT prototype for home automation, using local models for privacy-first voice and workflow automation.',
    href: 'https://github.com/jernejk/home-automation-offline-gpt',
  },
  {
    title: 'CognitiveServices.Explorer',
    description:
      'Tooling and demos for exploring Microsoft Cognitive Services APIs in practical developer scenarios.',
    href: 'https://github.com/jernejk/CognitiveServices.Explorer',
  },
  {
    title: 'RealTimeFaceApi',
    description:
      'Real-time Face API experimentation with OpenCV and Azure Cognitive Services integrations.',
    href: 'https://github.com/jernejk/RealTimeFaceApi',
  },
]

export default projectsData
