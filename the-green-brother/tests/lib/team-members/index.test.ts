// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/team-members barrel exports
 */

import * as teamMembers from '@/lib/team-members'

describe('lib/team-members barrel exports', () => {
  it('should export getTeamMembers function', () => {
    expect(teamMembers.getTeamMembers).toBeDefined()
    expect(typeof teamMembers.getTeamMembers).toBe('function')
  })

  it('should export getTeamMemberById function', () => {
    expect(teamMembers.getTeamMemberById).toBeDefined()
    expect(typeof teamMembers.getTeamMemberById).toBe('function')
  })
})
