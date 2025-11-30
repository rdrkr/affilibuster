// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Team Section Component
 *
 * Renders a grid of team member cards with profile pictures, names, roles, and social links.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header composite for section title.
 */

'use client'

import Link from 'next/link'

import { CMSIcon, CMSImage, Header } from '@/components/elements'
import { DirectionEnum, type SectionsTeamGridEntry } from '@/lib/generated/types.gen'

/**
 * Props for the TeamSection component
 */
export interface TeamSectionProps {
  /** Team grid section data from CMS */
  data: SectionsTeamGridEntry & {
    __component: 'sections.team-grid'
  }
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Team section displaying team member cards.
 * @param props - Component props with CMS section data
 * @param props.data - Team grid section data from CMS
 * @param props.direction - Language direction for RTL support
 * @returns Team section component or null if no team members
 */
export function TeamSection({ data, direction }: TeamSectionProps) {
  const { header, team_members } = data

  // Don't render if no team members
  if (!team_members || team_members.length === 0) {
    return null
  }

  return (
    <section aria-label={header.header?.ariaDescription ?? ''}>
      <Header
        data={header}
        level={2}
        className="mb-12"
        headerClassName="text-3xl text-white"
        subheaderClassName="mx-auto max-w-2xl text-lg text-text-secondary-dark"
        direction={direction}
      />

      <div
        className={`
          grid grid-cols-1 gap-8
          sm:grid-cols-2
          lg:grid-cols-3
        `}
      >
        {team_members.map(member => (
          <div
            key={member.documentId}
            className={`
              group overflow-hidden rounded-xl border border-white/5
              bg-surface-dark p-6 text-center transition-all
              hover:border-primary/30
            `}
          >
            {/* Profile Picture */}
            <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-tertiary-700">
              {member.profilePicture ? (
                <CMSImage
                  image={member.profilePicture}
                  fallbackAlt={member.name}
                  className="h-full w-full object-cover"
                  fill
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-text-secondary-dark">
                  {member.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
              )}
            </div>

            {/* Name */}
            <h3 className="mb-1 text-xl font-bold text-white">{member.name}</h3>

            {/* Role */}
            <p className="mb-4 text-sm font-medium text-primary">{member.role}</p>

            {/* Bio */}
            {member.bio && <p className="mb-4 line-clamp-3 text-sm text-text-secondary-dark">{member.bio}</p>}

            {/* Social Links */}
            <div className="flex justify-center gap-3">
              {member.twitter && (
                <Link
                  href={`https://twitter.com/${member.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary-dark transition-colors hover:text-primary"
                  aria-label={`${member.name} on Twitter`}
                >
                  <CMSIcon icon="open_in_new" size="md" />
                </Link>
              )}
              {member.linkedin && (
                <Link
                  href={`https://linkedin.com/in/${member.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary-dark transition-colors hover:text-primary"
                  aria-label={`${member.name} on LinkedIn`}
                >
                  <CMSIcon icon="work" size="md" />
                </Link>
              )}
              {member.github && (
                <Link
                  href={`https://github.com/${member.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary-dark transition-colors hover:text-primary"
                  aria-label={`${member.name} on GitHub`}
                >
                  <CMSIcon icon="code" size="md" />
                </Link>
              )}
              {member.instagram && (
                <Link
                  href={`https://instagram.com/${member.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary-dark transition-colors hover:text-primary"
                  aria-label={`${member.name} on Instagram`}
                >
                  <CMSIcon icon="photo_camera" size="md" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TeamSection
