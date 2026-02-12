'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* ==================== Types ==================== */

export type UseFetchAssignmentsParams = {
  courseId?: string
  sectionId?: string
  lessonId?: string
  search?: string
  deleted?: boolean
  page?: number
  limit?: number
}

/* -------- Related Models -------- */

export type Course = {
  _id: string
  title: string
}

export type CourseSection = {
  _id: string
  title: string
}

export type Lesson = {
  _id: string
  title: string
}

/* -------- Submission -------- */

export type Submission = {
  studentId: string
  answerText?: string
  fileUrl?: string
  obtainedMarks: number
  feedback?: string
  submittedAt: string
}

/* -------- Assignment -------- */

export type Assignment = {
  _id: string
  courseId: Course
  sectionId?: CourseSection
  lessonId?: Lesson
  title: string
  description?: string
  totalMarks: number
  dueDate: string
  submissions: Submission[]
  isPublished: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchAssignmentsResponse = {
  meta: {
    page: number
    limit: number
    total: number
  }
  data: Assignment[]
}

/* ==================== Hook ==================== */

export default function useFetchAssignments({
  courseId,
  sectionId,
  lessonId,
  deleted,
  search,
  page = 1,
  limit = 10,
}: UseFetchAssignmentsParams) {
  /* -------- Build query string -------- */
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
deleted: deleted === undefined ? 'false' : String(deleted),
    ...(courseId && { courseId }),
    ...(sectionId && { sectionId }),
    ...(lessonId && { lessonId }),
    ...(search && { search }),
  }).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<FetchAssignmentsResponse>({
    queryKey: [
      'assignments',
      courseId,
      sectionId,
      lessonId,
      deleted,
      search,
      page,
      limit,
    ],
    queryFn: async () => {
      const res = await GETDATA<{
        success: boolean
        message: string
        data: FetchAssignmentsResponse
      }>(`/v1/assignment?${queryString}`)

      if (!res.success) {
        throw new Error(res.message || 'Failed to fetch assignments')
      }

      return res.data
    },
    placeholderData: keepPreviousData,
  })

  /* ==================== Return ==================== */

  return {
    assignments: data?.data ?? [],
    meta: {
      page: data?.meta.page ?? page,
      limit: data?.meta.limit ?? limit,
      total: data?.meta.total ?? 0,
    },
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
