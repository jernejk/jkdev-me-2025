interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'efcore-bench-lab',
    description:
      'EF Core benchmarking experiments focused on query behavior, performance bottlenecks, and practical optimization.',
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
