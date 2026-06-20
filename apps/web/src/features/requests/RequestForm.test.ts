import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RequestForm from './RequestForm.vue'

function setInput(wrapper: ReturnType<typeof mount>, label: string, value: string) {
  const field = wrapper
    .findAll('label')
    .find((l) => l.text().includes(label))
    ?.find('input')
  if (!field) throw new Error(`Field not found: ${label}`)
  return field.setValue(value)
}

describe('RequestForm', () => {
  it('does not emit and shows errors when required fields are empty', async () => {
    const wrapper = mount(RequestForm)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('date')
  })

  it('rejects an end date before the start date', async () => {
    const wrapper = mount(RequestForm)
    await setInput(wrapper, 'Start date', '2030-05-10')
    await setInput(wrapper, 'End date', '2030-05-01')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('End date must be on or after the start date')
  })

  it('emits a valid payload when the form is valid', async () => {
    const wrapper = mount(RequestForm)
    await setInput(wrapper, 'Start date', '2030-05-01')
    await setInput(wrapper, 'End date', '2030-05-05')
    await setInput(wrapper, 'Reason', 'Family trip')
    await wrapper.find('form').trigger('submit.prevent')

    const emitted = wrapper.emitted('submit')
    expect(emitted).toHaveLength(1)
    expect(emitted?.[0]?.[0]).toEqual({
      startDate: '2030-05-01',
      endDate: '2030-05-05',
      reason: 'Family trip',
    })
  })

  it('sends null reason when left blank', async () => {
    const wrapper = mount(RequestForm)
    await setInput(wrapper, 'Start date', '2030-05-01')
    await setInput(wrapper, 'End date', '2030-05-01')
    await wrapper.find('form').trigger('submit.prevent')

    const payload = wrapper.emitted('submit')?.[0]?.[0] as { reason: string | null }
    expect(payload.reason).toBeNull()
  })
})
