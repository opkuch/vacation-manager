import {
  API_ROUTES,
  buildPath,
  type CreateVacationRequest,
  type ListRequestsQuery,
  type LoginRequest,
  type LoginResponse,
  type Paginated,
  type PaginationQuery,
  type RejectRequest,
  type UserDto,
  type VacationRequestDto,
} from '@vm/shared'
import { apiClient } from '../axios'

type RequestList = Paginated<VacationRequestDto>

/**
 * Typed client with one function per API_ROUTES entry. Paths come straight from
 * the contract and `:id` is filled via buildPath, so the HTTP surface can't drift.
 */
export const api = {
  async login(body: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(API_ROUTES.login.path, body)
    return data
  },

  async me(): Promise<UserDto> {
    const { data } = await apiClient.get<UserDto>(API_ROUTES.me.path)
    return data
  },

  async createRequest(body: CreateVacationRequest): Promise<VacationRequestDto> {
    const { data } = await apiClient.post<VacationRequestDto>(API_ROUTES.createRequest.path, body)
    return data
  },

  async listMyRequests(query: PaginationQuery): Promise<RequestList> {
    const { data } = await apiClient.get<RequestList>(API_ROUTES.listMyRequests.path, {
      params: query,
    })
    return data
  },

  async listAllRequests(query: ListRequestsQuery): Promise<RequestList> {
    const { data } = await apiClient.get<RequestList>(API_ROUTES.listAllRequests.path, {
      params: query,
    })
    return data
  },

  async listTeamRequests(query: PaginationQuery): Promise<RequestList> {
    const { data } = await apiClient.get<RequestList>(API_ROUTES.listTeamRequests.path, {
      params: query,
    })
    return data
  },

  async approveRequest(id: string): Promise<VacationRequestDto> {
    const path = buildPath(API_ROUTES.approveRequest.path, { id })
    const { data } = await apiClient.post<VacationRequestDto>(path)
    return data
  },

  async rejectRequest(id: string, body: RejectRequest): Promise<VacationRequestDto> {
    const path = buildPath(API_ROUTES.rejectRequest.path, { id })
    const { data } = await apiClient.post<VacationRequestDto>(path, body)
    return data
  },
}

export type Api = typeof api
