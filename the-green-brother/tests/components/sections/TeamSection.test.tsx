// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for TeamSection component
 */

import { render, screen } from '@testing-library/react'

import { TeamSection, type TeamSectionProps } from '@/components/sections/TeamSection'
import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  type PluginUploadFileDocument,
} from '@/lib/generated/types.gen'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: { src: string; alt: string; className?: string }) {
    return <img src={props.src} alt={props.alt} className={props.className} />
  },
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({
    children,
    href,
    target,
    rel,
    className,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    href: string
    target?: string
    rel?: string
    className?: string
    'aria-label'?: string
  }) {
    return (
      <a href={href} target={target} rel={rel} className={className} aria-label={ariaLabel}>
        {children}
      </a>
    )
  },
}))

// Mock API client
jest.mock('@/lib/content/api', () => ({
  getContributors: jest.fn(),
}))

// Mock the CMS element components
jest.mock('@/components/elements', () => ({
  Icon: function MockIcon({ icon, size, className }: { icon: string; size?: string; className?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size} className={className}>
        {icon}
      </span>
    )
  },
  Image: function MockImage({ image }: { image?: PluginUploadFileDocument | null }) {
    const url = image?.url ?? '/images/placeholder.svg'
    const alt = image?.alternativeText ?? ''

    return <img data-testid="mock-image" src={url} alt={alt} />
  },
  Header: function MockHeader({
    data,
  }: {
    data: { header?: { text?: string; ariaDescription?: string }; subheader?: { text?: string } }
  }) {
    return (
      <div data-testid="mock-header">
        <h2>{data.header?.text}</h2>
        {data.subheader?.text && <p>{data.subheader.text}</p>}
      </div>
    )
  },
  Card: function MockCard({
    children,
    image,
    imageOverlay,
    header,
    content,
    footer,
  }: {
    children?: React.ReactNode
    image?: PluginUploadFileDocument | null
    imageOverlay?: React.ReactNode
    header?: React.ReactNode
    content?: React.ReactNode
    footer?: React.ReactNode
  }) {
    return (
      <div data-testid="mock-card">
        {image ? (
          <img
            data-testid="mock-image"
            src={image.url || '/images/placeholder.svg'}
            alt={image.alternativeText ?? ''}
          />
        ) : (
          imageOverlay
        )}
        {header}
        {content}
        {footer}
        {children}
      </div>
    )
  },
  ButtonLink: function MockButtonLink({
    data,
    maskedIcon,
  }: {
    data?: {
      url?: string
      openInNewTab?: boolean
      label?: { text?: string; icon?: string; ariaDescription?: string }
    }
    maskedIcon?: boolean
  }) {
    if (!data?.url) return null
    return (
      <a
        href={data.url}
        target={data.openInNewTab ? '_blank' : undefined}
        rel={data.openInNewTab ? 'noopener noreferrer' : undefined}
        aria-label={data.label?.ariaDescription}
        data-testid="mock-button-link"
        data-masked={maskedIcon ? 'true' : 'false'}
      >
        {data.label?.icon && <span data-testid="mock-icon">{data.label.icon}</span>}
      </a>
    )
  },
  Carousel: function MockCarousel({ children, ariaLabel }: { children: React.ReactNode; ariaLabel?: string }) {
    return (
      <div
        data-testid="mock-carousel"
        className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto"
        role={ariaLabel ? 'region' : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    )
  },
}))
// Mock ContributorCard
jest.mock('@/components/elements/ContributorCard', () => ({
  ContributorCard: function MockContributorCard({ member }: { member: any }) {
    const fullName = member?.lastName ? `${member.firstName} ${member.lastName}` : (member?.firstName ?? '')
    return (
      <div data-testid="contributor-card">
        <div>{fullName}</div>
        <div>{member.roles?.[0]?.name}</div>
        <div>{member.bio}</div>
        {member.profilePicture ? (
          <img data-testid="mock-image" src={member.profilePicture.url} alt={member.profilePicture.alternativeText} />
        ) : (
          <div>
            {fullName
              ? fullName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
              : ''}
          </div>
        )}
        {member.twitter && <a href={`https://x.com/${member.twitter}`}>John Doe on X</a>}
        {member.linkedin && <a href={`https://linkedin.com/in/${member.linkedin}`}>John Doe on LinkedIn</a>}
        {member.github && <a href={`https://github.com/${member.github}`}>John Doe on GitHub</a>}
        {member.instagram && <a href={`https://instagram.com/${member.instagram}`}>John Doe on Instagram</a>}
      </div>
    )
  },
}))

