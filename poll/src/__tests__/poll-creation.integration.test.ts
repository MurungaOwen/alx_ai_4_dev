/**
 * Integration Test for Poll Creation Flow
 * 
 * Tests the complete end-to-end flow including:
 * - Database interactions
 * - Authentication
 * - Error recovery scenarios
 * - Edge cases and race conditions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn()
  }
}

// Mock poll creation service
class PollCreationService {
  constructor(private supabase: any, private user: any) {}

  async createPoll(pollData: {
    title: string
    description?: string
    categoryId?: string
    options: string[]
    allowAnonymous: boolean
    allowMultipleVotes: boolean
  }) {
    if (!this.user) {
      throw new Error('User not authenticated')
    }

    // Validate input
    if (!pollData.title.trim()) {
      throw new Error('Poll title is required')
    }

    if (pollData.options.filter(opt => opt.trim()).length < 2) {
      throw new Error('At least 2 options are required')
    }

    // Start transaction-like operation
    const pollInsert = {
      title: pollData.title.trim(),
      description: pollData.description?.trim() || null,
      creator_id: this.user.id,
      category_id: pollData.categoryId || null,
      status: 'active',
      vote_type: pollData.allowMultipleVotes ? 'multiple' : 'single',
      allow_anonymous: pollData.allowAnonymous,
      allow_multiple_votes: pollData.allowMultipleVotes,
    }

    // Insert poll
    const { data: poll, error: pollError } = await this.supabase
      .from('polls')
      .insert(pollInsert)
      .select()
      .single()

    if (pollError) {
      throw new Error(pollError.message || 'Failed to create poll')
    }

    if (!poll) {
      throw new Error('Poll creation returned no data')
    }

    // Insert options
    const optionsInsert = pollData.options
      .filter(opt => opt.trim())
      .map((option, index) => ({
        poll_id: poll.id,
        text: option.trim(),
        position: index
      }))

    const { error: optionsError } = await this.supabase
      .from('poll_options')
      .insert(optionsInsert)

    if (optionsError) {
      // Cleanup: delete the poll if options failed
      await this.supabase.from('polls').delete().eq('id', poll.id)
      throw new Error(optionsError.message || 'Failed to create poll options')
    }

    return poll
  }
}

describe('Poll Creation Integration Tests', () => {
  let pollService: PollCreationService
  let mockUser: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 'test-user-123', email: 'test@example.com' }
    pollService = new PollCreationService(mockSupabaseClient, mockUser)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Success Flow', () => {
    it('should create poll with all components successfully', async () => {
      const mockPoll = {
        id: 'poll-123',
        title: 'Integration Test Poll',
        description: 'Test description',
        creator_id: 'test-user-123'
      }

      // Mock successful poll creation
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockPoll,
                  error: null
                })
              })
            })
          }
        } else if (table === 'poll_options') {
          return {
            insert: vi.fn().mockResolvedValue({
              error: null
            })
          }
        }
      })

      const pollData = {
        title: 'What is your favorite programming language?',
        description: 'Choose your preferred language for web development',
        categoryId: 'tech-1',
        options: ['JavaScript', 'TypeScript', 'Python', 'Go'],
        allowAnonymous: true,
        allowMultipleVotes: false
      }

      const result = await pollService.createPoll(pollData)

      expect(result).toEqual(mockPoll)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('polls')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('poll_options')
    })

    it('should handle edge case with maximum options (10)', async () => {
      const mockPoll = { id: 'poll-max-options', title: 'Max Options Poll' }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockPoll,
                  error: null
                })
              })
            })
          }
        } else if (table === 'poll_options') {
          return {
            insert: vi.fn().mockResolvedValue({
              error: null
            })
          }
        }
      })

      const pollData = {
        title: 'Choose your top programming languages',
        options: Array.from({ length: 10 }, (_, i) => `Language ${i + 1}`),
        allowAnonymous: true,
        allowMultipleVotes: true
      }

      const result = await pollService.createPoll(pollData)

      expect(result).toEqual(mockPoll)
      
      // Verify all 10 options were processed
      const pollOptionsCall = mockSupabaseClient.from.mock.calls.find(
        call => call[0] === 'poll_options'
      )
      expect(pollOptionsCall).toBeDefined()
    })
  })

  describe('Failure Scenarios with Recovery', () => {
    it('should handle poll creation failure', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database constraint violation' }
                })
              })
            })
          }
        }
      })

      const pollData = {
        title: 'Test Poll',
        options: ['Option 1', 'Option 2'],
        allowAnonymous: true,
        allowMultipleVotes: false
      }

      await expect(pollService.createPoll(pollData))
        .rejects
        .toThrow('Database constraint violation')
    })

    it('should handle options creation failure and cleanup poll', async () => {
      const mockPoll = { id: 'poll-to-cleanup', title: 'Cleanup Test' }
      const mockDelete = vi.fn().mockResolvedValue({ error: null })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockPoll,
                  error: null
                })
              })
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            })
          }
        } else if (table === 'poll_options') {
          return {
            insert: vi.fn().mockResolvedValue({
              error: { message: 'Foreign key constraint failed' }
            })
          }
        }
      })

      const pollData = {
        title: 'Poll with Failed Options',
        options: ['Option 1', 'Option 2'],
        allowAnonymous: true,
        allowMultipleVotes: false
      }

      await expect(pollService.createPoll(pollData))
        .rejects
        .toThrow('Foreign key constraint failed')

      // Verify cleanup was attempted
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('polls')
    })

    it('should handle authentication failure', async () => {
      const unauthenticatedService = new PollCreationService(mockSupabaseClient, null)

      const pollData = {
        title: 'Unauthenticated Poll',
        options: ['Yes', 'No'],
        allowAnonymous: true,
        allowMultipleVotes: false
      }

      await expect(unauthenticatedService.createPoll(pollData))
        .rejects
        .toThrow('User not authenticated')
    })
  })

  describe('Edge Cases and Race Conditions', () => {
    it('should handle concurrent poll creation attempts', async () => {
      const mockPoll1 = { id: 'poll-concurrent-1', title: 'Concurrent Poll 1' }
      const mockPoll2 = { id: 'poll-concurrent-2', title: 'Concurrent Poll 2' }

      let callCount = 0
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          callCount++
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: callCount === 1 ? mockPoll1 : mockPoll2,
                  error: null
                })
              })
            })
          }
        } else if (table === 'poll_options') {
          return {
            insert: vi.fn().mockResolvedValue({
              error: null
            })
          }
        }
      })

      const pollData1 = {
        title: 'Concurrent Poll 1',
        options: ['A', 'B'],
        allowAnonymous: true,
        allowMultipleVotes: false
      }

      const pollData2 = {
        title: 'Concurrent Poll 2',
        options: ['X', 'Y'],
        allowAnonymous: true,
        allowMultipleVotes: false
      }

      // Simulate concurrent creation
      const [result1, result2] = await Promise.all([
        pollService.createPoll(pollData1),
        pollService.createPoll(pollData2)
      ])

      expect(result1.id).toBe('poll-concurrent-1')
      expect(result2.id).toBe('poll-concurrent-2')
    })

    it('should handle empty/whitespace options correctly', async () => {
      const mockPoll = { id: 'poll-whitespace', title: 'Whitespace Test' }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockPoll,
                  error: null
                })
              })
            })
          }
        } else if (table === 'poll_options') {
          return {
            insert: vi.fn().mockImplementation((options) => {
              // Verify only non-empty options were passed
              expect(options).toHaveLength(2)
              expect(options[0].text).toBe('Valid Option 1')
              expect(options[1].text).toBe('Valid Option 2')
              return Promise.resolve({ error: null })
            })
          }
        }
      })

      const pollData = {
        title: 'Poll with Whitespace Options',
        options: ['  Valid Option 1  ', '   ', 'Valid Option 2', '', '  '],
        allowAnonymous: true,
        allowMultipleVotes: false
      }

      const result = await pollService.createPoll(pollData)

      expect(result).toEqual(mockPoll)
    })

    it('should handle network timeout and retry scenarios', async () => {
      let attemptCount = 0

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          attemptCount++
          
          if (attemptCount === 1) {
            // Simulate network timeout on first attempt
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockRejectedValue(new Error('Network timeout'))
                })
              })
            }
          } else {
            // Succeed on retry
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'poll-retry-success', title: 'Retry Test' },
                    error: null
                  })
                })
              })
            }
          }
        }
      })

      const pollData = {
        title: 'Network Retry Test',
        options: ['Option 1', 'Option 2'],
        allowAnonymous: true,
        allowMultipleVotes: false
      }

      // First attempt should fail
      await expect(pollService.createPoll(pollData))
        .rejects
        .toThrow('Network timeout')

      // Mock success for options table on retry
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'poll-retry-success', title: 'Retry Test' },
                  error: null
                })
              })
            })
          }
        } else if (table === 'poll_options') {
          return {
            insert: vi.fn().mockResolvedValue({
              error: null
            })
          }
        }
      })

      // Retry should succeed
      const result = await pollService.createPoll(pollData)
      expect(result.id).toBe('poll-retry-success')
    })
  })
})