/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type UseFetchInstructorsParams = {
  page?: number
  limit?: number
  search?: string
  deleted?: boolean
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'all'
  sortBy?: 'joinDate' | 'selery' | 'name' | 'totalCourses' | 'totalStudents'
  sortOrder?: 1 | -1
  minSalary?: number
  maxSalary?: number
  startDate?: string
  endDate?: string
}

/* ---------- User (populated userId) ---------- */
export type InstructorUser = {
  _id: string
  id: string
  name: string
  email?: string
  phone?: string
  role: string
  image?: string
  status: string
  isVerified: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

/* -------------------- Instructor -------------------- */
export type Instructor = {
  _id: string
  id: string
  userId: InstructorUser
  bio?: string
  expertise?: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  joinDate: string
  selery?: number
  totalStudents?: number
  totalCourses?: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

/* -------------------- API Response -------------------- */
type FetchInstructorsResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: Instructor[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchInstructors({
  page = 1,
  limit = 10,
  search,
  approvalStatus,
  deleted = false,
  sortBy = 'joinDate',
  sortOrder = -1,
  minSalary,
  maxSalary,
  startDate,
  endDate,
}: UseFetchInstructorsParams = {}) {
  /* -------- Build query string (backend-safe) -------- */
  const queryParams: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder: String(sortOrder),
    deleted: String(deleted),
  }

  if (search) queryParams.search = search
  if (approvalStatus && approvalStatus !== 'all') queryParams.approvalStatus = approvalStatus
  if (minSalary !== undefined) queryParams.minSalary = String(minSalary)
  if (maxSalary !== undefined) queryParams.maxSalary = String(maxSalary)
  if (startDate) queryParams.startDate = startDate
  if (endDate) queryParams.endDate = endDate

  const queryString = new URLSearchParams(queryParams).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    isError,
    isSuccess,
    isPlaceholderData
  } = useQuery<FetchInstructorsResponse>({
    queryKey: [
      'instructors',
      page,
      limit,
      search,
      approvalStatus,
      deleted,
      sortBy,
      sortOrder,
      minSalary,
      maxSalary,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchInstructorsResponse>(`/v1/instructor?${queryString}`)

        if (!res?.success) {
          throw new Error(res?.message || 'Failed to fetch instructors')
        }

        return res
      } catch (error: any) {
        throw new Error(error?.message || 'Network error while fetching instructors')
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  /* -------------------- Process and return data -------------------- */
  const instructors = data?.data?.data ?? []
  const meta = data?.data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  }

  // Calculate stats
  const totalSalary = instructors.reduce((acc: number, inst: Instructor) => acc + (inst.selery || 0), 0)
  const averageSalary = instructors.length > 0 ? Math.round(totalSalary / instructors.length) : 0
  const totalStudents = instructors.reduce((acc: number, inst: Instructor) => acc + (inst.totalStudents || 0), 0)
  const totalCourses = instructors.reduce((acc: number, inst: Instructor) => acc + (inst.totalCourses || 0), 0)

  const approvalCounts = {
    pending: instructors.filter((i: Instructor) => i.approvalStatus === 'pending').length,
    approved: instructors.filter((i: Instructor) => i.approvalStatus === 'approved').length,
    rejected: instructors.filter((i: Instructor) => i.approvalStatus === 'rejected').length,
  }

  return {
    instructors,
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
      totalSalary,
      averageSalary,
      totalStudents,
      totalCourses,
      approvalCounts,
      activeCount: instructors.filter((i: Instructor) => !i.isDeleted).length,
      deletedCount: instructors.filter((i: Instructor) => i.isDeleted).length,
    },
  }
}