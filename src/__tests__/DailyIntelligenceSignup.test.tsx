import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DailyIntelligenceSignup from '@/components/DailyIntelligenceSignup'

let insertImpl: (data: any) => Promise<{ error: any | null }>

vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      from: () => ({
        insert: (data: any) => insertImpl(data)
      })
    }
  }
})

beforeEach(() => {
  insertImpl = async () => ({ error: null })
})

describe('DailyIntelligenceSignup', () => {
  it('shows validation error for invalid email', async () => {
    render(<DailyIntelligenceSignup />)
    const input = screen.getByLabelText('Email address') as HTMLInputElement
    const form = screen.getByRole('form', { hidden: true }) || screen.getByLabelText('Daily intelligence signup')
    fireEvent.change(input, { target: { value: 'not-an-email' } })
    fireEvent.blur(input)
    fireEvent.submit(form)
    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument()
  })

  it('submits valid email and shows success', async () => {
    render(<DailyIntelligenceSignup onSuccess={() => {}} />)
    const input = screen.getByLabelText('Email address') as HTMLInputElement
    const form = screen.getByLabelText('Daily intelligence signup')
    fireEvent.change(input, { target: { value: 'user@example.com' } })
    fireEvent.submit(form)
    await waitFor(() => {
      expect(screen.getByText('You are subscribed. Check your inbox tomorrow morning.')).toBeInTheDocument()
    })
  })

  it('handles Supabase insertion error', async () => {
    insertImpl = async () => ({ error: { message: 'db error' } })
    render(<DailyIntelligenceSignup />)
    const input = screen.getByLabelText('Email address') as HTMLInputElement
    const form = screen.getByLabelText('Daily intelligence signup')
    fireEvent.change(input, { target: { value: 'user@example.com' } })
    fireEvent.submit(form)
    await waitFor(() => {
      expect(screen.getByText('Subscription failed. Please try again.')).toBeInTheDocument()
    })
  })
})
