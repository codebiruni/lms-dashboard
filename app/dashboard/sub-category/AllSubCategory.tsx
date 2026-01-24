/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2, Pencil, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

import useFetchSubCategory from '@/app/default/custom-component/useFeatchSubCategory'
import DELETEDATA from '@/app/default/functions/DeleteData'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AllSubCategory() {
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const [category, setCategory] = useState<string | undefined>()
  const [deleted, setDeleted] = useState<'false' | 'true'>('false')

  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')

  const {
    subcategories,
    meta,
    isLoading,
    isFetching,
    refetch,
  } = useFetchSubCategory({
    page,
    limit,
    search,
    category,
    deleted: deleted === 'true',
  })

  /* ------------------ UNIQUE CATEGORIES FROM SUBCATEGORY DATA ------------------ */
  const categoryOptions = useMemo(() => {
    const map = new Map<string, { _id: string; name: string }>()
    subcategories.forEach((s) => {
      if (s.category?._id) {
        map.set(s.category._id, {
          _id: s.category._id,
          name: s.category.name,
        })
      }
    })
    return Array.from(map.values())
  }, [subcategories])

  /* ------------------ DELETE / RESTORE ------------------ */
  const handleDelete = async () => {
    if (!confirmId) return

    try {
      const url =
        deleteType === 'hard'
          ? `/v1/subcategory/hard/${confirmId}`
          : `/v1/subcategory/soft/${confirmId}`

      const res = await DELETEDATA(url)

      if (res.success) {
        toast.success(
          deleteType === 'hard'
            ? 'Permanently deleted'
            : deleted === 'true'
            ? 'Restored successfully'
            : 'Soft deleted successfully'
        )
        refetch()
      } else {
        toast.error(res.message || 'Action failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    } finally {
      setConfirmId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sub Categories</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ------------------ FILTER BAR ------------------ */}
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search sub-category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-56"
          />

          {/* CATEGORY FILTER */}
          <Select
            value={category ?? 'all'}
            onValueChange={(v) => {
              setCategory(v === 'all' ? undefined : v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* DELETED FILTER */}
          <Select
            value={deleted}
            onValueChange={(v) => {
              setDeleted(v as 'true' | 'false')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Active</SelectItem>
              <SelectItem value="true">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ------------------ TABLE ------------------ */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {(isLoading || isFetching) &&
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-32 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading &&
              !isFetching &&
              subcategories.map((s, i) => (
                <TableRow key={s._id}>
                  <TableCell>{(page - 1) * limit + i + 1}</TableCell>
                  <TableCell>
                    <Image
                      src={s.image}
                      alt={s.name}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                    />
                  </TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.category?.name}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/dashboard/sub-category/action/${s._id}`
                        )
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {deleted === 'true' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setDeleteType('soft')
                          setConfirmId(s._id)
                        }}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setDeleteType('soft')
                          setConfirmId(s._id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setDeleteType('hard')
                        setConfirmId(s._id)
                      }}
                    >
                      Hard
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {/* ------------------ PAGINATION ------------------ */}
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {meta.page} of {Math.ceil(meta.total / limit)}
          </span>

          <Button
            size="sm"
            disabled={page >= Math.ceil(meta.total / limit)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>

      {/* ------------------ CONFIRM DIALOG ------------------ */}
      <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'hard'
                ? 'Permanently delete?'
                : deleted === 'true'
                ? 'Restore sub-category?'
                : 'Soft delete sub-category?'}
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'hard'
                ? 'This action cannot be undone.'
                : 'You can restore it later.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
