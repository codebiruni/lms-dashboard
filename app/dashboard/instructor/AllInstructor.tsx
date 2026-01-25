/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import useFetchInstructors from '@/app/default/custom-component/useFearchInstructor'
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
import {
  Eye,
  Trash2,
  RotateCcw,
  User,
//   DollarSign,
} from 'lucide-react'

/* -------------------- Constants -------------------- */

const approvalStatuses = ['pending', 'approved', 'rejected']
const sortFields = [
  { label: 'Join Date', value: 'joinDate' },
  { label: 'Salary', value: 'selery' },
]

/* -------------------- Component -------------------- */

export default function AllInstructor() {
  /* ---------- filters ---------- */
  const [search, setSearch] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [page, setPage] = useState(1)
  const [approvalStatus, setApprovalStatus] =
    useState<'pending' | 'approved' | 'rejected' | undefined>()
  const [deleted, setDeleted] = useState(false)
  const [sortBy, setSortBy] =
    useState<'joinDate' | 'selery'>('joinDate')
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1)

  /* ---------- dialog ---------- */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionType, setActionType] =
    useState<'soft' | 'soft' | null>(null)
  const [selectedInstructor, setSelectedInstructor] =
    useState<any>(null)

  const {
    instructors,
    meta,
    isLoading,
    refetch,
  } = useFetchInstructors({
    page,
    search,
    approvalStatus,
    deleted,
    sortBy,
    sortOrder,
  })

  /* -------------------- Handlers -------------------- */

  const updateInstructor = async (id: string, payload: any) => {
    await PATCHDATA(`/v1/instructor/${id}`, payload)
    refetch()
  }

  const confirmAction = async () => {
    if (!selectedInstructor || !actionType) return

    if (actionType === 'soft') {
      await DELETEDATA(`/v1/instructor/soft/${selectedInstructor._id}`)
    }

    // if (actionType === 'soft') {
    //   await DELETEDATA(`/v1/instructor/soft/${selectedInstructor._id}`)
    // }

    setDialogOpen(false)
    setSelectedInstructor(null)
    setActionType(null)
    refetch()
  }

  const getSerial = (i: number) =>
    (page - 1) * meta.limit + i + 1

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={(v) => setApprovalStatus(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Approval" />
          </SelectTrigger>
          <SelectContent>
            {approvalStatuses.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setDeleted(v === 'true')}>
          <SelectTrigger>
            <SelectValue placeholder="Deleted" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={sortBy}
          onValueChange={(v) => setSortBy(v as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {sortFields.map(s => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={String(sortOrder)}
          onValueChange={(v) =>
            setSortOrder(v === '1' ? 1 : -1)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">Newest</SelectItem>
            <SelectItem value="1">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------------- Table ---------------- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Approval</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Deleted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading && instructors.map((ins, i) => (
            <TableRow key={ins._id}>
              <TableCell>{getSerial(i)}</TableCell>

              <TableCell>
                {ins.userId?.image ? (
                  <Image
                    src={ins.userId.image}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <User />
                )}
              </TableCell>

              <TableCell>{ins.userId?.name}</TableCell>
              <TableCell>{ins.id}</TableCell>

              <TableCell>
                <Select
                  defaultValue={ins.approvalStatus}
                  onValueChange={(v) =>
                    updateInstructor(ins._id, { approvalStatus: v })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {approvalStatuses.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>

              {/* -------- Salary Update -------- */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {/* <DollarSign size={14} /> */}
                  <Input
                    className="w-24"
                    defaultValue={ins.selery}
                    onBlur={(e) =>
                      updateInstructor(ins._id, {
                        selery: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </TableCell>

              <TableCell>
                <Badge variant={ins.isDeleted ? 'destructive' : 'secondary'}>
                  {ins.isDeleted ? 'Yes' : 'No'}
                </Badge>
              </TableCell>

              <TableCell className="flex justify-end gap-2">
                <Link href={`/dashboard/instructor/details/${ins._id}`}>
                  <Button size="icon" variant="outline">
                    <Eye size={16} />
                  </Button>
                </Link>

                {/* Soft delete */}
                {!ins.isDeleted && (
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      setSelectedInstructor(ins)
                      setActionType('soft')
                      setDialogOpen(true)
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}

                {/* Restore / soft */}
                {ins.isDeleted && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setSelectedInstructor(ins)
                      setActionType('soft')
                      setDialogOpen(true)
                    }}
                  >
                    <RotateCcw size={16} />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ---------------- Confirm Dialog ---------------- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you absolutely sure?
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            This action will update instructor state.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
