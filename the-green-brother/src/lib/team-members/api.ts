// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Team Members API Module
 *
 * Provides high-level helper functions for fetching team member data from the backend API.
 * All functions use the strongly-typed apiRequest() from the core client module.
 *
 * Team members represent staff, contributors, or team personnel shown on the site.
 */

import { apiRequest, createApiRequest } from '@/lib/core/client'

import type {
  TeamMemberGetTeamMembersByIdData,
  TeamMemberGetTeamMembersByIdResponses,
  TeamMemberGetTeamMembersData,
  TeamMemberGetTeamMembersResponses,
} from '@/lib/generated/types.gen'

/**
 * Get team members (collection type)
 * @param query - Optional query parameters including locale, filters, pagination, sort, and populate
 * @returns The team members data or null if the request fails
 */
export async function getTeamMembers(
  query?: Omit<NonNullable<TeamMemberGetTeamMembersData['query']>, 'customPopulate'>
): Promise<TeamMemberGetTeamMembersResponses[200] | null> {
  try {
    const request = createApiRequest<TeamMemberGetTeamMembersData>('/team-members', {
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    return await apiRequest<TeamMemberGetTeamMembersResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return null
  }
}

/**
 * Get single team member by ID
 * @param id - Team member document ID
 * @param query - Optional query parameters including locale and populate
 * @returns The team member data or null if the request fails
 */
export async function getTeamMemberById(
  id: string,
  query?: Omit<NonNullable<TeamMemberGetTeamMembersByIdData['query']>, 'customPopulate'>
): Promise<TeamMemberGetTeamMembersByIdResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<TeamMemberGetTeamMembersByIdData>(`/team-members/${id}`, {
      path: { id },
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<TeamMemberGetTeamMembersByIdResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch team member ${id}:`, error)
    return null
  }
}
