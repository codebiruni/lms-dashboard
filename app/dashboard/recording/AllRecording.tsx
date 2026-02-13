/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import useFetchRecording from '@/app/default/custom-component/useFetchRecording'
import PATCHDATA from '@/app/default/functions/Patch'
import DELETEDATA from '@/app/default/functions/DeleteData'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import {
  RotateCcw,
  Trash2,
  Pencil,
  Play,
  Eye,
  Clock,
  BookOpen,
  Film,
  HardDrive,
  Link as LinkIcon,
  CheckCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import EditRecording from './EditRecording'

/* -------------------- Types -------------------- */

interface Course {
  _id: string
  title: string
  slug?: string
  thumbnail?: string
}

interface User {
  _id: string
  id?: string
  name: string
  email: string
  role: string
  image?: string
}

interface Recording {
  _id: string
  courseId: Course
  liveClassId?: any
  meetingId?: any
  title: string
  description?: string
  videoUrl: string
  uploadedBy: User
  duration?: number
  size?: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}



/* -------------------- Component -------------------- */

export default function AllRecording() {
  /* ---------- Filters & Pagination ---------- */
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [courseId, setCourseId] = useState<string | undefined>()
  const [uploadedBy, setUploadedBy] = useState<string | undefined>()
  const [isDeleted, setIsDeleted] = useState<boolean | undefined>(false)
  const [sortBy, setSortBy] = useState<'createdAt' | 'duration' | 'size'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  /* ---------- Delete / Restore Dialog ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)

  /* ---------- Fetch Recordings ---------- */
  const { recordings, meta, isLoading, refetch } = useFetchRecording({
    page,
    limit,
    courseId,
    uploadedBy,
    isDeleted: isDeleted === undefined ? false : isDeleted,
    search,
    sortBy,
    sortOrder,
  })

  /* ---------- Handlers ---------- */
  const confirmAction = async () => {
    if (!selectedRecording) return

    try {
      if (deleteType === 'soft') {
        await DELETEDATA(`/v1/recording/soft/${selectedRecording._id}`)
      } else if (deleteType === 'hard') {
        await DELETEDATA(`/v1/recording/hard/${selectedRecording._id}`)
      } else if (deleteType === 'restore') {
        await PATCHDATA(`/v1/recording/restore/${selectedRecording._id}`, { isDeleted: false })
      }

      setDeleteOpen(false)
      setSelectedRecording(null)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditClick = (recording: Recording) => {
    setSelectedRecording(recording)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedRecording(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * (meta.limit || 10) + index + 1
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (size?: number) => {
    if (!size) return '-'
    if (size < 1024) return `${size} MB`
    return `${(size / 1024).toFixed(2)} GB`
  }

  const getVideoEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/embed') || url.includes('youtu.be')) {
      return url
    }
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6 p-4">
      {/* Edit Recording Dialog */}
      {selectedRecording && (
        <EditRecording
          recording={selectedRecording}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <h2 className="text-2xl font-bold">All Recordings</h2>

      {/* ---------- Filters ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search by title or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Input
          placeholder="Filter by course ID"
          value={courseId || ''}
          onChange={(e) => setCourseId(e.target.value || undefined)}
        />

        <Input
          placeholder="Filter by uploader ID"
          value={uploadedBy || ''}
          onChange={(e) => setUploadedBy(e.target.value || undefined)}
        />

        <Select 
          value={isDeleted === undefined ? '' : isDeleted ? 'true' : 'false'}
          onValueChange={(v) => setIsDeleted(v === 'true' ? true : v === 'false' ? false : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Deleted" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
            <SelectItem value="size">File Size</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v: 'asc' | 'desc') => setSortOrder(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest/Largest</SelectItem>
            <SelectItem value="asc">Oldest/Smallest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------- Table ---------- */}
      <div className="border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center">#</TableHead>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-16 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))}

            {!isLoading && recordings.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No recordings found
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              recordings.map((recording: Recording, index: number) => (
                <TableRow
                  key={recording._id}
                  className={recording.isDeleted ? 'bg-red-50/50' : ''}
                >
                  <TableCell className="text-center font-medium">
                    {getSerialNumber(index)}
                  </TableCell>

                  <TableCell>
                    <div className            
                    ="relative w-16 h-10 rounded overflow-hidden border bg-muted/20">
                      {recording.videoUrl ? (
                        <Image  width={150} height={84}
                          src={`https://img.youtube.com/vi/${
                            recording.videoUrl.includes('youtube.com/embed/')
                              ? recording.videoUrl.split('/').pop()
                              : recording.videoUrl.includes('v=')
                              ? recording.videoUrl.split('v=')[1]?.split('&')[0]
                              : ''
                          }/0.jpg`}
                          alt={recording.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x225?text=No+Preview'
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-muted">
                          <Film size={16} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-50">
                      <div className="truncate font-medium">{recording.title}</div>
                      {recording.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {recording.description.substring(0, 30)}...
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} className="text-muted-foreground" />
                      <span className="truncate max-w-30">
                        {recording.courseId?.title || 'N/A'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {recording.uploadedBy?.image && (
                        <div className="relative w-8 h-8 rounded full overflow-hidden border shrink-0">
                          <Image
                            src={recording.uploadedBy.image}
                            alt={recording.uploadedBy.name || 'Uploader'}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium truncate max-w-30">
                          {recording.uploadedBy?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {recording.uploadedBy?.role || 'User'}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-muted-foreground" />
                      <span>{recording.duration ? `${recording.duration} min` : '-'}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <HardDrive size={14} className="text-muted-foreground" />
                      <span>{formatFileSize(recording.size)}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={recording.isDeleted ? 'destructive' : 'secondary'}>
                      {recording.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setSelectedRecording(recording)
                          setDetailsOpen(true)
                        }}
                      >
                        <Eye size={16} />
                      </Button>

                      <Link href={recording.videoUrl} target="_blank">
                        <Button size="icon" variant="secondary">
                          <Play size={16} />
                        </Button>
                      </Link>

                      {!recording.isDeleted && (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEditClick(recording)}
                          >
                            <Pencil size={16} />
                          </Button>

                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRecording(recording)
                              setDeleteType('soft')
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}

                      {recording.isDeleted && (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setSelectedRecording(recording)
                              setDeleteType('restore')
                              setDeleteOpen(true)
                            }}
                          >
                            <RotateCcw size={16} />
                          </Button>

                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRecording(recording)
                              setDeleteType('hard')
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* ---------- Pagination ---------- */}
      {!isLoading && meta.total > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * meta.limit + 1} to{' '}
            {Math.min(page * meta.limit, meta.total)} of {meta.total} recordings
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page * meta.limit >= meta.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ---------- Details Dialog ---------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Film className="h-6 w-6" />
              Recording Details
            </DialogTitle>
          </DialogHeader>

          {selectedRecording && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Status</span>
                  </div>
                  <Badge variant={selectedRecording.isDeleted ? 'destructive' : 'secondary'}>
                    {selectedRecording.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock size={14} />
                    <span>Duration</span>
                  </div>
                  <span className="text-xl font-bold">
                    {selectedRecording.duration || 0} min
                  </span>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <HardDrive size={14} />
                    <span>File Size</span>
                  </div>
                  <span className="text-xl font-bold">
                    {formatFileSize(selectedRecording.size)}
                  </span>
                </div>
              </div>

              {/* Video Preview */}
              <div className="relative w-full aspect-video bg-black rounded overflow-hidden">
                <iframe
                  src={getVideoEmbedUrl(selectedRecording.videoUrl)}
                  title={selectedRecording.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Recording Title
                  </h3>
                  <p className="text-lg font-semibold">{selectedRecording.title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </h3>
                  <div className="bg-muted/20 rounded p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedRecording.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Course
                    </h3>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-muted-foreground" />
                      <p className="font-medium">{selectedRecording.courseId?.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {selectedRecording.courseId?._id}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Video URL
                    </h3>
                    <a 
                      href={selectedRecording.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline break-all text-sm"
                    >
                      <LinkIcon size={16} />
                      Watch Video
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Uploaded By
                  </h3>
                  <div className="bg-muted/20 rounded p-3">
                    <div className="flex items-center gap-3">
                      {selectedRecording.uploadedBy?.image && (
                        <div className="relative w-12 h-12 rounded full overflow-hidden border">
                          <Image
                            src={selectedRecording.uploadedBy.image}
                            alt={selectedRecording.uploadedBy.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{selectedRecording.uploadedBy?.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedRecording.uploadedBy?.email}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-1">
                          Role: {selectedRecording.uploadedBy?.role} | ID: {selectedRecording.uploadedBy?._id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Recording ID</p>
                      <p className="font-mono">{selectedRecording._id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Created At</p>
                      <p>{formatDate(selectedRecording.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Last Updated</p>
                      <p>{formatDate(selectedRecording.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------- Delete/Restore Dialog ---------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Confirm Soft Delete'
                : deleteType === 'hard'
                ? 'Confirm Permanent Delete'
                : 'Confirm Restore'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <p className="text-sm text-muted-foreground">
              {deleteType === 'soft' && 'This will move the recording to trash. You can restore it later from the deleted items.'}
              {deleteType === 'hard' && 'This will permanently delete this recording. This action cannot be undone!'}
              {deleteType === 'restore' && 'This will restore the recording from trash. It will be visible again.'}
            </p>

            {deleteType !== 'restore' && (
              <div className="flex items-center space-x-2">
                <Select
                  value={deleteType}
                  onValueChange={(v: any) => setDeleteType(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Delete type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soft">Soft Delete</SelectItem>
                    <SelectItem value="hard">Hard Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={deleteType === 'restore' ? 'secondary' : 'destructive'}
              onClick={confirmAction}
            >
              {deleteType === 'soft' && 'Move to Trash'}
              {deleteType === 'hard' && 'Permanently Delete'}
              {deleteType === 'restore' && 'Restore Recording'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}