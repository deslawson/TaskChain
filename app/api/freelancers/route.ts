import { NextRequest, NextResponse } from 'next/server'
import { FREELANCERS, FREELANCER_SKILLS } from '@/lib/freelancers'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 6

function parseRating(value: string | null): number | null {
  if (!value) return null
  const rating = Number.parseInt(value, 10)
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null
}

function parsePage(value: string | null): number {
  if (!value) return 1
  const page = Number.parseInt(value, 10)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim().toLowerCase() ?? ''
  const selectedSkills = searchParams
    .getAll('skills')
    .flatMap((value) => value.split(','))
    .map((skill) => skill.trim())
    .filter(Boolean)
  const minimumRating = parseRating(searchParams.get('rating'))
  const page = parsePage(searchParams.get('page'))

  const filtered = FREELANCERS.filter((freelancer) => {
    const matchesQuery =
      !query ||
      [freelancer.name, freelancer.title, freelancer.bio, ...freelancer.skills]
        .join(' ')
        .toLowerCase()
        .includes(query)

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) => freelancer.skills.includes(skill))

    const matchesRating = !minimumRating || freelancer.rating >= minimumRating

    return matchesQuery && matchesSkills && matchesRating
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE

  return NextResponse.json({
    freelancers: filtered.slice(start, start + PAGE_SIZE),
    skills: FREELANCER_SKILLS,
    pagination: {
      page: currentPage,
      pageSize: PAGE_SIZE,
      totalItems: filtered.length,
      totalPages,
    },
  })
}
