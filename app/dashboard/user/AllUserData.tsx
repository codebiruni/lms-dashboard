/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import useFetchUsers from '@/app/default/custom-component/useFeatchUser'
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
  DialogDescription,
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Eye,
  Pencil,
  RotateCcw,
  Trash2,
  User,
  XCircle,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
} from 'lucide-react'
import Image from 'next/image'

import EditUser from './EditUser'
import { toast } from 'sonner'

/* -------------------- Constants -------------------- */

const roles = ['admin', 'instructor', 'student', 'staff']
const statuses = ['active', 'inactive', 'blocked']

/* -------------------- Types -------------------- */

interface User {
  _id: string
  id: string
  name: string
  email?: string
  phone?: string
  role: string
  image?: string
  status: string
  isVerified: boolean
  isDeleted: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
  __v?: number
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/* -------------------- Skeleton -------------------- */
function UserTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border rounded  lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center">#</TableHead>
              <TableHead className="w-10">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Deleted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-10 w-10 rounded  full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-10" /></TableCell>
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

export default function AllUserData() {
  /* ---------- filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [role, setRole] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [verified, setVerified] = useState<boolean | undefined>()
  const [deleted, setDeleted] = useState<'false' | 'true'>('false')
  const [year, setYear] = useState<number | undefined>()
  const [month, setMonth] = useState<number | undefined>()
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1)

  /* ---------- dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const {
    users,
    meta,
    isLoading,
    isFetching,
    refetch,
  } = useFetchUsers({
    page,
    limit,
    search,
    role,
    status,
    verified,
    deleted: deleted === 'true',
    year,
    month,
    sortBy,
    sortOrder,
  })

  const totalPages = Math.ceil(meta.total / limit)

  /* -------------------- Handlers -------------------- */

  const updateUser = async (id: string, payload: any) => {
    await PATCHDATA(`/v1/user/${id}`, payload)
    refetch()
  }

  const confirmAction = async () => {
    if (!selectedUser) return

    try {
      let url = ""
      let successMessage = ""

      if (deleteType === 'restore') {
        url = `/v1/user/restore/${selectedUser._id}`
        successMessage = 'User restored successfully'
      } else if (deleteType === 'hard') {
        url = `/v1/user/hard/${selectedUser._id}`
        successMessage = 'User permanently deleted'
      } else {
        url = `/v1/user/soft/${selectedUser._id}`
        successMessage = 'User moved to trash'
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
      setSelectedUser(null)
    }
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedUser(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * limit + index + 1
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

  /* -------------------- Loading State -------------------- */
  if (isLoading) return <UserTableSkeleton />

  /* -------------------- UI -------------------- */

  return (
    <>
      {/* Edit User Dialog */}
      {selectedUser && (
        <EditUser
          user={selectedUser}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">User Management</h2>
        </div>

        {/* ---------------- Filters ---------------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name / email / phone"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>

          <Select value={role || 'all'} onValueChange={(v) => setRole(v === 'all' ? undefined : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? undefined : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={verified === undefined ? 'all' : verified ? 'true' : 'false'} 
            onValueChange={(v) => setVerified(v === 'all' ? undefined : v === 'true')}>
            <SelectTrigger>
              <SelectValue placeholder="Verified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
            </SelectContent>
          </Select>

          <Select value={deleted} onValueChange={(v) => setDeleted(v as 'true' | 'false')}>
            <SelectTrigger>
              <SelectValue placeholder="Deleted" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Active</SelectItem>
              <SelectItem value="true">Deleted</SelectItem>
            </SelectContent>
          </Select>

          <Select value={String(sortOrder)} onValueChange={(v) => setSortOrder(v === '1' ? 1 : -1)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Oldest</SelectItem>
              <SelectItem value="-1">Newest</SelectItem>
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
                <TableHead>ID</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Deleted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}

              {users.map((user: User, index: number) => (
                <TableRow key={user._id}>
                  <TableCell className="text-center font-medium">
                    {getSerialNumber(index)}
                  </TableCell>

                  {/* User Image */}
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {user.image ? (
                        <div className="relative w-10 h-10 rounded  full overflow-hidden border">
                          <Image
                            src={user.image}
                            alt={user.name || 'User'}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded  full bg-muted flex items-center justify-center border">
                          <User size={20} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {user.id}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{user.phone || '—'}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Select
                      defaultValue={user.role}
                      onValueChange={(v) => updateUser(user._id, { role: v })}
                      disabled={user.isDeleted}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(r => (
                          <SelectItem key={r} value={r}>
                            <Badge variant="outline" className="capitalize">
                              {r}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Select
                      defaultValue={user.status}
                      onValueChange={(v) => updateUser(user._id, { status: v })}
                      disabled={user.isDeleted}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => (
                          <SelectItem key={s} value={s}>
                            <Badge
                              variant={
                                s === 'active' ? 'default' :
                                s === 'blocked' ? 'destructive' : 'secondary'
                              }
                              className="w-full"
                            >
                              {s}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Switch
                      checked={user.isVerified}
                      onCheckedChange={(v) =>
                        updateUser(user._id, { isVerified: v })
                      }
                      disabled={user.isDeleted}
                    />
                  </TableCell>

                  <TableCell>
                    <Badge variant={user.isDeleted ? 'destructive' : 'secondary'}>
                      {user.isDeleted ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* View Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedUser(user)
                          setDetailsOpen(true)
                        }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Button>

                      {!user.isDeleted ? (
                        <>
                          {/* Edit Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(user)}
                            title="Edit User"
                          >
                            <Pencil size={16} />
                          </Button>

                          {/* Soft Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedUser(user)
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
                              setSelectedUser(user)
                              setDeleteType('restore')
                              setDeleteOpen(true)
                            }}
                            title="Restore User"
                          >
                            <RotateCcw size={16} />
                          </Button>

                          {/* Hard Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedUser(user)
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
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total} users
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
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
                ? 'Delete User?'
                : deleteType === 'hard'
                ? 'Permanently Delete User?'
                : 'Restore User?'}
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'soft' && 'This user will be moved to trash. You can restore them later.'}
              {deleteType === 'hard' && 'This action cannot be undone. The user will be permanently deleted.'}
              {deleteType === 'restore' && 'The user will be restored and become visible again.'}
            </DialogDescription>
          </DialogHeader>

          {deleteType === 'hard' && (
            <div className="py-2">
              <div className="p-3 bg-destructive/10 rounded  lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">This will permanently remove all user data and associated records.</span>
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
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={deleteType === 'restore' ? 'secondary' : 'destructive'}
              onClick={confirmAction}
            >
              {deleteType === 'soft' && 'Move to Trash'}
              {deleteType === 'hard' && 'Permanently Delete'}
              {deleteType === 'restore' && 'Restore User'}
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
              User Details
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded  full overflow-hidden border">
                  {selectedUser.image ? (
                    <Image
                      src={selectedUser.image}
                      alt={selectedUser.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User size={30} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <Badge variant="outline" className="font-mono mt-1">{selectedUser.id}</Badge>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded  lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Shield size={14} />
                    <span>Role</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {selectedUser.role}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded  lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Status</span>
                  </div>
                  <Badge
                    variant={
                      selectedUser.status === 'active' ? 'default' :
                      selectedUser.status === 'blocked' ? 'destructive' : 'secondary'
                    }
                    className={selectedUser.status === 'active' ? 'bg-green-600' : ''}
                  >
                    {selectedUser.status}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded  lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Verified</span>
                  </div>
                  <Badge variant={selectedUser.isVerified ? 'default' : 'secondary'}>
                    {selectedUser.isVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded  lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar size={14} />
                    <span>Last Login</span>
                  </div>
                  <span className="text-sm">{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.email || '—'}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.phone || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Metadata</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">User ID</p>
                    <p className="font-mono">{selectedUser._id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Created</p>
                    <p>{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Updated</p>
                    <p>{formatDate(selectedUser.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Deleted</p>
                    <Badge variant={selectedUser.isDeleted ? 'destructive' : 'secondary'}>
                      {selectedUser.isDeleted ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}