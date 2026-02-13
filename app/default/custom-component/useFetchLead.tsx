/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

/* -------------------- Types -------------------- */

type UseFetchLeadParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
  deleted?: boolean
  sortBy?: 'createdAt' | 'name' | 'status' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
}

export type Lead = {
  _id: string
  name: string
  email?: string
  description?: string
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted'
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

type FetchLeadResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: Lead[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchLead({
  page = 1,
  limit = 10,
  search = "",
  status,
  deleted = false,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  startDate,
  endDate,
}: UseFetchLeadParams) {

  // Build query string dynamically
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
    deleted: String(deleted),
  }

  if (search) params.search = search
  if (status && status !== 'all') params.status = status
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate

  const queryString = new URLSearchParams(params).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    isError,
    isSuccess,
    isPlaceholderData
  } = useQuery<FetchLeadResponse>({
    queryKey: [
      "leads",
      page,
      limit,
      search,
      status,
      deleted,
      sortBy,
      sortOrder,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchLeadResponse>(
          `/v1/lead?${queryString}`
        )

        if (!res?.success) {
          throw new Error(res?.message || "Failed to fetch leads")
        }

        return res
      } catch (error: any) {
        throw new Error(error?.message || "Network error while fetching leads")
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Process and return data
  const leads = data?.data?.data ?? []
  const meta = data?.data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  }

  // Calculate stats
  const statusCounts = {
    new: leads.filter((l: Lead) => l.status === 'new').length,
    contacted: leads.filter((l: Lead) => l.status === 'contacted').length,
    qualified: leads.filter((l: Lead) => l.status === 'qualified').length,
    lost: leads.filter((l: Lead) => l.status === 'lost').length,
    converted: leads.filter((l: Lead) => l.status === 'converted').length,
  }

  return {
    leads,
    meta,
    isLoading,
    isFetching,
    isError,
    error,
    isSuccess,
    isPlaceholderData,
    refetch,
    totalCount: meta.total,
    currentPage: meta.page,
    totalPages: meta.totalPages,
    pageSize: meta.limit,
    stats: {
      statusCounts,
      deletedCount: leads.filter((l: Lead) => l.isDeleted).length,
    },
  }
}