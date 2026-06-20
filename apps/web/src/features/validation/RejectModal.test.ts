import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RejectModal from './RejectModal.vue'

const mountModal = () =>
  mount(RejectModal, {
    props: { open: true },
    global: { stubs: { teleport: true } },
  })

function rejectButton(wrapper: ReturnType<typeof mountModal>) {
  const button = wrapper.findAll('button').find((b) => b.text() === 'Reject')
  if (!button) throw new Error('Reject button not found')
  return button
}

describe('RejectModal', () => {
  it('disables Reject until a non-empty comment is entered', async () => {
    const wrapper = mountModal()
    expect(rejectButton(wrapper).attributes('disabled')).toBeDefined()

    await wrapper.find('textarea').setValue('   ')
    expect(rejectButton(wrapper).attributes('disabled')).toBeDefined()

    await wrapper.find('textarea').setValue('Insufficient coverage')
    expect(rejectButton(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('emits the trimmed comment on confirm', async () => {
    const wrapper = mountModal()
    await wrapper.find('textarea').setValue('  Need more notice  ')
    await rejectButton(wrapper).trigger('click')

    expect(wrapper.emitted('confirm')?.[0]).toEqual(['Need more notice'])
  })

  it('does not emit confirm when the comment is empty', async () => {
    const wrapper = mountModal()
    await rejectButton(wrapper).trigger('click')
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })
})
