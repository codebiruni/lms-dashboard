'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

type UseFetchSubCategoryParams = {
  page?: number
  limit?: number
  search?: string
  category?: string
  deleted?: boolean
}

type SubCategory = {
  _id: string
  name: string
  image: string
  category: { _id: string; name: string; image: string }
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchSubCategoryResponse = {
  data: SubCategory[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export default function useFetchSubCategory({
  page = 1,
  limit = 10,
  search = "",
  category,
  deleted = false,
}: UseFetchSubCategoryParams) {
  // Construct query string
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    deleted: String(deleted),
    ...(search && { search }),
    ...(category && { category }),
  }).toString()

  const { data, isLoading, isFetching, error, refetch } = useQuery<FetchSubCategoryResponse>({
    queryKey: ["subcategories", page, limit, search, category, deleted],
    queryFn: async () => {
      const res = await GETDATA<{
        success: boolean
        message: string
        data: FetchSubCategoryResponse
      }>(`/v1/subcategory?${queryString}`)

      if (!res.success) {
        throw new Error(res.message || "Failed to fetch subcategories")
      }

      return res.data
    },
    placeholderData: keepPreviousData,
  })

  return {
    subcategories: data?.data ?? [],
    meta: data?.meta ?? { page, limit, total: 0 },
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
