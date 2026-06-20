import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  type ListRequestsQuery,
  type Paginated,
  type PaginationQuery,
  type VacationRequestDto,
} from '@vm/shared'
import { api } from '@/lib/api'

type RequestList = Paginated<VacationRequestDto>

const emptyPage = (pageSize: number): RequestList => ({
  data: [],
  page: 1,
  pageSize,
  total: 0,
  totalPages: 0,
})

/**
 * Caches the three request listings (mine / all / team). Each view drives its
 * own query through these actions; results are kept so navigation feels instant.
 */
export const useRequestsStore = defineStore('requests', () => {
  const mine = ref<RequestList>(emptyPage(10))
  const all = ref<RequestList>(emptyPage(10))
  const team = ref<RequestList>(emptyPage(50))

  async function fetchMine(query: PaginationQuery): Promise<void> {
    mine.value = await api.listMyRequests(query)
  }

  async function fetchAll(query: ListRequestsQuery): Promise<void> {
    all.value = await api.listAllRequests(query)
  }

  async function fetchTeam(query: PaginationQuery): Promise<void> {
    team.value = await api.listTeamRequests(query)
  }

  async function createMine(input: Parameters<typeof api.createRequest>[0]): Promise<void> {
    await api.createRequest(input)
  }

  async function approve(id: string): Promise<VacationRequestDto> {
    return api.approveRequest(id)
  }

  async function reject(id: string, comment: string): Promise<VacationRequestDto> {
    return api.rejectRequest(id, { comment })
  }

  return { mine, all, team, fetchMine, fetchAll, fetchTeam, createMine, approve, reject }
})
