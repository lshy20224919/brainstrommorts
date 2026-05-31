import { describe, it, expect, beforeEach } from 'vitest'
import { api, mockApi } from '../mock.js'

const defaultActions = () => [
  { id: 1, category_id: 1, name: '低吸高抛', subjective_weight: 9, status: 0, pinned: 1, exec_count: 8, success_count: 6, fail_count: 2, success_rate: 75.00, last_exec_time: '2026-05-07T00:00:00.000Z', remark: '' },
  { id: 2, category_id: 1, name: '定投指数基金', subjective_weight: 8, status: 0, pinned: 0, exec_count: 12, success_count: 10, fail_count: 2, success_rate: 83.33, last_exec_time: '2026-05-09T00:00:00.000Z', remark: '' }
]

describe('Mock API', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Actions CRUD', () => {
    it('getActions returns all actions', async () => {
      const actions = await api.getActions()
      expect(actions.length).toBeGreaterThan(0)
    })

    it('getActions filters by status', async () => {
      const active = await api.getActions({ status: 0 })
      active.forEach(a => expect(a.status).toBe(0))
    })

    it('createAction adds a new action', async () => {
      const before = await api.getActions()
      await api.createAction({ name: '测试动作', category_id: 1, subjective_weight: 5 })
      const after = await api.getActions()
      expect(after.length).toBe(before.length + 1)
      const created = after.find(a => a.name === '测试动作')
      expect(created).toBeDefined()
      expect(created.exec_count).toBe(0)
      expect(created.status).toBe(0)
    })

    it('getAction returns single action by id', async () => {
      const action = await api.getAction(1)
      expect(action).toBeDefined()
      expect(action.id).toBe(1)
    })

    it('updateAction modifies fields', async () => {
      await api.updateAction(1, { subjective_weight: 10 })
      const updated = await api.getAction(1)
      expect(updated.subjective_weight).toBe(10)
    })
  })

  describe('Checkin', () => {
    it('checkin increments exec_count and success_count on success', async () => {
      const before = { ...(await api.getAction(1)) }
      await api.checkin(1, { result: 'success', remark: '测试' })
      const after = await api.getAction(1)
      expect(after.exec_count).toBe(before.exec_count + 1)
      expect(after.success_count).toBe(before.success_count + 1)
    })

    it('checkin increments fail_count on failure', async () => {
      const before = { ...(await api.getAction(1)) }
      await api.checkin(1, { result: 'fail', remark: '' })
      const after = await api.getAction(1)
      expect(after.fail_count).toBe(before.fail_count + 1)
    })

    it('checkin updates success_rate correctly', async () => {
      const before = { ...(await api.getAction(1)) }
      await api.checkin(1, { result: 'success', remark: '' })
      const after = await api.getAction(1)
      const expectedRate = Math.round((after.success_count / after.exec_count) * 10000) / 100
      expect(after.success_rate).toBe(expectedRate)
    })

    it('getActionRecords returns records for action', async () => {
      await api.checkin(1, { result: 'success', remark: '新记录' })
      const records = await api.getActionRecords(1)
      expect(records.length).toBeGreaterThan(0)
      expect(records[0].action_id).toBe(1)
    })
  })

  describe('Laws', () => {
    it('getLaws returns all laws', async () => {
      const laws = await api.getLaws()
      expect(laws.length).toBeGreaterThan(0)
    })

    it('getLaws filters by law_type', async () => {
      const positive = await api.getLaws({ law_type: 1 })
      positive.forEach(l => expect(l.law_type).toBe(1))
    })

    it('getLaw returns single law', async () => {
      const law = await api.getLaw(1)
      expect(law).toBeDefined()
      expect(law.id).toBe(1)
    })

    it('getLawsByIds returns matching laws', async () => {
      const laws = await api.getLawsByIds([1, 3])
      expect(laws.length).toBe(2)
      expect(laws.map(l => l.id).sort()).toEqual([1, 3])
    })

    it('createLaw adds a new law', async () => {
      const law = await api.createLaw({ law_type: 1, law_desc: '测试规律', category_id: 1, subjective_weight: 7 })
      expect(law.id).toBeDefined()
      expect(law.trigger_count).toBe(0)
    })

    it('getActionRelatedLaws returns laws for action', async () => {
      const laws = await api.getActionRelatedLaws(1)
      laws.forEach(l => expect(l.related_action_id).toBe(1))
    })
  })

  describe('Mistakes', () => {
    it('getMistakes returns all mistakes', async () => {
      const mistakes = await api.getMistakes()
      expect(mistakes.length).toBeGreaterThan(0)
    })

    it('getMistake returns single mistake', async () => {
      const m = await api.getMistake(1)
      expect(m).toBeDefined()
      expect(m.id).toBe(1)
    })

    it('createMistake adds with defaults', async () => {
      const m = await api.createMistake({ name: '测试红线', category_id: 1, subjective_weight: 8 })
      expect(m.status).toBe(0)
      expect(m.related_law_ids).toEqual([])
    })
  })

  describe('Inspirations', () => {
    it('getInspirations returns sorted by time desc', async () => {
      const list = await api.getInspirations()
      for (let i = 1; i < list.length; i++) {
        expect(new Date(list[i - 1].created_time).getTime()).toBeGreaterThanOrEqual(new Date(list[i].created_time).getTime())
      }
    })

    it('getInspiration returns single item', async () => {
      const insp = await api.getInspiration(1)
      expect(insp).toBeDefined()
      expect(insp.direction).toBe('positive')
    })

    it('createInspiration adds with direction', async () => {
      const insp = await api.createInspiration({ desc: '测试灵感', direction: 'negative', category_id: 2 })
      expect(insp.direction).toBe('negative')
      expect(insp.status).toBe(0)
    })

    it('convertInspiration marks as converted', async () => {
      await api.convertInspiration(1, 'action')
      const insp = await api.getInspiration(1)
      expect(insp.status).toBe(1)
    })

    it('deleteInspiration removes item', async () => {
      const before = await api.getInspirations()
      await api.deleteInspiration(before[0].id)
      const after = await api.getInspirations()
      expect(after.length).toBe(before.length - 1)
    })
  })

  describe('Home Stats', () => {
    it('getHomeStats returns correct structure', async () => {
      const stats = await api.getHomeStats()
      expect(stats).toHaveProperty('action_count')
      expect(stats).toHaveProperty('mistake_count')
      expect(stats).toHaveProperty('positive_law_count')
      expect(stats).toHaveProperty('negative_law_count')
      expect(stats).toHaveProperty('action_trigger_count')
      expect(stats).toHaveProperty('positive_law_trigger_count')
      expect(stats).toHaveProperty('negative_law_trigger_count')
    })

    it('action_count matches active actions', async () => {
      const stats = await api.getHomeStats()
      const actions = await api.getActions({ status: 0 })
      expect(stats.action_count).toBe(actions.length)
    })
  })
})
