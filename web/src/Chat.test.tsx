import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Chat from './Chat'

describe('Chat', () => {
  it('renders', () => {
    render(<Chat />)
    expect(screen.getByText('Send')).toBeTruthy()
  })
})