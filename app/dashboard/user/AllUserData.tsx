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
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Eye, Pencil, Trash2, User } from 'lucide-react'
import Image from 'next/image'

/* -------------------- Constants -------------------- */

const roles = ['admin', 'instructor', 'student', 'staff']
const statuses = ['active', 'inactive', 'blocked']

/* -------------------- Component -------------------- */

export default function AllUserData() {
  /* ---------- filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [role, setRole] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [verified, setVerified] = useState<boolean | undefined>()
  const [deleted, setDeleted] = useState<boolean | undefined>()
  const [year, setYear] = useState<number | undefined>()
  const [month, setMonth] = useState<number | undefined>()
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1)

  /* ---------- delete dialog ---------- */
  const [open, setOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const {
    users,
    meta,
    isLoading,
    refetch,
  } = useFetchUsers({
    page,
    search,
    role,
    status,
    verified,
    deleted,
    year,
    month,
    sortBy,
    sortOrder,
  })

  /* -------------------- Handlers -------------------- */

  const updateUser = async (id: string, payload: any) => {
    await PATCHDATA(`/v1/user/${id}`, payload)
    refetch()
  }

  const confirmDelete = async () => {
    if (!selectedUserId) return

    if (deleteType === 'soft') {
      await DELETEDATA(`/v1/user/soft/${selectedUserId}`)
    } else {
      await DELETEDATA(`/v1/user/hard/${selectedUserId}`)
    }

    setOpen(false)
    setSelectedUserId(null)
    refetch()
  }

    const getSerialNumber = (index: number) => {
    return (page - 1) * (meta.limit || 10) + index + 1
  }
  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search name / email / phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={(v) => setRole(v || undefined)}>
          <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setStatus(v || undefined)}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setVerified(v === 'true')}>
          <SelectTrigger><SelectValue placeholder="Verified" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Unverified</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setDeleted(v === 'true')}>
          <SelectTrigger><SelectValue placeholder="Deleted" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Deleted</SelectItem>
            <SelectItem value="false">Active</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setSortOrder(v === '1' ? 1 : -1)}>
          <SelectTrigger><SelectValue placeholder="Sort Order" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Oldest</SelectItem>
            <SelectItem value="-1">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------------- Table ---------------- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-center">#</TableHead>
            <TableHead className="w-10">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Id</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Deleted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading && users.map((user , index) => (
            <TableRow key={user._id}>
                 <TableCell className="text-center font-medium">
                {getSerialNumber(index)}
              </TableCell>

              {/* User Image */}
              <TableCell>
                <div className="flex items-center justify-center">
                  {user.image ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                      <Image
                        src={user.image}
                        alt={user.name || 'User'}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border">
                      <User size={20} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.id}</TableCell>

              <TableCell>
                <Select
                  defaultValue={user.role}
                  onValueChange={(v) => updateUser(user._id, { role: v })}
                >
                  <SelectTrigger className="w-30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>

              <TableCell>
                <Select
                  defaultValue={user.status}
                  onValueChange={(v) => updateUser(user._id, { status: v })}
                >
                  <SelectTrigger className="w-30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
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
                />
              </TableCell>

              <TableCell>
                <Badge variant={user.isDeleted ? 'destructive' : 'secondary'}>
                  {user.isDeleted ? 'Yes' : 'No'}
                </Badge>
              </TableCell>

              <TableCell className="flex justify-end gap-2">
                <Link href={`/dashboard/user/action/details/${user._id}`}>
                  <Button size="icon" variant="outline">
                    <Eye size={16} />
                  </Button>
                </Link>

                <Link href={`/dashboard/user/action/edit/${user._id}`}>
                  <Button size="icon" variant="outline">
                    <Pencil size={16} />
                  </Button>
                </Link>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setSelectedUserId(user._id)
                    setDeleteType('soft')
                    setOpen(true)
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ---------------- Pagination ---------------- */}
      <div className="flex justify-between items-center">
        <p>Total: {meta.total}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page * meta.limit >= meta.total}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* ---------------- Delete Dialog ---------------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Confirm Soft Delete'
                : 'Confirm Permanent Delete'}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure? This action {deleteType === 'hard' && 'cannot be undone'}.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
