/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { 
  FileText, Download, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, Search, 
  Loader2, MoreHorizontal, RefreshCw, X
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import POSTDATA from '@/app/default/functions/Post'
import useFetchCertificates from '@/app/default/custom-component/useFetchCertificate'
import DELETEDATA from '@/app/default/functions/DeleteData'

export default function AllCertificates() {
  // State
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [deleteFilter, setDeleteFilter] = useState<'all' | 'active' | 'deleted'>('active')
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editData, setEditData] = useState({ issuedDate: '' })
  const [updating, setUpdating] = useState(false)

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch certificates
  const { 
    certificates, 
    meta, 
    isLoading, 
    isFetching, 
    refetch,
    totalPages 
  } = useFetchCertificates({
    page,
    limit,
    search: debouncedSearch,
    isDelete: deleteFilter === 'all' ? undefined : deleteFilter === 'deleted',
  })


 const formatDate = (
  date: string | number | Date | null | undefined,
  format: 'full' | 'long' | 'medium' | 'short' | 'MMM DD, YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'time' | 'datetime' = 'MMM DD, YYYY'
): string => {
  if (!date) return 'N/A'

  try {
    const dateObj = new Date(date)
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }

    switch (format) {
      case 'full':
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })

      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })

      case 'medium':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })

      case 'short':
        return dateObj.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit'
        })

      case 'DD/MM/YYYY': {
        const day = dateObj.getDate().toString().padStart(2, '0')
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
        const year = dateObj.getFullYear()
        return `${day}/${month}/${year}`
      }

      case 'YYYY-MM-DD': {
        const day = dateObj.getDate().toString().padStart(2, '0')
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
        const year = dateObj.getFullYear()
        return `${year}-${month}-${day}`
      }

      case 'time':
        return dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })

      case 'datetime':
        return dateObj.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })

      case 'MMM DD, YYYY':
      default: {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = months[dateObj.getMonth()]
        const day = dateObj.getDate()
        const year = dateObj.getFullYear()
        return `${month} ${day}, ${year}`
      }
    }
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

  // Handle delete/restore
  const handleDeleteToggle = async (certificate: any, hardDelete: boolean = false) => {
    try {
      const url = hardDelete 
        ? `/v1/certificate/${certificate._id}?hard=true`
        : `/v1/certificate/${certificate._id}/toggle-delete`

      const res = await DELETEDATA(url)

      if (res?.success) {
        toast.success(
          hardDelete 
            ? 'Certificate permanently deleted' 
            : certificate.isDelete 
              ? 'Certificate restored successfully' 
              : 'Certificate moved to trash'
        )
        refetch()
        setDetailsOpen(false)
      } else {
        throw new Error(res?.message || 'Operation failed')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Handle download
  const handleDownload = async (certificate: any) => {
    try {
      const response = await fetch(`/v1/certificate/${certificate._id}/download`)
      
      if (!response.ok) {
        throw new Error('Failed to download certificate')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${certificate._id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Certificate downloaded successfully')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Handle view
  const handleView = (certificate: any) => {
    setSelectedCertificate(certificate)
    setDetailsOpen(true)
  }

  // Handle edit
  const handleEdit = (certificate: any) => {
    setSelectedCertificate(certificate)
    setEditData({ issuedDate: certificate.issuedDate.split('T')[0] })
    setEditOpen(true)
  }

  // Handle update
  const handleUpdate = async () => {
    if (!selectedCertificate) return

    try {
      setUpdating(true)
      const res = await POSTDATA(
        `/v1/certificate/${selectedCertificate._id}`,
        { issuedDate: new Date(editData.issuedDate) },
      )

      if (res?.success) {
        toast.success('Certificate updated successfully')
        setEditOpen(false)
        refetch()
      } else {
        throw new Error(res?.message || 'Update failed')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUpdating(false)
    }
  }

  // Handle preview
  const handlePreview = async (certificate: any) => {
    if (certificate.certificateUrl) {
      window.open(certificate.certificateUrl, '_blank')
    } else {
      toast.error('No certificate URL available')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Certificate Management
          </CardTitle>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, course title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearch('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                <SelectTrigger className="w-25">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50, 100].map(size => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tabs 
                value={deleteFilter} 
                onValueChange={(v: any) => {
                  setDeleteFilter(v)
                  setPage(1)
                }}
                className="w-75"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="deleted">Deleted</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Table */}
          <div className="rounded md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : certificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No certificates found
                    </TableCell>
                  </TableRow>
                ) : (
                  certificates.map((cert: any) => (
                    <TableRow key={cert._id} className={cert.isDelete ? 'bg-muted/50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {cert.studentId?.userId?.image && (
                            <Image
                              src={cert.studentId.userId.image}
                              alt={cert.studentId.userId.name}
                              width={32}
                              height={32}
                              className="rounded full"
                            />
                          )}
                          <div>
                            <p className="font-medium">
                              {cert.studentId?.userId?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {cert.studentId?.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{cert.courseId?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Level: {cert.courseId?.level}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(cert.issuedDate)}
                      </TableCell>
                      <TableCell>
                        <Badge >
                          {cert.isDelete ? 'Deleted' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cert.certificateUrl ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Stored
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Not Stored
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(cert)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </DropdownMenuItem>
                            
                            {cert.certificateUrl && (
                              <DropdownMenuItem onClick={() => handlePreview(cert)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem onClick={() => handleDownload(cert)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => handleEdit(cert)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Date
                            </DropdownMenuItem>
                            
                            <Separator className="my-1" />
                            
                            {!cert.isDelete ? (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteToggle(cert)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Move to Trash
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={() => handleDeleteToggle(cert)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Restore
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteToggle(cert, true)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Permanently
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, meta.total)} of {meta.total} certificates
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded lg">
                {selectedCertificate.studentId?.userId?.image && (
                  <Image
                    src={selectedCertificate.studentId.userId.image}
                    alt={selectedCertificate.studentId.userId.name}
                    width={60}
                    height={60}
                    className="rounded full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {selectedCertificate.studentId?.userId?.name || 'N/A'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Student ID</p>
                      <p className="font-medium">{selectedCertificate.studentId?.id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedCertificate.studentId?.userId?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedCertificate.studentId?.userId?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-4 bg-muted/30 rounded lg">
                <h3 className="font-semibold mb-2">Course Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Course Title</p>
                    <p className="font-medium">{selectedCertificate.courseId?.title}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Level</p>
                    <p className="font-medium capitalize">{selectedCertificate.courseId?.level}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">${selectedCertificate.courseId?.price || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Instructor</p>
                    <p className="font-medium">{selectedCertificate.courseId?.instructor?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Certificate Info */}
              <div className="p-4 bg-muted/30 rounded lg">
                <h3 className="font-semibold mb-2">Certificate Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Issued Date</p>
                    <p className="font-medium">{formatDate(selectedCertificate.issuedDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge >
                      {selectedCertificate.isDelete ? 'Deleted' : 'Active'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Certificate URL</p>
                    {selectedCertificate.certificateUrl ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => window.open(selectedCertificate.certificateUrl, '_blank')}
                      >
                        View Certificate
                      </Button>
                    ) : (
                      <p className="text-muted-foreground">Not available</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created At</p>
                    <p className="font-medium">{formatDate(selectedCertificate.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedCertificate)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsOpen(false)
                    handleEdit(selectedCertificate)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Date
                </Button>
                {!selectedCertificate.isDelete ? (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteToggle(selectedCertificate)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Move to Trash
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => handleDeleteToggle(selectedCertificate)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restore
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Certificate Date</DialogTitle>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Issued Date</Label>
                <Input
                  type="date"
                  value={editData.issuedDate}
                  onChange={(e) => setEditData({ issuedDate: e.target.value })}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Note: Only the issued date can be modified. Other details are read-only.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}