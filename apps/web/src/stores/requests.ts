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
 * Last-used queries are stored so realtime toast refresh reuses page + filters.
 */
export const useRequestsStore = defineStore('requests', () => {
  const mine = ref<RequestList>(emptyPage(10))
  const all = ref<RequestList>(emptyPage(10))
  const team = ref<RequestList>(emptyPage(50))

  const lastMineQuery = ref<PaginationQuery>({ page: 1, pageSize: 10 })
  const lastAllQuery = ref<ListRequestsQuery>({ page: 1, pageSize: 10 })
  const lastTeamQuery = ref<PaginationQuery>({ page: 1, pageSize: 50 })

  async function fetchMine(query: PaginationQuery): Promise<void> {
    lastMineQuery.value = { ...query }
    mine.value = await api.listMyRequests(query)
  }

  async function fetchAll(query: ListRequestsQuery): Promise<void> {
    lastAllQuery.value = { ...query }
    all.value = await api.listAllRequests(query)
  }

  async function fetchTeam(query: PaginationQuery): Promise<void> {
    lastTeamQuery.value = { ...query }
    team.value = await api.listTeamRequests(query)
  }

  function refreshMine(): Promise<void> {
    return fetchMine(lastMineQuery.value)
  }

  function refreshAll(): Promise<void> {
    return fetchAll(lastAllQuery.value)
  }

  function refreshTeam(): Promise<void> {
    return fetchTeam(lastTeamQuery.value)
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

  return {
    mine,
    all,
    team,
    fetchMine,
    fetchAll,
    fetchTeam,
    refreshMine,
    refreshAll,
    refreshTeam,
    createMine,
    approve,
    reject,
  }
})
