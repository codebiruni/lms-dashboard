/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type UseFetchTemplatesParams = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isDelete?: boolean
  course?: string
}

export type CertificateTemplate = {
  _id: string
  image: string
  studentIdPosition: {
    left: number
    top: number
    fontSize: number
    width?: number
    height?: number
  }
  namePosition: {
    left: number
    top: number
    fontSize: number
    width?: number
    height?: number
  }
  courseNamePosition: {
    left: number
    top: number
    fontSize: number
    width?: number
    height?: number
  }
  fontFamily: string
  color: string
  course: {
    _id: string
    title: string
    slug: string
    thumbnail?: string
    level?: string
    price?: number
    instructor?: {
      _id: string
      name: string
    }
  }
  isDelete: boolean
  createdAt: string
  updatedAt: string
}

type FetchTemplatesResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: CertificateTemplate[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchTemplates({
  page = 1,
  limit = 10,
  search,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  isDelete,
  course,
}: UseFetchTemplatesParams) {
  // Build query string dynamically
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  }

  if (search) params.search = search
  if (isDelete !== undefined) params.isDelete = String(isDelete)
  if (course) params.course = course

  const queryString = new URLSearchParams(params).toString()

  const { data, isLoading, isFetching, error, refetch, isError, isSuccess, isPlaceholderData } = 
    useQuery<FetchTemplatesResponse>({
      queryKey: ['certificate-templates', page, limit, search, sortBy, sortOrder, isDelete, course],
      queryFn: async () => {
        try {
          const res = await GETDATA<FetchTemplatesResponse>(`/v1/certificate-template?${queryString}`)

          if (!res?.success) {
            throw new Error(res?.message || 'Failed to fetch certificate templates')
          }
          
          return res
        } catch (error: any) {
          throw new Error(error?.message || 'Network error while fetching templates')
        }
      },
      placeholderData: keepPreviousData,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    })

  // Process and return data
  const templates = data?.data?.data ?? []
  const meta = data?.data?.meta ?? { page, limit, total: 0, totalPages: 0 }

  return {
    templates,
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