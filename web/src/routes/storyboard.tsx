import { createFileRoute } from '@tanstack/react-router'

import { StoryboardPage } from '@/components/storyboard/storyboard-page'

export const Route = createFileRoute('/storyboard')({
  component: StoryboardPage,
})
