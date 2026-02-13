/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

/* -------------------- Types -------------------- */

type UseFetchCategoryParams = {
  page?: number
  limit?: number
  search?: string
  deleted?: boolean
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export type Category = {
  _id: string
  name: string
  image: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

type FetchCategoryResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: Category[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchCategory({
  page = 1,
  limit = 100,
  search = "",
  deleted = false,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}: UseFetchCategoryParams) {

  // Build query string dynamically
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    deleted: String(deleted),
    sortBy,
    sortOrder,
  }

  if (search) params.search = search

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
  } = useQuery<FetchCategoryResponse>({
    queryKey: ["categories", page, limit, search, deleted, sortBy, sortOrder],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchCategoryResponse>(
          `/v1/category?${queryString}`
        )

        if (!res?.success) {
          throw new Error(res?.message || "Failed to fetch categories")
        }

        return res
      } catch (error: any) {
        throw new Error(error?.message || "Network error while fetching categories")
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Process and return data
  const categories = data?.data?.data ?? []
  const meta = data?.data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  }

  return {
    categories,
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
  }
}