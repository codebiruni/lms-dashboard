/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type UseFetchStudentsParams = {
  page?: number
  limit?: number
  search?: string
  deleted?: boolean
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'id'
  sortOrder?: 1 | -1
  enrolledCourseId?: string
  minEnrolled?: number
  maxEnrolled?: number
  startDate?: string
  endDate?: string
}

export type EnrolledCourse = {
  name: string
  enrollData: string
  amount: number
  paid: number
  left: number
  coursId: string
}

export type Certificate = {
  name: string
  date: string
  link: string
}

export type Student = {
  _id: string
  id: string
  bio?: string
  userId?: {
    _id: string
    name: string
    email?: string
    phone?: string
    image?: string
    role?: string
    status?: string
  }
  enrolledCourses?: EnrolledCourse[]
  certificates?: Certificate[]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

type FetchStudentsResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
    data: Student[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchStudents({
  page = 1,
  limit = 10,
  search,
  deleted = false,
  sortBy = 'createdAt',
  sortOrder = -1,
  enrolledCourseId,
  minEnrolled,
  maxEnrolled,
  startDate,
  endDate,
}: UseFetchStudentsParams) {
  // Build query string dynamically
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder: String(sortOrder),
  }

  if (search) params.search = search
  if (deleted !== undefined) params.deleted = String(deleted)
  if (enrolledCourseId) params.enrolledCourseId = enrolledCourseId
  if (minEnrolled !== undefined) params.minEnrolled = String(minEnrolled)
  if (maxEnrolled !== undefined) params.maxEnrolled = String(maxEnrolled)
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate

  const queryString = new URLSearchParams(params).toString()

  const { data, isLoading, isFetching, error, refetch, isError, isSuccess, isPlaceholderData } = useQuery<FetchStudentsResponse>({
    queryKey: ['Students', page, limit, search, deleted, sortBy, sortOrder, enrolledCourseId, minEnrolled, maxEnrolled, startDate, endDate],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchStudentsResponse>(`/v1/student?${queryString}`)

        if (!res?.success) {
          throw new Error(res?.message || 'Failed to fetch students')
        }
        
        return res
      } catch (error: any) {
        throw new Error(error?.message || 'Network error while fetching students')
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Process and return data
  const Students = data?.data?.data ?? []
  const meta = data?.data?.meta ?? { page, limit, total: 0, totalPages: 0 }

  // Calculate stats
  const totalEnrollments = Students.reduce((acc: number, student: Student) => 
    acc + (student.enrolledCourses?.length || 0), 0)
  
  const averageEnrollments = Students.length > 0 
    ? Math.round((totalEnrollments / Students.length) * 10) / 10 
    : 0

  const totalRevenue = Students.reduce((acc: number, student: Student) => 
    acc + (student.enrolledCourses?.reduce((sum, course) => sum + (course.paid || 0), 0) || 0), 0)

  return {
    Students,
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
      totalEnrollments,
      averageEnrollments,
      totalRevenue,
      activeCount: Students.filter((s: Student) => !s.isDeleted).length,
      deletedCount: Students.filter((s: Student) => s.isDeleted).length,
    },
  }
}