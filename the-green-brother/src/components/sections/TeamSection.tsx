// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Team Section Component
 *
 * Renders a horizontal scrollable carousel of team member cards.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header composite for section title.
 */

import { ButtonLink, Card, Carousel, Header } from '@/components/elements'
import { DirectionEnum, IconPositionEnum, type SectionsTeamGridEntry } from '@/lib/generated/types.gen'

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
 * Team section with horizontal scrollable carousel.
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
      <Header data={header} level={2} direction={direction} />

      {/* Horizontal scroll carousel */}
      <Carousel direction={direction} className="mt-8">
        {team_members.map(member => (
          <Card
            key={member.documentId}
            href="#"
            variant="profile"
            asLink={false}
            image={member.profilePicture}
            imageAlt={member.name}
            imageOverlay={
              !member.profilePicture ? (
                <div
                  className="
                    absolute inset-0 flex items-center justify-center
                    text-4xl font-bold text-neutral-400 dark:text-text-secondary-dark"
                >
                  {member.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
              ) : null
            }
          >
            {/* Name */}
            <h3 className="mb-1 text-lg font-bold text-neutral-800 dark:text-white">{member.name}</h3>

            {/* Role */}
            <p className="mb-3 text-sm font-medium text-primary">{member.role}</p>

            {/* Bio */}
            {member.bio && (
              <p className="mb-4 line-clamp-3 text-sm text-neutral-600 dark:text-text-secondary-dark">{member.bio}</p>
            )}

            {/* Social Links */}
            <div className="mt-auto flex justify-center gap-3">
              {member.twitter && (
                <ButtonLink
                  data={{
                    url: `https://x.com/${member.twitter}`,
                    openInNewTab: true,
                    label: {
                      text: '',
                      icon: 'x.svg',
                      iconPosition: IconPositionEnum.BEFORE_TEXT,
                      ariaDescription: `${member.name} on X`,
                    },
                  }}
                  direction={direction}
                  variant="link-2"
                  iconSize="md"
                  maskedIcon={true}
                />
              )}
              {member.linkedin && (
                <ButtonLink
                  data={{
                    url: `https://linkedin.com/in/${member.linkedin}`,
                    openInNewTab: true,
                    label: {
                      text: '',
                      icon: 'linkedin.svg',
                      iconPosition: IconPositionEnum.BEFORE_TEXT,
                      ariaDescription: `${member.name} on LinkedIn`,
                    },
                  }}
                  direction={direction}
                  variant="link-2"
                  iconSize="md"
                  maskedIcon={true}
                />
              )}
              {member.github && (
                <ButtonLink
                  data={{
                    url: `https://github.com/${member.github}`,
                    openInNewTab: true,
                    label: {
                      text: '',
                      icon: 'github.svg',
                      iconPosition: IconPositionEnum.BEFORE_TEXT,
                      ariaDescription: `${member.name} on GitHub`,
                    },
                  }}
                  direction={direction}
                  variant="link-2"
                  iconSize="md"
                  maskedIcon={true}
                />
              )}
              {member.instagram && (
                <ButtonLink
                  data={{
                    url: `https://instagram.com/${member.instagram}`,
                    openInNewTab: true,
                    label: {
                      text: '',
                      icon: 'instagram.svg',
                      iconPosition: IconPositionEnum.BEFORE_TEXT,
                      ariaDescription: `${member.name} on Instagram`,
                    },
                  }}
                  direction={direction}
                  variant="link-2"
                  iconSize="md"
                  maskedIcon={true}
                />
              )}
            </div>
          </Card>
        ))}
      </Carousel>
    </section>
  )
}

export default TeamSection
