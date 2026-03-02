/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, Pencil, RotateCcw, Trash2, User, Mail, Phone, FileText, Calendar, Award, XCircle, AlertTriangle, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

import PATCHDATA from '@/app/default/functions/Patch'
import DELETEDATA from '@/app/default/functions/DeleteData'
import useFetchStudents, { Student } from '@/app/default/custom-component/useFeatchStudent'
import EditStudent from './EditStudent'
import { toast } from 'sonner'

/* -------------------- Constants -------------------- */
const sortOptions = [
  { label: 'Newest', value: '-1' },
  { label: 'Oldest', value: '1' },
]

/* -------------------- Skeleton -------------------- */
function StudentsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="border rounded  lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center">#</TableHead>
              <TableHead className="w-10">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Bio</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-10 w-10 rounded  full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* -------------------- Component -------------------- */
export default function AllStudents() {
  /* ---------- Filters / State ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [deleted, setDeleted] = useState<'false' | 'true'>('false')
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1)

  /* ---------- Dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  /* ---------- Fetch Students ---------- */
  const { Students, meta, isLoading, isFetching, refetch } = useFetchStudents({
    page,
    limit,
    search,
    deleted: deleted === 'true',
    sortOrder,
  })

  const totalPages = Math.ceil(meta.total / limit)

  /* -------------------- Handlers -------------------- */
  const confirmAction = async () => {
    if (!selectedStudent) return

    try {
      let url = ""
      let successMessage = ""

      if (deleteType === 'restore') {
        url = `/v1/student/restore/${selectedStudent._id}`
        successMessage = 'Student restored successfully'
      } else if (deleteType === 'hard') {
        url = `/v1/student/hard/${selectedStudent._id}`
        successMessage = 'Student permanently deleted'
      } else {
        url = `/v1/student/soft/${selectedStudent._id}`
        successMessage = 'Student moved to trash'
      }

      const res = deleteType === 'restore'
        ? await PATCHDATA(url, { isDeleted: false })
        : await DELETEDATA(url)

      if (res.success) {
        toast.success(successMessage)
        refetch()
      } else {
        toast.error(res.message || 'Action failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    } finally {
      setDeleteOpen(false)
      setSelectedStudent(null)
    }
  }

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedStudent(null)
    refetch()
  }

  const getSerialNumber = (index: number) => (page - 1) * limit + index + 1

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  /* -------------------- Loading State -------------------- */
  if (isLoading) return <StudentsTableSkeleton />

  /* -------------------- UI -------------------- */
  return (
    <>
      {/* Edit Student Dialog */}
      {selectedStudent && (
        <EditStudent
          student={selectedStudent}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Students</h2>
          <Button asChild>
            <Link href="/dashboard/student/create">Add Student</Link>
          </Button>
        </div>

        {/* ---------------- Filters ---------------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name / ID / bio"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={deleted}
            onValueChange={(v) => {
              setDeleted(v as 'true' | 'false')
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Deleted" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Active</SelectItem>
              <SelectItem value="true">Deleted</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setSortOrder(v === '1' ? 1 : -1)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />
          )}
        </div>

        {/* ---------------- Table ---------------- */}
        <div className="border rounded  lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 text-center">#</TableHead>
                <TableHead className="w-10">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              )}

              {Students.map((student: Student, index: number) => (
                <TableRow key={student._id}>
                  <TableCell className="text-center font-medium">{getSerialNumber(index)}</TableCell>

                  {/* Image */}
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {student.userId?.image ? (
                        <div className="relative w-10 h-10 rounded  full overflow-hidden border">
                          <Image src={student.userId.image} alt={student.userId.name} fill className="object-cover" sizes="40px" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded  full bg-muted flex items-center justify-center border">
                          <User size={20} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">{student.userId?.name}</TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{student.userId?.email || '—'}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {student.id}
                    </Badge>
                  </TableCell>

                  <TableCell className="max-w-[150px]">
                    <div className="truncate text-sm">{student.bio || '—'}</div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">
                      {student.enrolledCourses?.length || 0} courses
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={student.isDeleted ? 'destructive' : 'default'}>
                      {student.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* View Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedStudent(student)
                          setDetailsOpen(true)
                        }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Button>

                      {!student.isDeleted ? (
                        <>
                          {/* Edit Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(student)}
                            title="Edit Student"
                          >
                            <Pencil size={16} />
                          </Button>

                          {/* Soft Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedStudent(student)
                              setDeleteType('soft')
                              setDeleteOpen(true)
                            }}
                            title="Move to Trash"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* Restore Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => {
                              setSelectedStudent(student)
                              setDeleteType('restore')
                              setDeleteOpen(true)
                            }}
                            title="Restore Student"
                          >
                            <RotateCcw size={16} />
                          </Button>

                          {/* Hard Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedStudent(student)
                              setDeleteType('hard')
                              setDeleteOpen(true)
                            }}
                            title="Permanently Delete"
                          >
                            <XCircle size={16} />
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

        {/* ---------------- Pagination ---------------- */}
        {meta.total > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total} students
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- Delete/Restore Dialog ---------------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Delete Student?'
                : deleteType === 'hard'
                ? 'Permanently Delete Student?'
                : 'Restore Student?'}
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'soft' && 'This student will be moved to trash. You can restore them later.'}
              {deleteType === 'hard' && 'This action cannot be undone. The student will be permanently deleted.'}
              {deleteType === 'restore' && 'The student will be restored and become visible again.'}
            </DialogDescription>
          </DialogHeader>

          {deleteType === 'hard' && (
            <div className="py-2">
              <div className="p-3 bg-destructive/10 rounded  lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">This will permanently remove all student data including enrollments.</span>
              </div>
            </div>
          )}

          {deleteType !== 'restore' && (
            <div className="py-2">
              <Select
                value={deleteType}
                onValueChange={(v: any) => setDeleteType(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Delete type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soft">Soft Delete (Move to trash)</SelectItem>
                  <SelectItem value="hard">Hard Delete (Permanently)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant={deleteType === 'restore' ? 'secondary' : 'destructive'}
              onClick={confirmAction}
            >
              {deleteType === 'soft' && 'Move to Trash'}
              {deleteType === 'hard' && 'Permanently Delete'}
              {deleteType === 'restore' && 'Restore Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Details Dialog ---------------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6" />
              Student Details
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 py-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded  full overflow-hidden border">
                  {selectedStudent.userId?.image ? (
                    <Image src={selectedStudent.userId.image} alt={selectedStudent.userId.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User size={30} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedStudent.userId?.name}</h3>
                  <Badge variant="outline" className="font-mono mt-1">{selectedStudent.id}</Badge>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded  lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Mail size={14} />
                    <span>Email</span>
                  </div>
                  <p className="font-medium text-sm">{selectedStudent.userId?.email || '—'}</p>
                </div>
                <div className="bg-muted/30 rounded  lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Phone size={14} />
                    <span>Phone</span>
                  </div>
                  <p className="font-medium text-sm">{selectedStudent.userId?.phone || '—'}</p>
                </div>
                <div className="bg-muted/30 rounded  lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Award size={14} />
                    <span>Status</span>
                  </div>
                  <Badge variant={selectedStudent.isDeleted ? 'destructive' : 'default'}>
                    {selectedStudent.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Bio</h3>
                <div className="bg-muted/20 rounded  lg p-3">
                  <p className="text-sm">{selectedStudent.bio || 'No bio provided'}</p>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Enrolled Courses ({selectedStudent.enrolledCourses?.length || 0})</h3>
                {selectedStudent.enrolledCourses && selectedStudent.enrolledCourses.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedStudent.enrolledCourses.map((course: any, idx: number) => (
                      <div key={idx} className="border rounded  lg p-3 bg-muted/10">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{course.name}</span>
                          <Badge variant="outline">{new Date(course.enrollData).toLocaleDateString()}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="ml-1 font-medium">৳{course.amount}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Paid:</span>
                            <span className="ml-1 font-medium text-green-600">৳{course.paid}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Left:</span>
                            <span className="ml-1 font-medium text-orange-600">৳{course.left}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No enrolled courses</p>
                )}
              </div>

              {/* Certificates */}
              {selectedStudent.certificates && selectedStudent.certificates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Certificates</h3>
                  <div className="space-y-2">
                    {selectedStudent.certificates.map((cert: any, idx: number) => (
                      <div key={idx} className="border rounded  lg p-2 flex justify-between items-center">
                        <span className="text-sm">{cert.name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(cert.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Metadata</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Student ID</p>
                    <p className="font-mono">{selectedStudent._id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">User ID</p>
                    <p className="font-mono">{selectedStudent.userId?._id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Created</p>
                    <p>{formatDate(selectedStudent.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Updated</p>
                    <p>{formatDate(selectedStudent.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}