// Facts about Agustin shown on the site. The front page renders these, and m0tz's chat
// (functions/api/chat.ts) uses the same data, so the two never disagree.

export const schools = [
  {
    icon: '🐍',
    title: 'Python sorcery',
    summary: 'Python, Django, Flask and FastAPI first and foremost. Plus async, multiprocessing, data processing, Pandas.',
  },
  {
    icon: '🖥️',
    title: 'Frontend enchantment',
    summary: 'TypeScript, React, Vue, and interfaces that talk to all those APIs.',
  },
  {
    icon: '☁️',
    title: 'Cloud alchemy',
    summary: 'AWS, S3, EC2, RDS, IAM, queues and event-driven systems.',
  },
  {
    icon: '🧱',
    title: 'Container necromancy',
    summary: 'Docker, Kubernetes, Terraform, deployments that somehow work despite nobody completely understanding why.',
  },
  {
    icon: '📨',
    title: 'Message-passing mysticism',
    summary: 'Kafka, RabbitMQ, SQS, WebSockets, real-time processing.',
  },
  {
    icon: '🧠',
    title: 'AI summoning',
    summary: 'Claude, Codex, Copilot, you name it.',
  },
  {
    icon: '🏦',
    title: 'Financial dark arts',
    summary: 'Loan risk, fraud/AML processes, direct debits, millions of financial records.',
  },
  {
    icon: '🎛️',
    title: 'DAW wizardry',
    summary: 'REAPER + Lua + FastAPI + an AI agent that actually manipulates tracks.',
  },
  {
    icon: '🔌',
    title: '"Let\'s just connect it" engineering',
    summary: 'Bluetooth/Wi-Fi detection, OCR, external systems, APIs, legacy enterprise software.',
  },
  {
    icon: '🩹',
    title: 'Production archaeology',
    summary: 'Taking an existing system nobody wants to touch and figuring out why the hell it works.',
  },
] as const

// His main stack, in order. Always lead with these when someone asks what he works with.
export const coreStack = ['Python', 'Django', 'Flask', 'FastAPI', 'TypeScript', 'React', 'Vue'] as const

export const faq = [
  {
    question: 'Why the technovoodoo branding?',
    answer:
      'Because "Software Engineer" is boring, and most of what happens in production feels like magic anyway. Might as well lean into it.',
  },
  {
    question: 'So you actually know what you\'re doing, or...?',
    answer:
      'Mostly. 10+ years of production systems, 10 million+ records, millions in financial transactions. The API jokes are real, the wins are real, the production archaeology is very real.',
  },
  {
    question: 'Why Python, AWS, Docker, and "questionable persistence"?',
    answer:
      'Python is readable and gets stuff done. AWS scales without breaking. Docker makes deployments less terrifying. And "questionable persistence" is a fancy way of saying I\'ve built systems that work despite architectural decisions that made architects cry.',
  },
] as const

export const contact = {
  name: 'Agustin Enriquez',
  title: 'Technovoodoo Practitioner',
  location: 'Buenos Aires, Argentina',
  email: 'cagustinenriquez@gmail.com',
  linkedin: 'https://www.linkedin.com/in/agustin-e-00205055/',
  summary:
    '10+ years of Python sorcery, AWS cloud alchemy, and production archaeology. Open to remote work across US, EU, and Asia timezones.',
  headline: "Give me a messy real-world problem and enough Python, and I'll eventually make it an API.",
  lede: '10+ years of summoning solutions from Python, AWS, Docker, and questionable persistence. Backend sorcery, cloud alchemy, and the occasional dark arts involving financial records and DAW automation.',
  coreSpell: [
    'Take an impossible requirement, a production database, and a coffee machine.',
    'Apply Python, cloud infrastructure, and mild chaos engineering.',
    'Ship something that somehow works and nobody dares to refactor.',
  ],
} as const

// Client work is private: m0tz can mention it but has no names or details to share.
export const clientWork = 'He has built several API projects for private clients.'

export interface Project {
  name: string
  summary: string
  url: string
  icon?: string // image in public/, shown on the Apps page
  tags?: readonly string[]
  download?: string // page with every download (e.g. GitHub releases)
  // Public GitHub repo ("owner/name"): the Apps page reads its latest release and shows
  // install buttons for the installers it finds there
  releases?: string
  snapStore?: string // Snap Store name: adds a Snap Store button (used instead of a raw .snap file)
}

// Side projects m0tz can talk about, also listed on the Apps page (newest first).
// Keep each summary to what the project actually does.
export const projects: readonly Project[] = [
  {
    name: 'OkNetwork (knet)',
    summary:
      'A desktop app that watches remote job boards and sends a notification when a new posting matches your skills, desired roles, experience and location. Scores every job 0–100 and tracks your applications on a board.',
    url: 'https://github.com/cagustinenriquez/knet',
    icon: '/apps/knet.png',
    tags: ['Electron', 'Desktop', 'Linux', 'macOS'],
    download: 'https://github.com/cagustinenriquez/knet/releases/latest',
    releases: 'cagustinenriquez/knet',
    snapStore: 'oknetwork',
  },
  {
    name: 'ScreenRec Lite',
    summary:
      'A minimal screen recorder for Linux that records system audio, not your mic. Pick which apps to capture sound from (Firefox, Zoom, Discord, Spotify and more) with per-app checkboxes.',
    url: 'https://github.com/cagustinenriquez/minimal-screen-recorder',
    icon: '/apps/screenrec.svg',
    tags: ['Python', 'FFmpeg', 'Linux'],
    snapStore: 'screenrec-lite',
  },
  {
    name: 'django-register-tags',
    summary: 'A VS Code extension that makes registering Django models in the admin quick and easy.',
    url: 'https://github.com/agustinenriquez/django-register-tags',
    tags: ['VS Code', 'Django'],
  },
]
