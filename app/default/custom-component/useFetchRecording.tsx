/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

type UseFetchRecordingParams = {
  page?: number
  limit?: number
  courseId?: string
  liveClassId?: string
  meetingId?: string
}

type Recording = {
  _id: string
  courseId: any
  liveClassId: any
  meetingId: any
  uploadedBy: any
  title: string
  videoUrl: string
  duration?: number
  size?: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchRecordingResponse = {
  data: Recording[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export default function useFetchRecording({
  page = 1,
  limit = 10,
  courseId,
  liveClassId,
  meetingId,
}: UseFetchRecordingParams) {

  // Build query string dynamically
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(courseId && { courseId }),
    ...(liveClassId && { liveClassId }),
    ...(meetingId && { meetingId }),
  }).toString()

  const { data, isLoading, isFetching, error, refetch } =
    useQuery<FetchRecordingResponse>({
      queryKey: [
        "recordings",
        page,
        limit,
        courseId,
        liveClassId,
        meetingId,
      ],
      queryFn: async () => {
        const res = await GETDATA<{
          success: boolean
          message: string
          data: FetchRecordingResponse
        }>(`/v1/recording?${queryString}`)

        if (!res.success) {
          throw new Error(res.message || "Failed to fetch recordings")
        }

        return res.data
      },
      placeholderData: keepPreviousData,
    })

  return {
    recordings: data?.data ?? [],
    meta: data?.meta ?? { page, limit, total: 0 },
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
