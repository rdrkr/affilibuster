// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for TeamSection component
 */

import { render, screen } from '@testing-library/react'

import { TeamSection, type TeamSectionProps } from '@/components/sections/TeamSection'
import { AlignmentEnum, DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: { src: string; alt: string; className?: string }) {
    // eslint-disable-next-line @next/next/no-img-element
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

// Mock the CMS element components
jest.mock('@/components/elements', () => ({
  CMSIcon: function MockCMSIcon({ icon, size, className }: { icon: string; size?: string; className?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size} className={className}>
        {icon}
      </span>
    )
  },
  CMSImage: function MockCMSImage({
    image,
    fallbackAlt,
  }: {
    image?: { url?: string; alternativeText?: string }
    fallbackAlt?: string
  }) {
    const url = image?.url ?? '/images/placeholder.svg'
    const alt = image?.alternativeText ?? fallbackAlt ?? ''
    // eslint-disable-next-line @next/next/no-img-element
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
}))

describe('TeamSection', () => {
  const mockTeamMember = {
    documentId: 'member-1',
    id: 1,
    name: 'John Doe',
    slug: 'john-doe',
    role: 'CEO',
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
    team_members: [mockTeamMember],
  }

  it('should render team section with header', () => {
    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Meet Our Team')
  })

  it('should render team member name and role', () => {
    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('CEO')).toBeInTheDocument()
  })

  it('should render team member bio', () => {
    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    expect(screen.getByText('A passionate leader focused on sustainability.')).toBeInTheDocument()
  })

  it('should render profile picture when available', () => {
    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const image = screen.getByTestId('mock-image')
    expect(image).toHaveAttribute('alt', 'John Doe profile picture')
  })

  it('should render initials when profile picture is not available', () => {
    const memberWithoutPicture = { ...mockTeamMember }
    delete (memberWithoutPicture as Record<string, unknown>).profilePicture

    const dataWithoutPicture: TeamSectionProps['data'] = {
      ...mockBaseData,
      team_members: [memberWithoutPicture],
    }

    render(<TeamSection direction={DirectionEnum.LTR} data={dataWithoutPicture} />)

    // Should show initials "JD" for John Doe
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should render social links when available', () => {
    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const twitterLink = screen.getByRole('link', { name: 'John Doe on Twitter' })
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/johndoe')
    expect(twitterLink).toHaveAttribute('target', '_blank')
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')

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
      name: 'John Doe',
      slug: 'john-doe',
      role: 'CEO',
      bio: 'A passionate leader focused on sustainability.',
      email: 'john@example.com',
      publishedAt: '2025-01-01',
      profilePicture: mockTeamMember.profilePicture,
    }

    const dataWithoutSocials: TeamSectionProps['data'] = {
      ...mockBaseData,
      team_members: [memberWithoutSocials],
    }

    render(<TeamSection direction={DirectionEnum.LTR} data={dataWithoutSocials} />)

    expect(screen.queryByRole('link', { name: /on Twitter/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /on LinkedIn/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /on GitHub/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /on Instagram/i })).not.toBeInTheDocument()
  })

  it('should return null when no team members', () => {
    const dataWithoutMembers: TeamSectionProps['data'] = {
      ...mockBaseData,
      team_members: [],
    }

    const { container } = render(<TeamSection direction={DirectionEnum.LTR} data={dataWithoutMembers} />)

    expect(container.firstChild).toBeNull()
  })

  it('should return null when team_members is undefined', () => {
    const dataWithUndefinedMembers = {
      ...mockBaseData,
      team_members: [] as (typeof mockTeamMember)[],
    }
    // Delete to simulate undefined
    delete (dataWithUndefinedMembers as Record<string, unknown>).team_members

    const { container } = render(
      <TeamSection direction={DirectionEnum.LTR} data={dataWithUndefinedMembers as TeamSectionProps['data']} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render multiple team members', () => {
    const dataWithMultipleMembers: TeamSectionProps['data'] = {
      ...mockBaseData,
      team_members: [
        mockTeamMember,
        {
          ...mockTeamMember,
          documentId: 'member-2',
          id: 2,
          name: 'Jane Smith',
          role: 'CTO',
        },
      ],
    }

    render(<TeamSection direction={DirectionEnum.LTR} data={dataWithMultipleMembers} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('CEO')).toBeInTheDocument()
    expect(screen.getByText('CTO')).toBeInTheDocument()
  })

  it('should render without bio when not provided', () => {
    const dataWithoutBio: TeamSectionProps['data'] = {
      ...mockBaseData,
      team_members: [
        {
          ...mockTeamMember,
          bio: '',
        },
      ],
    }

    render(<TeamSection direction={DirectionEnum.LTR} data={dataWithoutBio} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('A passionate leader focused on sustainability.')).not.toBeInTheDocument()
  })

  it('should have correct aria-label on section', () => {
    render(<TeamSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const section = screen.getByRole('region', { name: 'Team section heading' })
    expect(section).toBeInTheDocument()
  })
})
