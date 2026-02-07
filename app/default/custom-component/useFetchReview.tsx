'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

type UseFetchReviewParams = {
  page?: number
  limit?: number
  courseName?: string
  rating?: number | string
}

type Review = {
  _id: string
  courseName: string
  rating: number
  name: string
  image?: string
  comment: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchReviewResponse = {
  data: Review[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function useFetchReview({
  page = 1,
  limit = 10,
  courseName = "",
  rating,
}: UseFetchReviewParams) {

  // Build query string dynamically
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(courseName && { courseName }),
    ...(rating && { rating: String(rating) }),
  }).toString()

  const { data, isLoading, isFetching, error, refetch } =
    useQuery<FetchReviewResponse>({
      queryKey: ["reviews", page, limit, courseName, rating],
      queryFn: async () => {
        const res = await GETDATA<{
          success: boolean
          message: string
          data: FetchReviewResponse
        }>(`/v1/review?${queryString}`)

        if (!res.success) {
          throw new Error(res.message || "Failed to fetch reviews")
        }

        return res.data
      },
      placeholderData: keepPreviousData,
    })

  return {
    reviews: data?.data ?? [],
    meta: data?.meta ?? { page, limit, total: 0, totalPages: 0 },
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
