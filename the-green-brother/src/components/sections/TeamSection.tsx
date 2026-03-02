// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Team Section Component
 *
 * Renders a horizontal scrollable carousel of team member cards.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header composite for section title.
 */

import { Header } from '@/components/elements'
import { ContributorCard } from '@/components/elements/ContributorCard'
import { Carousel } from '@/components/layout'
import { ApiContributorContributorDocument, DirectionEnum, type SectionsTeamGridEntry } from '@/lib/generated/types.gen'

/**
 * Props for the TeamSection component
 */
export interface TeamSectionProps {
  /** Team grid section data from CMS */
  data: SectionsTeamGridEntry & {
    __component: 'sections.team-grid'
  }
  contributors: ApiContributorContributorDocument[]
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Formats role names with proper separators.
 * Uses ", " between roles and " & " before the last role.
 * @param roles - Array of role names
 * @returns Formatted role string (e.g., "CEO", "CEO & Founder", "CEO, Founder & Artist")
 */
function formatRoles(roles: string[]): string {
  if (roles.length === 0) return ''
  if (roles.length === 1) return roles[0] ?? ''
  if (roles.length === 2) return `${roles[0] ?? ''} & ${roles[1] ?? ''}`
  const lastRole = roles[roles.length - 1] ?? ''
  return `${roles.slice(0, -1).join(', ')} & ${lastRole}`
}

/**
 * Team section with horizontal scrollable carousel.
 * @param props - Component props with CMS section data
 * @param props.data - Team grid section data from CMS
 * @param props.contributors - Array of team members
 * @param props.direction - Language direction for RTL support
 * @returns Team section component or null if no team members
 */
export function TeamSection({ data, contributors, direction }: TeamSectionProps) {
  const { header } = data

  // Don't render if no team members
  if (contributors.length === 0) {
    return null
  }

  // Transform members to format their roles
  const membersWithFormattedRoles = contributors.map(member => {
    const roles = member.roles
    const roleNames = roles.map(role => role.name)
    const firstRole = roles[0]

    // Create a new member object with formatted roles
    if (roleNames.length > 0 && firstRole) {
      return {
        ...member,
        roles: [{ ...firstRole, name: formatRoles(roleNames) }],
      }
    }

    // Return member as-is if no roles to format
    return member
  })

  return (
    <section aria-label={header.header?.ariaDescription ?? ''}>
      <Header data={header} level={2} direction={direction} />

      {/* Horizontal scroll carousel */}
      <Carousel direction={direction} className="mt-8">
        {membersWithFormattedRoles.map(member => (
          <ContributorCard key={member.documentId} member={member} direction={direction} />
        ))}
      </Carousel>
    </section>
  )
}

export default TeamSection
