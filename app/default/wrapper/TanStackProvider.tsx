/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {QueryClient, QueryClientProvider} from '@tanstack/react-query'


const queryClient = new QueryClient()

export default function TanStackProvider({children}:any) {
  return (
    <QueryClientProvider  client={queryClient}>{children}</QueryClientProvider>
  )
}
