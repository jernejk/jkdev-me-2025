/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: 'Jernej Kavka (JK)',
  author: 'Jernej Kavka',
  headerTitle: 'JK',
  description: 'Microsoft AI MVP - .NET, AI, and speaking',
  language: 'en-US',
  theme: 'system', // system, dark or light
  siteUrl: 'https://jkdev.me',
  siteRepo: 'https://github.com/jernejk/jkdev-me-2025',
  siteLogo: `${process.env.BASE_PATH || ''}/static/images/logo.png`,
  socialBanner: `${process.env.BASE_PATH || ''}/static/images/twitter-card.png`,
  github: 'https://github.com/jernejk',
  x: 'https://x.com/jernej_kavka',
  youtube: 'https://www.youtube.com/channel/UCige1JIdeIc3sYU2HSaismg',
  linkedin: 'https://www.linkedin.com/in/jernejkavka/',
  sessionize: 'https://sessionize.com/jernej-kavka/',
  ssw: 'https://www.ssw.com.au/people/jernej-kavka/',
  mvp: 'https://mvp.microsoft.com/en-US/MVP/profile/a20a7792-5c01-eb11-a815-000d3a8ccaf5',
  locale: 'en-US',
  // set to true if you want a navbar fixed to the top
  stickyNav: false,
  analytics: {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // supports Plausible, Simple Analytics, Umami, Posthog or Google Analytics.
    umamiAnalytics: {
      umamiWebsiteId: process.env.NEXT_UMAMI_ID,
      // Umami Cloud script URL (defaults to Umami Cloud; override if you self-host).
      src: process.env.NEXT_UMAMI_SRC || 'https://cloud.umami.is/script.js',
    },
  },
  newsletter: {
    // supports mailchimp, buttondown, convertkit, klaviyo, revue, emailoctopus, beehive
    // Please add your .env file and modify it according to your selection
    provider: 'buttondown',
  },
  comments: {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // Select a provider and use the environment variables associated to it
    // https://vercel.com/docs/environment-variables
    provider: 'giscus', // supported providers: giscus, utterances, disqus
    giscusConfig: {
      // Visit the link below, and follow the steps in the 'configuration' section
      // https://giscus.app/
      repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
      repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
      category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
      mapping: 'pathname', // supported options: pathname, url, title
      reactions: '1', // Emoji reactions: 1 = enable / 0 = disable
      // Send discussion metadata periodically to the parent window: 1 = enable / 0 = disable
      metadata: '0',
      // theme example: light, dark, dark_dimmed, dark_high_contrast
      // transparent_dark, preferred_color_scheme, custom
      theme: 'light',
      // theme when dark mode
      // `dark_dimmed` tends to blend better with custom dark UIs than `transparent_dark`.
      darkTheme: 'dark_dimmed',
      // If the theme option above is set to 'custom`
      // please provide a link below to your custom theme css file.
      // example: https://giscus.app/themes/custom_example.css
      themeURL: '',
      // This corresponds to the `data-lang="en"` in giscus's configurations
      lang: 'en',
      inputPosition: 'top',
    },
  },
  search: {
    provider: 'kbar', // kbar or algolia
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ''}/search.json`, // path to load documents to search
    },
    // provider: 'algolia',
    // algoliaConfig: {
    //   // The application ID provided by Algolia
    //   appId: 'R2IYF7ETH7',
    //   // Public API key: it is safe to commit it
    //   apiKey: '599cec31baffa4868cae4e79f180729b',
    //   indexName: 'docsearch',
    // },
  },
}

module.exports = siteMetadata
