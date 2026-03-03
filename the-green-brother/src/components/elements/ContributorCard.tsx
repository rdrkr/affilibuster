// Copyright (c) 2026 Affilibuster by Ronen Druker.

import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  type ApiContributorContributorDocument,
} from '@/lib/generated/types.gen'
import { ButtonLink } from './ButtonLink'
import { Card, type CardLayout, type CardSize, type CardSizeModifier } from './Card'
import { Header } from './Header'
import { Text } from './Text'

/**
 * Props for the ContributorCard component
 */
export interface ContributorCardProps {
  /** Team member document from CMS */
  member: ApiContributorContributorDocument
  /** Language direction for RTL support */
  direction: DirectionEnum
  /** Additional CSS classes */
  className?: string
  /** Card size */
  size?: CardSize
  /** Card layout */
  layout?: CardLayout
  /** Card width */
  width?: CardSizeModifier
  /** Card height */
  height?: CardSizeModifier
}

/**
 * Contributor Card Component
 *
 * A specialized card for displaying team contributor profiles.
 * Features a circular centered image and centered content.
 * Wraps the generic Card component with profile-specific styling.
 * @param props - Component props
 * @param props.member - Team member data
 * @param props.direction - Language direction
 * @param props.className - Additional CSS classes
 * @param props.size - Card size (default: 'md')
 * @param props.layout - Card layout (default: 'ttb')
 * @param props.width - Card width
 * @param props.height - Card height
 * @returns ContributorCard component
 */
export function ContributorCard({
  member,
  direction,
  className = '',
  size = 'md',
  layout = 'ttb',
  width = 'fixed',
  height = 'fixed',
}: ContributorCardProps) {
  const isHorizontalLayout = layout === 'ltr' || layout === 'rtl'
  const profileContainerClass = `
    ${size === 'xs' || size === 'sm' ? 'border-none! bg-transparent! p-0 shadow-none!' : ''}
  `

  const roleLabels = member.roles.map(role => role.name).join(', ')
  const isXs = size === 'xs'
  const isSm = size === 'sm'

  const fullName = member.lastName ? `${member.firstName} ${member.lastName}` : member.firstName

  const header = (
    <Header
      data={{
        header: {
          text: fullName,
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: fullName,
        },
        ...(!isXs && roleLabels
          ? {
              subheader: {
                text: roleLabels,
                iconPosition: IconPositionEnum.BEFORE_TEXT,
                ariaDescription: roleLabels,
              },
            }
          : {}),
        alignment: isHorizontalLayout ? AlignmentEnum.LANGUAGE_DIRECTION : AlignmentEnum.CENTER,
        promoteHeaderIcon: false,
      }}
      level={isXs ? 6 : 4}
      direction={direction}
      headerClassName={`
        ${
          isXs
            ? 'mb-0! text-sm! font-medium text-neutral-500 dark:text-tertiary-400 whitespace-normal'
            : 'text-lg text-neutral-800 dark:text-white'
        }
      `}
      subheaderClassName="text-sm font-medium mt-0!"
      subheaderTextClassName="text-primary-600 text-shadow-sm dark:text-primary dark:text-shadow-none"
    />
  )

  const content = member.bio && (
    <Text
      text={member.bio}
      as="p"
      className={`
        mt-2 line-clamp-3 text-sm
        text-neutral-600 dark:text-text-secondary-dark
        ${isHorizontalLayout ? 'text-start' : 'text-center'}
      `}
    />
  )

  const hasSocialLinks = member.twitter || member.linkedin || member.github || member.instagram ? true : false

  const footer = hasSocialLinks && (
    <div
      className={`
        mt-auto flex gap-3
        ${isHorizontalLayout ? 'justify-start' : 'justify-center'}
      `}
    >
      {member.twitter && (
        <ButtonLink
          data={{
            url: `https://x.com/${member.twitter}`,
            openInNewTab: true,
            label: {
              text: '',
              icon: 'x.svg',
              iconPosition: IconPositionEnum.BEFORE_TEXT,
              ariaDescription: `${fullName} on X`,
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
              ariaDescription: `${fullName} on LinkedIn`,
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
              ariaDescription: `${fullName} on GitHub`,
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
              ariaDescription: `${fullName} on Instagram`,
            },
          }}
          direction={direction}
          variant="link-2"
          iconSize="md"
          maskedIcon={true}
        />
      )}
    </div>
  )

  const profilePicturePlaceholderTextSizes: Record<CardSize, string> = {
    xs: 'text-md',
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
  }

  const profilePicturePlaceholder = member.profilePicture ? null : (
    <div
      className={`
        ${profilePicturePlaceholderTextSizes[size]}
        absolute inset-0 flex items-center justify-center
        bg-neutral-200 font-bold text-neutral-400
        dark:bg-tertiary-700 dark:text-text-secondary-dark
      `}
    >
      {fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()}
    </div>
  )

  const contentFooter = (
    <div className="flex flex-col gap-3">
      {content}
      {footer}
    </div>
  )

  return (
    <Card
      direction={direction}
      href="#"
      asLink={false}
      size={size}
      layout={layout}
      width={width}
      height={height}
      imageShape="circle"
      className={`${profileContainerClass} ${className}`}
      image={member.profilePicture}
      noAnimation={true}
      imageOverlay={profilePicturePlaceholder}
      header={isXs ? undefined : header}
      content={isXs ? header : isSm ? contentFooter : content}
      footer={isXs || isSm ? undefined : footer}
    />
  )
}
