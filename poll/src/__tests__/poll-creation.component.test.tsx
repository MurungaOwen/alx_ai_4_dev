/**
 * Component Unit Tests for Poll Creation Page
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreatePollPage from '@/app/polls/create/page'

// Mock dependencies
vi.mock('@/lib/supabase/client')
vi.mock('@/lib/api/polls')
vi.mock('@/providers/auth-provider')
vi.mock('next/navigation')
vi.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

const mockUser = { id: 'test-user-id', email: 'test@example.com' }
const mockCategories = [
  { id: '1', name: 'General', color: '#3B82F6' },
  { id: '2', name: 'Technology', color: '#10B981' }
]

describe('Poll Creation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    const { useAuth } = require('@/providers/auth-provider')
    ;(useAuth as Mock).mockReturnValue({ user: mockUser })

    const { getCategories } = require('@/lib/api/polls')
    ;(getCategories as Mock).mockResolvedValue({
      success: true,
      data: mockCategories
    })

    const { useRouter } = require('next/navigation')
    ;(useRouter as Mock).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn()
    })
  })

  describe('Success Path', () => {
    it('should successfully create a poll with valid data', async () => {
      // Mock successful Supabase operations
      const mockPoll = { id: 'new-poll-id', title: 'Test Poll' }
      
      vi.doMock('@/lib/supabase/client', () => ({
        supabase: {
          from: vi.fn()
            .mockReturnValueOnce({
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockPoll,
                    error: null
                  })
                })
              })
            })
            .mockReturnValueOnce({
              insert: vi.fn().mockResolvedValue({
                error: null
              })
            })
        }
      }))

      render(<CreatePollPage />)
      
      // Fill out form
      const titleInput = screen.getByLabelText('Poll Question')
      await userEvent.type(titleInput, 'What is your favorite framework?')
      
      const optionInputs = screen.getAllByPlaceholderText(/Option \d/)
      await userEvent.type(optionInputs[0], 'React')
      await userEvent.type(optionInputs[1], 'Vue')
      
      // Submit form
      const submitButton = screen.getByText('Publish Poll')
      fireEvent.click(submitButton)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument()
      })

      // Should eventually show success
      await waitFor(() => {
        expect(screen.getByText('Poll Created Successfully!')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should handle form with all optional fields filled', async () => {
      const mockPoll = { id: 'new-poll-id', title: 'Detailed Poll' }
      
      vi.doMock('@/lib/supabase/client', () => ({
        supabase: {
          from: vi.fn().mockReturnValue({
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockPoll,
                  error: null
                })
              })
            })
          })
        }
      }))

      render(<CreatePollPage />)
      
      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getByText('General')).toBeInTheDocument()
      })
      
      // Fill all fields
      await userEvent.type(screen.getByLabelText('Poll Question'), 'Detailed Poll Question')
      await userEvent.type(screen.getByLabelText(/Description/), 'This is a detailed description')
      
      // Select category
      const categorySelect = screen.getByRole('combobox')
      fireEvent.click(categorySelect)
      fireEvent.click(screen.getByText('Technology'))
      
      // Toggle settings
      fireEvent.click(screen.getByRole('switch', { name: /Multiple Choice/ }))
      fireEvent.click(screen.getByRole('switch', { name: /Anonymous Voting/ }))
      
      // Fill options
      const optionInputs = screen.getAllByPlaceholderText(/Option \d/)
      await userEvent.type(optionInputs[0], 'Option A')
      await userEvent.type(optionInputs[1], 'Option B')
      
      // Add third option
      fireEvent.click(screen.getByText('Add Option'))
      const newOptionInput = screen.getByPlaceholderText('Option 3')
      await userEvent.type(newOptionInput, 'Option C')
      
      // Verify preview shows all settings
      expect(screen.getByText('✓ Multiple selections allowed')).toBeInTheDocument()
      expect(screen.queryByText('✓ Anonymous voting enabled')).not.toBeInTheDocument()
      expect(screen.getByText('✓ Category: Technology')).toBeInTheDocument()
      
      // Submit
      fireEvent.click(screen.getByText('Publish Poll'))
      
      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument()
      })
    })
  })

  describe('Failure Path', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      vi.doMock('@/lib/supabase/client', () => ({
        supabase: {
          from: vi.fn().mockReturnValue({
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database connection failed' }
                })
              })
            })
          })
        }
      }))

      render(<CreatePollPage />)
      
      // Fill valid form
      await userEvent.type(screen.getByLabelText('Poll Question'), 'Test Poll')
      const optionInputs = screen.getAllByPlaceholderText(/Option \d/)
      await userEvent.type(optionInputs[0], 'Yes')
      await userEvent.type(optionInputs[1], 'No')
      
      // Submit
      fireEvent.click(screen.getByText('Publish Poll'))
      
      // Should show error
      await waitFor(() => {
        expect(screen.getByText('Database connection failed')).toBeInTheDocument()
      })
      
      // Button should be re-enabled
      expect(screen.getByText('Publish Poll')).not.toBeDisabled()
    })

    it('should handle options creation failure with cleanup', async () => {
      const mockPoll = { id: 'test-poll-id', title: 'Test Poll' }
      
      vi.doMock('@/lib/supabase/client', () => ({
        supabase: {
          from: vi.fn()
            .mockReturnValueOnce({
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockPoll,
                    error: null
                  })
                })
              })
            })
            .mockReturnValueOnce({
              insert: vi.fn().mockResolvedValue({
                error: { message: 'Failed to create poll options' }
              })
            })
            .mockReturnValueOnce({
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
              })
            })
        }
      }))

      render(<CreatePollPage />)
      
      await userEvent.type(screen.getByLabelText('Poll Question'), 'Test Poll')
      const optionInputs = screen.getAllByPlaceholderText(/Option \d/)
      await userEvent.type(optionInputs[0], 'Option 1')
      await userEvent.type(optionInputs[1], 'Option 2')
      
      fireEvent.click(screen.getByText('Publish Poll'))
      
      await waitFor(() => {
        expect(screen.getByText('Failed to create poll options')).toBeInTheDocument()
      })
    })

    it('should handle unauthenticated user', async () => {
      const { useAuth } = require('@/providers/auth-provider')
      ;(useAuth as Mock).mockReturnValue({ user: null })

      render(<CreatePollPage />)
      
      await userEvent.type(screen.getByLabelText('Poll Question'), 'Test Poll')
      const optionInputs = screen.getAllByPlaceholderText(/Option \d/)
      await userEvent.type(optionInputs[0], 'Yes')
      await userEvent.type(optionInputs[1], 'No')
      
      fireEvent.click(screen.getByText('Publish Poll'))
      
      await waitFor(() => {
        expect(screen.getByText('Please sign in to create a poll')).toBeInTheDocument()
      })
    })

    it('should validate form and show multiple errors', async () => {
      render(<CreatePollPage />)
      
      // Submit empty form
      fireEvent.click(screen.getByText('Publish Poll'))
      
      await waitFor(() => {
        expect(screen.getByText('Poll title is required')).toBeInTheDocument()
      })
      
      // Fill title that's too long
      const longTitle = 'a'.repeat(101)
      await userEvent.type(screen.getByLabelText('Poll Question'), longTitle)
      
      fireEvent.click(screen.getByText('Publish Poll'))
      
      await waitFor(() => {
        expect(screen.getByText('Poll title must be less than 100 characters')).toBeInTheDocument()
      })
    })
  })
})