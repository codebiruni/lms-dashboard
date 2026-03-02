/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type UseFetchCertificatesParams = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isDelete?: boolean
  studentId?: string
  courseId?: string
}

export type Certificate = {
  _id: string
  studentId: {
    _id: string
    id: string
    userId?: {
      _id: string
      name: string
      email?: string
      phone?: string
      image?: string
    }
  }
  courseId: {
    _id: string
    title: string
    slug: string
    thumbnail?: string
    price?: number
    instructor?: {
      _id: string
      name: string
    }
  }
  certificateUrl?: string
  issuedDate: string
  isDelete: boolean
  createdAt: string
  updatedAt: string
}

type FetchCertificatesResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: Certificate[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchCertificates({
  page = 1,
  limit = 10,
  search,
  sortBy = 'issuedDate',
  sortOrder = 'desc',
  isDelete,
  studentId,
  courseId,
}: UseFetchCertificatesParams) {
  // Build query string dynamically
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  }

  if (search) params.search = search
  if (isDelete !== undefined) params.isDelete = String(isDelete)
  if (studentId) params.studentId = studentId
  if (courseId) params.courseId = courseId

  const queryString = new URLSearchParams(params).toString()

  const { data, isLoading, isFetching, error, refetch, isError, isSuccess, isPlaceholderData } = 
    useQuery<FetchCertificatesResponse>({
      queryKey: ['certificates', page, limit, search, sortBy, sortOrder, isDelete, studentId, courseId],
      queryFn: async () => {
        try {
          const res = await GETDATA<FetchCertificatesResponse>(`/v1/certificate?${queryString}`)

          if (!res?.success) {
            throw new Error(res?.message || 'Failed to fetch certificates')
          }
          
          return res
        } catch (error: any) {
          throw new Error(error?.message || 'Network error while fetching certificates')
        }
      },
      placeholderData: keepPreviousData,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    })

  // Process and return data
  const certificates = data?.data?.data ?? []
  const meta = data?.data?.meta ?? { page, limit, total: 0, totalPages: 0 }

  return {
    certificates,
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