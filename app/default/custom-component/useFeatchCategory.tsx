/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

type UseFetchCategoryParams = {
  page?: number
  limit?: number
  search?: string
  deleted?: boolean
}

export default function useFetchCategory({
  page = 1,
  limit = 100,
  search = "",
  deleted = false,
}: UseFetchCategoryParams) {
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    deleted: String(deleted),
    ...(search && { search }),
  }).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<{ data: any[]; meta: any }>({
    queryKey: ["categories", page, limit, search, deleted],
    queryFn: async () => {
      const res = await GETDATA(`/v1/category?${queryString}`)
      return res.data
    },
    placeholderData: keepPreviousData,
  })

  return {
    categories: data?.data ?? [],
    meta: data?.meta ?? { page, limit, total: 0 },
    isLoading,
    isFetching,
    error,
    refetch,
  }
}




// 
// import useAxiosSource from "./useAxiosSorce";

// export default function useContactMessage() {
//   const { axiosSource } = useAxiosSource();
//   const { data: contactMessages = [], refetch } = useQuery({
//     queryKey: ["contactMessages"],
//     queryFn: async () => {
//       const res = await axiosSource.get("/contact_message");
//       return res.data;
//     },
//   });
//   return { contactMessages, refetch };
// }
