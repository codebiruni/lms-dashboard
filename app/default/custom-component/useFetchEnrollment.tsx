/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

type UseFetchEnrollmentParams = {
  page?: number
  limit?: number
  search?: string
  student?: string
  course?: string
  isDeleted?: boolean
  status?: string
  paymentStatus?: string
  deleted?: boolean
  sortBy?: string
  sortOrder?: 1 | -1
}

type Enrollment = {
  _id: string
  student: any
  course: any
  enrollmentStatus: string
  paymentStatus: string
  totalAmount: number
  paidAmount: number
  dueAmount: number
  progress: number
  createdAt: string
  updatedAt: string
}

type FetchEnrollmentResponse = {
  data: Enrollment[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export default function useFetchEnrollment({
  page = 1,
  limit = 10,
  search = "",
  student,
  course,
  status,
  paymentStatus,
  deleted = false,
  sortBy = "createdAt",
  sortOrder = -1,
}: UseFetchEnrollmentParams) {

  // Build query string dynamically
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    deleted: String(deleted),
    sortBy,
    sortOrder: String(sortOrder),
    ...(search && { search }),
    ...(student && { student }),
    ...(course && { course }),
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
  }).toString()

  const { data, isLoading, isFetching, error, refetch } =
    useQuery<FetchEnrollmentResponse>({
      queryKey: [
        "enrollments",
        page,
        limit,
        search,
        student,
        course,
        status,
        paymentStatus,
        deleted,
        sortBy,
        sortOrder,
      ],
      queryFn: async () => {
        const res = await GETDATA<{
          success: boolean
          message: string
          data: FetchEnrollmentResponse
        }>(`/v1/enrollment?${queryString}`)

        if (!res.success) {
          throw new Error(res.message || "Failed to fetch enrollments")
        }

        return res.data
      },
      placeholderData: keepPreviousData,
    })

  return {
    enrollments: data?.data ?? [],
    meta: data?.meta ?? { page, limit, total: 0 },
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
