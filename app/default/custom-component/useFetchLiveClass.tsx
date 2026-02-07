/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

type UseFetchLiveClassParams = {
  page?: number
  limit?: number
  searchTerm?: string
  meetingPlatform?: string
  isDeleted?: boolean
  sortByTime?: "asc" | "desc"
}

type LiveClass = {
  _id: string
  title: string
  description?: string
  meetingPlatform: string
  startTime: string
  endTime: string
  courseId: any
  sectionId: any
  instructorId: any
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchLiveClassResponse = {
  data: LiveClass[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export default function useFetchLiveClass({
  page = 1,
  limit = 10,
  searchTerm = "",
  meetingPlatform,
  isDeleted = false,
  sortByTime,
}: UseFetchLiveClassParams) {

  // Build query string dynamically
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    isDeleted: String(isDeleted),
    ...(searchTerm && { searchTerm }),
    ...(meetingPlatform && { meetingPlatform }),
    ...(sortByTime && { sortByTime }),
  }).toString()

  const { data, isLoading, isFetching, error, refetch } =
    useQuery<FetchLiveClassResponse>({
      queryKey: [
        "liveClasses",
        page,
        limit,
        searchTerm,
        meetingPlatform,
        isDeleted,
        sortByTime,
      ],
      queryFn: async () => {
        const res = await GETDATA<{
          success: boolean
          message: string
          data: FetchLiveClassResponse
        }>(`/v1/live-class?${queryString}`)

        if (!res.success) {
          throw new Error(res.message || "Failed to fetch live classes")
        }

        return res.data
      },
      placeholderData: keepPreviousData,
    })

  return {
    liveClasses: data?.data ?? [],
    meta: data?.meta ?? { page, limit, total: 0 },
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
