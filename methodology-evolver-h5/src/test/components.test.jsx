import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import InspirationDetailPanel from '../components/InspirationDetailPanel'
import MistakeDetailPanel from '../components/MistakeDetailPanel'
import LawDetailPanel from '../components/LawDetailPanel'

describe('InspirationDetailPanel', () => {
  const mockInsp = { id: 1, desc: '测试灵感内容', direction: 'positive', source: '书籍', category_id: 1, status: 0, created_time: '2026-05-01T10:00:00.000Z' }
  const mockCat = { id: 1, name: '投资', icon: '📈' }

  it('renders nothing when not visible', () => {
    const { container } = render(<InspirationDetailPanel visible={false} inspiration={mockInsp} category={mockCat} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders content when visible', () => {
    render(<InspirationDetailPanel visible={true} inspiration={mockInsp} category={mockCat} onClose={() => {}} />)
    expect(screen.getByText('测试灵感内容')).toBeInTheDocument()
    expect(screen.getByText('正向灵感')).toBeInTheDocument()
    expect(screen.getByText('书籍')).toBeInTheDocument()
  })

  it('shows negative direction correctly', () => {
    const negInsp = { ...mockInsp, direction: 'negative' }
    render(<InspirationDetailPanel visible={true} inspiration={negInsp} category={mockCat} onClose={() => {}} />)
    expect(screen.getByText('负向灵感')).toBeInTheDocument()
  })
})

describe('MistakeDetailPanel', () => {
  const mockMistake = { id: 1, name: '测试红线', category_id: 1, subjective_weight: 9, remark: '备注内容', status: 0, related_law_ids: [] }
  const mockCat = { id: 1, name: '投资', icon: '📈' }

  it('renders nothing when not visible', () => {
    const { container } = render(<MistakeDetailPanel visible={false} mistake={mockMistake} category={mockCat} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders mistake name and remark', () => {
    render(<MistakeDetailPanel visible={true} mistake={mockMistake} category={mockCat} onClose={() => {}} />)
    expect(screen.getByText('测试红线')).toBeInTheDocument()
    expect(screen.getByText('备注内容')).toBeInTheDocument()
  })
})

describe('LawDetailPanel', () => {
  const mockLaw = { id: 1, law_type: 1, law_desc: '测试正向规律', category_id: 1, related_action_id: null, applicable_scenes: '测试场景', subjective_weight: 8, trigger_count: 5, popup_enabled: 1 }
  const mockCat = { id: 1, name: '投资', icon: '📈' }

  it('renders nothing when not visible', () => {
    const { container } = render(<LawDetailPanel visible={false} law={mockLaw} category={mockCat} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders law description and scenes', () => {
    render(<LawDetailPanel visible={true} law={mockLaw} category={mockCat} onClose={() => {}} />)
    expect(screen.getByText('测试正向规律')).toBeInTheDocument()
    expect(screen.getByText('测试场景')).toBeInTheDocument()
    expect(screen.getByText('正向规律')).toBeInTheDocument()
  })
})
