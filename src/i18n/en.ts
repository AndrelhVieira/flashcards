import type { Messages } from './pt'

const days = (n: number) => (n === 1 ? '1 day' : `${n} days`)

export const en: Messages = {
  days,
  reviewWhen: (diff: number) => {
    if (diff < 0) return `overdue by ${days(-diff)}`
    if (diff === 0) return 'today'
    if (diff === 1) return 'tomorrow'
    return `in ${days(diff)}`
  },
  language: { switchTo: 'Português', switchLabel: 'View in Portuguese' },
  common: {
    loading: 'Loading',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    all: 'All',
    categories: 'Categories',
    reviewIn: 'Review in',
  },
  config: {
    title: 'Setup pending',
    before: 'Set the ',
    middle: ' variables (see ',
    after: ' and the README).',
  },
  dashboard: {
    offline: 'Offline',
    importConfirm: (cards: number, categories: number) =>
      `Import ${cards} cards${categories > 0 ? ` and ${categories} categories` : ''} into your account? Items with the same id will be updated.`,
    invalidBackup: 'Invalid file. Use a backup exported by this app.',
    legacy: (n: number) =>
      `We found ${n} ${n === 1 ? 'card saved' : 'cards saved'} in this browser. Do you want to send them to your account?`,
    discard: 'Discard',
    import: 'Import',
    close: 'Close',
    tabStudy: 'Study',
    tabCards: 'My cards',
    studyFilter: 'Review categories',
    newCard: 'New flashcard',
    addCard: 'Add card',
  },
  menu: {
    account: 'Account menu',
    export: 'Export backup',
    import: 'Import backup',
    logout: 'Sign out',
  },
  form: {
    title: 'Title (front)',
    titlePlaceholder: 'E.g.: What is a closure in JavaScript?',
    description: 'Description (back)',
    descriptionPlaceholder: 'The answer or explanation you want to memorize…',
  },
  list: {
    empty: 'No cards yet. Create the first one above!',
    search: (n: number) => `Search ${n} cards…`,
    searchLabel: 'Search cards',
    filter: 'Filter by category',
    notFound: 'No cards found.',
    review: (when: string) => `Review ${when}`,
    interval: (intervalDays: number, reviews: number) =>
      `Interval: ${days(intervalDays)} · ${reviews} ${reviews === 1 ? 'review' : 'reviews'}`,
    studyNow: 'Review today',
    edit: 'Edit',
    confirmDelete: (title: string) => `Delete the card "${title}"?`,
  },
  categories: {
    nameRequired: 'Enter a name.',
    nameTaken: 'A category with this name already exists.',
    confirmDelete: (name: string, used: number) =>
      `Delete the category "${name}"?${used > 0 ? ` It will be removed from ${used} ${used === 1 ? 'card' : 'cards'}, which will not be deleted.` : ''}`,
    placeholder: 'New category, e.g.: JavaScript',
    newNameLabel: 'New category name',
    create: 'Create',
    empty: 'Create categories to group your cards and review by subject.',
    renameLabel: (name: string) => `New name for ${name}`,
    count: (n: number) => `${n} ${n === 1 ? 'card' : 'cards'}`,
    rename: 'Rename',
    renameAria: (name: string) => `Rename ${name}`,
    deleteAria: (name: string) => `Delete ${name}`,
  },
  interval: { suggested: 'Suggested' },
  study: {
    doneFiltered: 'Categories all caught up!',
    done: 'All caught up!',
    reviewed: (n: number) => `You reviewed ${n} ${n === 1 ? 'card' : 'cards'} this session.`,
    noneFiltered: 'No cards from these categories to review today.',
    none: 'No cards to review today.',
    reviewAll: 'Review all categories',
    manage: 'Manage cards',
    remaining: (n: number) => (n === 1 ? '1 card left' : `${n} cards left`),
    showFront: 'Show front',
    showAnswer: 'Show answer',
    question: 'Question',
    hint: 'Click or press space to see the answer',
    answer: 'Answer',
    how: 'How did it go? Choose when to review it again:',
    miss: 'Missed',
    hard: 'Hard',
    hit: 'Got it',
    custom: 'Choose another interval',
  },
  sync: {
    cardsLoad: 'Could not load your cards.',
    cardsSave: 'Could not save a change. Check the data and try again.',
    categoriesSave: 'Could not save a change to the categories. Try again.',
  },
  landing: {
    title: 'Flashcards — truly free',
    nav: {
      label: 'Sections',
      how: 'How it works',
      benefits: 'Benefits',
      features: 'Features',
      enter: 'Sign in',
      open: 'Open the app',
    },
    hero: {
      eyebrow: 'Spaced repetition · 100% free',
      titleLead: 'Remember what you studied.',
      titleEm: 'Without paying a thing.',
      lead: 'A no-nonsense flashcards app: you write the card, it tells you when to review. No ads, no subscription and no catches.',
      start: 'Get started',
      seeHow: 'See how it works',
      error: 'Could not sign in with Google. Try again.',
    },
    free: {
      label: 'What you will not find here',
      points: ['No ads', 'No subscription', 'No paid plan', 'No tracking'],
    },
    how: {
      title: 'How it works',
      createTitle: 'Create the card',
      createText: 'Write the question on the front, the answer on the back and choose in how many days to review it.',
      studyTitle: 'Study what is due',
      studyText: 'The Study tab shows only today’s cards. Tap to flip and check whether you remembered.',
      answerTitle: 'Answer honestly',
      missText: 'comes back tomorrow,',
      hardText: 'keeps the interval and',
      hitText: 'climbs one step up the ladder:',
      ladderLabel: 'Review intervals in days',
      dayUnit: (n: number) => (n === 1 ? 'day' : 'days'),
    },
    benefits: {
      title: 'Why use it',
      items: [
        {
          title: 'Truly free',
          text: 'Every feature unlocked for everyone. There is no “pro” version and no hidden limit.',
        },
        {
          title: 'Phone and computer in sync',
          text: 'Sign in with your Google account and your cards show up instantly on any device.',
        },
        {
          title: 'Works offline',
          text: 'Study on the subway or on a plane. Whatever you do offline syncs on its own when you are back online.',
        },
        {
          title: 'Installs like an app',
          text: 'Tap “Add to Home Screen” and it opens full screen, like any other app, no store needed.',
        },
        {
          title: 'Categories and focused study',
          text: 'Organize your cards into as many categories as you want and review only what matters for tomorrow’s exam.',
        },
        {
          title: 'Your cards are yours',
          text: 'Make a copy of everything whenever you want and restore it later. You are never locked in.',
        },
        {
          title: 'Private by default',
          text: 'Nobody but you sees your cards, nothing is tracked and, when you sign out, nothing stays on the device.',
        },
        {
          title: 'Simple to use',
          text: 'Front, back and when to review. No mysterious formula: you always know when a card comes back.',
        },
        {
          title: 'Light and fast',
          text: 'Opens in an instant, even on a basic phone, and follows your device’s light or dark theme.',
        },
      ],
    },
    features: {
      title: 'Everything inside',
      intro: 'No locked features: as soon as you sign in, you get all of this to organize and track your studies.',
      items: [
        ['Study', 'Only the cards due today, one at a time. Flip, check and say how it went.'],
        ['My cards', 'Search any card, filter by category, edit or delete it in a few taps.'],
        ['Review early', 'Exam coming up? Bring a card’s review forward without waiting for its day.'],
        ['Your own interval', 'Use the 1 to 60 day ladder or choose yourself when the card comes back.'],
        ['Categories', 'Create your own, put a card in several and study one or more at a time.'],
        ['Backup', 'Download all your cards and categories to a file and restore them whenever you want.'],
      ],
    },
    closing: {
      title: 'Your next card takes ten seconds.',
      signIn: 'Sign in with Google',
    },
    footer: 'Flashcards · a personal project by ',
    portfolio: 'See André Vieira’s portfolio',
  },
  demo: {
    label: 'Interactive demo',
    cards: [
      {
        front: 'What is spaced repetition?',
        back: 'Reviewing something at ever longer intervals, right before you would forget it.',
      },
      {
        front: 'How much does this app cost?',
        back: 'Nothing. No ads, no subscription and no feature hidden behind a paid plan.',
      },
      {
        front: 'Does it work without internet?',
        back: 'Yes. Study offline and everything syncs on its own when the connection is back.',
      },
      {
        front: 'Are my cards stuck here?',
        back: 'No. Make a copy of all your cards whenever you want and take them wherever you need.',
      },
    ],
    questionAria: (front: string) => `Question: ${front}. Tap to see the answer.`,
    answerAria: (back: string) => `Answer: ${back}`,
    frontTag: (interval: number) => `Front · reviewed every ${days(interval)}`,
    hint: 'tap to flip',
    backTag: 'Back',
    feedback: (interval: number) => (interval === 1 ? 'Back tomorrow.' : `Back in ${days(interval)}.`),
    idle: 'Try it: flip the card and answer.',
  },
}