describe('TeamSection', () => {
  const mockContributor = {
    documentId: 'member-1',
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    slug: 'john-doe',
    roles: [
      {
        documentId: 'role-1',
        id: 1,
        roleId: 'ceo',
        name: 'CEO',
        publishedAt: '2025-01-01',
      },
    ],
    bio: 'A passionate leader focused on sustainability.',
    email: 'john@example.com',
    twitter: 'johndoe',
    linkedin: 'johndoe',
    github: 'johndoe',
    instagram: 'johndoe',
    publishedAt: '2025-01-01',
    profilePicture: {
      documentId: 'img-1',
      id: 1,
      name: 'john.webp',
      alternativeText: 'John Doe profile picture',
      url: '/uploads/john.webp',
      hash: 'john_abc123',
      mime: 'image/webp',
      size: 100,
      provider: 'local',
      publishedAt: '2025-01-01',
    },
  }

  const mockBaseData: TeamSectionProps['data'] = {
    __component: 'sections.team-grid',
    id: 1,
    header: {
      alignment: AlignmentEnum.CENTER,
      promoteHeaderIcon: false,
      header: {
        text: 'Meet Our Team',
        ariaDescription: 'Team section heading',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
      },
      subheader: {
        text: 'The people behind TheGreenBrother',
        ariaDescription: 'Team section subheading',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
      },
    },
  }

  // Cast mockContributor to match ApiContributorContributorDocument strict typing
  const contributors = [mockContributor] as unknown as TeamSectionProps['contributors']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render team section with header', () => {
    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributors} />)

    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Meet Our Team')
  })

  it('should render contributor name and role', () => {
    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributors} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('CEO')).toBeInTheDocument()
  })

  it('should render contributor bio', () => {
    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributors} />)

    expect(screen.getByText('A passionate leader focused on sustainability.')).toBeInTheDocument()
  })

  it('should render profile picture when available', () => {
    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributors} />)

    const image = screen.getByTestId('mock-image')
    expect(image).toHaveAttribute('alt', 'John Doe profile picture')
  })

  it('should render initials when profile picture is not available', () => {
    const memberWithoutPicture = { ...mockContributor }
    delete (memberWithoutPicture as Record<string, unknown>).profilePicture
    const contributorsWithoutPic = [memberWithoutPicture] as unknown as TeamSectionProps['contributors']

    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributorsWithoutPic} />)

    // Should show initials "JD" for John Doe
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should render social links when available', () => {
    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributors} />)

    const xLink = screen.getByRole('link', { name: 'John Doe on X' })
    expect(xLink).toHaveAttribute('href', 'https://x.com/johndoe')

    const linkedinLink = screen.getByRole('link', { name: 'John Doe on LinkedIn' })
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/johndoe')

    const githubLink = screen.getByRole('link', { name: 'John Doe on GitHub' })
    expect(githubLink).toHaveAttribute('href', 'https://github.com/johndoe')

    const instagramLink = screen.getByRole('link', { name: 'John Doe on Instagram' })
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/johndoe')
  })

  it('should not render social links when not provided', () => {
    const memberWithoutSocials = {
      documentId: 'member-1',
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      slug: 'john-doe',
      roles: [{ documentId: 'role-1', id: 1, roleId: 'ceo', name: 'CEO', publishedAt: '2025-01-01' }],
      bio: 'A passionate leader focused on sustainability.',
      email: 'john@example.com',
      publishedAt: '2025-01-01',
      profilePicture: mockContributor.profilePicture,
    }
    const contributorsNoSocials = [memberWithoutSocials] as unknown as TeamSectionProps['contributors']

    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributorsNoSocials} />)

    expect(screen.queryByRole('link', { name: /on X$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /on LinkedIn/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /on GitHub/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /on Instagram/i })).not.toBeInTheDocument()
  })

  it('should return null when no contributors', () => {
    const { container } = render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('should render multiple contributors', () => {
    const multipleContributors = [
      mockContributor,
      {
        ...mockContributor,
        documentId: 'member-2',
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        roles: [{ documentId: 'role-2', id: 2, roleId: 'cto', name: 'CTO', publishedAt: '2025-01-01' }],
      },
      {
        ...mockContributor,
        documentId: 'member-3',
        id: 3,
        firstName: 'Bob',
        lastName: 'Jones',
        roles: [{ documentId: 'role-3', id: 3, roleId: 'dev', name: 'Dev', publishedAt: '2025-01-01' }],
      },
      {
        ...mockContributor,
        documentId: 'member-4',
        id: 4,
        firstName: 'Sarah',
        lastName: 'Connor',
        roles: [{ documentId: 'role-4', id: 4, roleId: 'manager', name: 'Manager', publishedAt: '2025-01-01' }],
      },
    ] as unknown as TeamSectionProps['contributors']

    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={multipleContributors} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('Sarah Connor')).toBeInTheDocument()
  })

  it('should render without bio when not provided', () => {
    const contributorNoBio = {
      ...mockContributor,
      bio: '',
    }
    const contributorsNoBio = [contributorNoBio] as unknown as TeamSectionProps['contributors']

    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributorsNoBio} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('A passionate leader focused on sustainability.')).not.toBeInTheDocument()
  })

  it('should have correct aria-label on section', () => {
    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributors} />)

    const section = screen.getByRole('region', { name: 'Team section heading' })
    expect(section).toBeInTheDocument()
  })

  it('should format single role correctly', () => {
    const contributorSingleRole = {
      ...mockContributor,
      roles: [
        {
          documentId: 'role-1',
          id: 1,
          roleId: 'ceo',
          name: 'CEO',
          publishedAt: '2025-01-01',
        },
      ],
    }
    const contributorsSingleRole = [contributorSingleRole] as unknown as TeamSectionProps['contributors']

    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributorsSingleRole} />)

    expect(screen.getByText('CEO')).toBeInTheDocument()
  })

  it('should format two roles with & separator', () => {
    const contributorTwoRoles = {
      ...mockContributor,
      roles: [
        {
          documentId: 'role-1',
          id: 1,
          roleId: 'ceo',
          name: 'CEO',
          publishedAt: '2025-01-01',
        },
        {
          documentId: 'role-2',
          id: 2,
          roleId: 'founder',
          name: 'Founder',
          publishedAt: '2025-01-01',
        },
      ],
    }
    const contributorsTwoRoles = [contributorTwoRoles] as unknown as TeamSectionProps['contributors']

    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributorsTwoRoles} />)

    expect(screen.getByText('CEO & Founder')).toBeInTheDocument()
  })

  it('should format three or more roles with comma and & separators', () => {
    const contributorThreeRoles = {
      ...mockContributor,
      roles: [
        {
          documentId: 'role-1',
          id: 1,
          roleId: 'ceo',
          name: 'CEO',
          publishedAt: '2025-01-01',
        },
        {
          documentId: 'role-2',
          id: 2,
          roleId: 'founder',
          name: 'Founder',
          publishedAt: '2025-01-01',
        },
        {
          documentId: 'role-3',
          id: 3,
          roleId: 'artist',
          name: 'Artist',
          publishedAt: '2025-01-01',
        },
      ],
    }
    const contributorsThreeRoles = [contributorThreeRoles] as unknown as TeamSectionProps['contributors']

    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributorsThreeRoles} />)

    expect(screen.getByText('CEO, Founder & Artist')).toBeInTheDocument()
  })

  it('should return member as-is when roles array is empty (line 74 else branch)', () => {
    const contributorNoRoles = {
      ...mockContributor,
      roles: [],
    }
    const contributorsNoRoles = [contributorNoRoles] as unknown as TeamSectionProps['contributors']

    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributorsNoRoles} />)

    // Should render the member name but no role text
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should display only roles provided (filtering happens in page component)', () => {
    // Note: Role filtering (excluding author/seller) happens in page component before passing to TeamSection
    const contributorWithFilteredRoles = {
      ...mockContributor,
      roles: [
        {
          documentId: 'role-1',
          id: 1,
          roleId: 'ceo',
          name: 'CEO',
          publishedAt: '2025-01-01',
        },
        // Author role already filtered out by about/page.tsx
      ],
    }
    const contributorsFiltered = [contributorWithFilteredRoles] as unknown as TeamSectionProps['contributors']

    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} contributors={contributorsFiltered} />)

    // Should only show "CEO" (author role was filtered by page component before passing to TeamSection)
    expect(screen.getByText('CEO')).toBeInTheDocument()
    expect(screen.queryByText('CEO & Author')).not.toBeInTheDocument()
    expect(screen.queryByText('Author')).not.toBeInTheDocument()
  })
})
