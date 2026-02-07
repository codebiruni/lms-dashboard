'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

type UseFetchMeetingParams = {
  page?: number
  limit?: number
  status?: string
}

type Meeting = {
  _id: string
  status: string
  startTime: string
  endTime: string
  platform: string
  meetingLink: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchMeetingResponse = {
  data: Meeting[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export default function useFetchMeeting({
  page = 1,
  limit = 10,
  status,
}: UseFetchMeetingParams) {

  // Build query string dynamically
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(status && { status }),
  }).toString()

  const { data, isLoading, isFetching, error, refetch } =
    useQuery<FetchMeetingResponse>({
      queryKey: [
        "meetings",
        page,
        limit,
        status,
      ],
      queryFn: async () => {
        const res = await GETDATA<{
          success: boolean
          message: string
          data: FetchMeetingResponse
        }>(`/v1/meeting?${queryString}`)

        if (!res.success) {
          throw new Error(res.message || "Failed to fetch meetings")
        }

        return res.data
      },
      placeholderData: keepPreviousData,
    })

  return {
    meetings: data?.data ?? [],
    meta: data?.meta ?? { page, limit, total: 0 },
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
