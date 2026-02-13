/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

/* -------------------- Types -------------------- */

type UseFetchCourseProgressParams = {
  page?: number
  limit?: number
  student?: string
  course?: string
  enrollment?: string
  isCompleted?: boolean
  isDeleted?: boolean
  search?: string
  sortBy?: 'progressPercentage' | 'createdAt' | 'updatedAt' | 'isCompleted'
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
  minProgress?: number
  maxProgress?: number
}

export type CourseProgress = {
  _id: string
  student: {
    _id: string
    id: string
    userId?: {
      name: string
      email: string
    }
  }
  course: {
    _id: string
    title: string
    slug?: string
  }
  enrollment?: {
    _id: string
    studentId: string
    courseId: string
  }
  completedLessons: Array<{
    _id: string
    title: string
    lessonType: string
    duration?: number
  }>
  totalLessons: number
  progressPercentage: number
  isCompleted: boolean
  completedAt?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

type FetchCourseProgressResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: CourseProgress[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchCourseProgress({
  page = 1,
  limit = 10,
  student,
  course,
  enrollment,
  isCompleted,
  isDeleted = false,
  search,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  startDate,
  endDate,
  minProgress,
  maxProgress,
}: UseFetchCourseProgressParams) {

  // Build query string dynamically
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  }

  if (student) params.student = student
  if (course) params.course = course
  if (enrollment) params.enrollment = enrollment
  if (isCompleted !== undefined) params.isCompleted = String(isCompleted)
  if (isDeleted !== undefined) params.isDeleted = String(isDeleted)
  if (search) params.search = search
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  if (minProgress !== undefined) params.minProgress = String(minProgress)
  if (maxProgress !== undefined) params.maxProgress = String(maxProgress)

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
  } = useQuery<FetchCourseProgressResponse>({
    queryKey: [
      "course-progress",
      page,
      limit,
      student,
      course,
      enrollment,
      isCompleted,
      isDeleted,
      search,
      sortBy,
      sortOrder,
      startDate,
      endDate,
      minProgress,
      maxProgress,
    ],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchCourseProgressResponse>(
          `/v1/course-progress?${queryString}`
        )

        if (!res?.success) {
          throw new Error(res?.message || "Failed to fetch course progress")
        }

        return res
      } catch (error: any) {
        throw new Error(error?.message || "Network error while fetching course progress")
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Process and return data
  const progress = data?.data?.data ?? []
  const meta = data?.data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  }

  // Calculate stats
  const completedCount = progress.filter((p: CourseProgress) => p.isCompleted).length
  const inProgressCount = progress.filter((p: CourseProgress) => !p.isCompleted && !p.isDeleted).length
  const averageProgress = progress.length > 0
    ? Math.round(progress.reduce((acc: number, p: CourseProgress) => acc + p.progressPercentage, 0) / progress.length)
    : 0

  return {
    progress,
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
      completedCount,
      inProgressCount,
      averageProgress,
      totalLessonsCompleted: progress.reduce((acc: number, p: CourseProgress) => acc + (p.completedLessons?.length || 0), 0),
      deletedCount: progress.filter((p: CourseProgress) => p.isDeleted).length,
    },
  }
}