type RedditSort = (typeof values)[number]

const values = ['relevance', 'hot', 'top', 'new', 'comments'] as const

const RedditSort = { values }

export { RedditSort }
