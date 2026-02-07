/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import useFetchLiveClass from '@/app/default/custom-component/useFetchLiveClass'
import DELETEDATA from '@/app/default/functions/DeleteData'
import PATCHDATA from '@/app/default/functions/Patch'
import  { useState } from 'react'

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

export default function AllLiveClass() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const { liveClasses, meta, isLoading, refetch } = useFetchLiveClass({ page, limit })

  const handleSoftDelete = async (id: string) => {
    try {
      await DELETEDATA(`/v1/live-class/soft/${id}`)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await PATCHDATA(`/v1/live-class/restore/${id}`, { isDeleted: false })
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleHardDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this live class?')) return
    try {
      await DELETEDATA(`/v1/live-class/hard/${id}`)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (id: string) => {
    // navigate to edit page or open modal
    window.location.href = `/live-class/edit/${id}`
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Live Classes</h2>

      {liveClasses.length === 0 && <p>No live classes found.</p>}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>
            <th className="border p-2">Platform</th>
            <th className="border p-2">Start</th>
            <th className="border p-2">End</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {liveClasses.map((liveClass: LiveClass) => (
            <tr key={liveClass._id} className={liveClass.isDeleted ? 'bg-red-50' : ''}>
              <td className="border p-2">{liveClass.title}</td>
              <td className="border p-2">{liveClass.meetingPlatform}</td>
              <td className="border p-2">{new Date(liveClass.startTime).toLocaleString()}</td>
              <td className="border p-2">{new Date(liveClass.endTime).toLocaleString()}</td>
              <td className="border p-2">{liveClass.isDeleted ? 'Deleted' : 'Active'}</td>
              <td className="border p-2 space-x-2">
                {!liveClass.isDeleted && (
                  <>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleSoftDelete(liveClass._id)}
                    >
                      Soft Delete
                    </button>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => handleEdit(liveClass._id)}
                    >
                      Edit
                    </button>
                  </>
                )}

                {liveClass.isDeleted && (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => handleRestore(liveClass._id)}
                    >
                      Restore
                    </button>
                    <button
                      className="bg-red-700 text-white px-2 py-1 rounded"
                      onClick={() => handleHardDelete(liveClass._id)}
                    >
                      Hard Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          disabled={page <= 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>
        <span>
          Page {meta.page} of {Math.ceil(meta.total / meta.limit)}
        </span>
        <button
          disabled={page >= Math.ceil(meta.total / meta.limit)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
