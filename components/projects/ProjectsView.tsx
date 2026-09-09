'use client'

import { useState } from 'react'
import ProjectsGrid from './ProjectsGrid'
import type { Project, MenuData, UiText } from '@/lib/types'

/**
 * Thin client wrapper that owns the category filter state.
 *
 * The data itself is fetched on the server and handed down, so this component
 * exists only to hold one piece of interactive state — keeping the server/
 * client boundary as small as possible.
 */
export default function ProjectsView({
  projects,
  categories,
  menuData,
  ui,
}: {
  projects: Project[]
  categories: string[]
  menuData: MenuData
  ui: UiText
}) {
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <ProjectsGrid
      selectedCategory={selectedCategory}
      onFilterChange={setSelectedCategory}
      allProjects={projects}
      categories={categories}
      menuData={menuData}
      ui={ui}
    />
  )
}
