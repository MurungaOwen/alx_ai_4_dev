/**
 * User-related API functions
 */

export interface VotingHistory {
  id: string
  created_at: string
  poll: {
    id: string
    title: string
    description: string | null
    status: string
    creator: {
      full_name: string | null
      avatar_url: string | null
    }
  }
  selected_option: {
    id: string
    text: string
  }
}

export interface VotingHistoryResponse {
  votes: VotingHistory[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface UserStats {
  polls_created: number
  votes_cast: number
  total_votes_received: number
  bookmarks_count: number
}

/**
 * Fetch user's voting history
 */
export async function getUserVotingHistory(params?: {
  limit?: number
  offset?: number
}): Promise<{ success: boolean; data?: VotingHistoryResponse; error?: string }> {
  try {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const response = await fetch(`/api/user/votes?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || 'Failed to fetch voting history' }
    }

    const result = await response.json()
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Error fetching voting history:', error)
    return { success: false, error: 'Network error while fetching voting history' }
  }
}

/**
 * Fetch user statistics
 */
export async function getUserStats(): Promise<{ success: boolean; data?: UserStats; error?: string }> {
  try {
    const response = await fetch('/api/user/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || 'Failed to fetch user statistics' }
    }

    const result = await response.json()
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return { success: false, error: 'Network error while fetching user statistics' }
  }
}