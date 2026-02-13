/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Trash2,
  Pencil,
  RotateCcw,
  Eye,
  XCircle,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import useFetchSubCategory from '@/app/default/custom-component/useFeatchSubCategory'
import DELETEDATA from '@/app/default/functions/DeleteData'
import PATCHDATA from '@/app/default/functions/Patch'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

import EditSubCategory from './EditSubCategory'

/* -------------------- Types -------------------- */

interface Category {
  _id: string
  name: string
  image: string
  isDeleted: boolean
}

interface SubCategory {
  _id: string
  category: Category
  name: string
  image: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

/* -------------------- SKELETON -------------------- */
function SubCategoryTableSkeleton() {
  return (
    <Card className="rounded shadow-sm">
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-10 w-52" />
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-[40px_60px_1fr_1fr_120px] items-center gap-4 py-2">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-28" />
              <div className="flex justify-end gap-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------- MAIN COMPONENT -------------------- */

export default function AllSubCategory() {


  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const [category, setCategory] = useState<string | undefined>()
  const [deleted, setDeleted] = useState<'false' | 'true'>('false')

  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [confirmAction, setConfirmAction] = useState<'delete' | 'restore'>('delete')
  
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null)

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

  const totalPages = Math.ceil(meta.total / limit)

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

  /* ------------------ HANDLERS ------------------ */
  const handleDelete = async () => {
    if (!confirmId) return

    try {
      let url = ""
      let successMessage = ""

      if (confirmAction === "restore") {
        url = `/v1/subcategory/restore/${confirmId}`
        successMessage = "Sub-category restored successfully"
      } else {
        url = deleteType === "hard"
          ? `/v1/subcategory/hard/${confirmId}`
          : `/v1/subcategory/soft/${confirmId}`
        successMessage = deleteType === "hard"
          ? "Sub-category permanently deleted"
          : "Sub-category moved to trash"
      }

      const res = confirmAction === "restore"
        ? await PATCHDATA(url, { isDeleted: false })
        : await DELETEDATA(url)

      if (res.success) {
        toast.success(successMessage)
        refetch()
      } else {
        toast.error(res.message || "Action failed")
      }
    } catch (err: any) {
      toast.error(err.message || "Action failed")
    } finally {
      setConfirmId(null)
    }
  }

  const handleEditClick = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedSubCategory(null)
    refetch()
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

  /* ------------------ LOADING / ERROR ------------------ */
  if (isLoading) return <SubCategoryTableSkeleton />

  /* ------------------ UI ------------------ */
  return (
    <>
      {/* Edit SubCategory Dialog */}
      {selectedSubCategory && (
        <EditSubCategory
          subCategory={selectedSubCategory}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <Card className="rounded shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-xl font-semibold">
            Sub Categories
          </CardTitle>

          <div className="flex gap-2">
            {/* CREATE BUTTON */}
            <Button asChild>
              <a href="/dashboard/sub-category/create">
                Add Sub Category
              </a>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ------------------ FILTER BAR ------------------ */}
          <div className="flex flex-wrap gap-2">
            {/* SEARCH */}
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sub-category..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>

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

            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2 self-center" />
            )}
          </div>

          {/* ------------------ TABLE ------------------ */}
          <div className="border rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Category Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {(isLoading || isFetching) &&
                  Array.from({ length: limit }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-10 rounded" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                {!isLoading && !isFetching && subcategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      No sub-categories found
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  !isFetching &&
                  subcategories.map((s:any, i) => (
                    <TableRow key={s._id}>
                      <TableCell className="text-center font-medium">
                        {(page - 1) * limit + i + 1}
                      </TableCell>
                      
                      <TableCell>
                        {s.image ? (
                          <Image
                            src={s.image}
                            alt={s.name}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="font-medium">{s.name}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          {s.category?.name || 'N/A'}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={s.category?.isDeleted ? "destructive" : "default"} >
                          {s.category?.isDeleted ? "Deleted" : "Active"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(s.createdAt)}
                      </TableCell>

                      <TableCell>
                        <Badge variant={s.isDeleted ? "destructive" : "default"} >
                          {s.isDeleted ? "Deleted" : "Active"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {/* View Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedSubCategory(s)
                              setDetailsOpen(true)
                            }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {!s.isDeleted ? (
                            <>
                              {/* Edit Button */}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditClick(s)}
                                title="Edit Sub Category"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              {/* Delete Button - Opens dialog with dropdown */}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedSubCategory(s)
                                  setConfirmId(s._id)
                                  setConfirmAction("delete")
                                  setDeleteType("soft")
                                }}
                                title="Delete Sub Category"
                              >
                                <Trash2 className="h-4 w-4" />
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
                                  setSelectedSubCategory(s)
                                  setConfirmId(s._id)
                                  setConfirmAction("restore")
                                }}
                                title="Restore Sub Category"
                              >
                                <RotateCcw className="h-4 w-4" />
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

          {/* ------------------ PAGINATION ------------------ */}
          {!isLoading && meta.total > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {/* ------------------ CONFIRM DIALOG with Dropdown ------------------ */}
        <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {confirmAction === "restore"
                  ? "Restore sub-category?"
                  : "Delete sub-category?"}
              </DialogTitle>
              <DialogDescription>
                {confirmAction === "restore"
                  ? "The sub-category will be restored and become visible again."
                  : "Choose how you want to delete this sub-category."}
              </DialogDescription>
            </DialogHeader>

            {confirmAction === "delete" && (
              <div className="py-4">
                <Select
                  value={deleteType}
                  onValueChange={(v: "soft" | "hard") => setDeleteType(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select delete type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soft">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-yellow-600" />
                        <span>Soft Delete - Move to trash</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hard">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span>Hard Delete - Permanently delete</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-4 p-3 bg-muted/30 rounded">
                  {deleteType === "soft" ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-yellow-600" />
                      Sub-category will be moved to trash. You can restore it later.
                    </p>
                  ) : (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      This action cannot be undone. The sub-category will be permanently deleted.
                    </p>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setConfirmId(null)}>
                Cancel
              </Button>
              <Button 
                variant={confirmAction === "restore" ? "secondary" : deleteType === "hard" ? "destructive" : "default"}
                onClick={handleDelete}
              >
                {confirmAction === "restore" && "Restore"}
                {confirmAction === "delete" && deleteType === "soft" && "Move to Trash"}
                {confirmAction === "delete" && deleteType === "hard" && "Permanently Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ------------------ DETAILS DIALOG ------------------ */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Sub Category Details
              </DialogTitle>
            </DialogHeader>

            {selectedSubCategory && (
              <div className="space-y-4 py-3">
                <div className="flex justify-center">
                  {selectedSubCategory.image ? (
                    <Image
                      src={selectedSubCategory.image}
                      alt={selectedSubCategory.name}
                      width={120}
                      height={120}
                      className="rounded object-cover border"
                    />
                  ) : (
                    <div className="flex h-30 w-30 items-center justify-center rounded bg-muted">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="col-span-2 font-medium">{selectedSubCategory.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="col-span-2">{selectedSubCategory.category?.name || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">Category Status:</span>
                    <span className="col-span-2">
                      <Badge variant={selectedSubCategory.category?.isDeleted ? "destructive" : "default"} >
                        {selectedSubCategory.category?.isDeleted ? "Deleted" : "Active"}
                      </Badge>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="col-span-2 font-mono text-xs">{selectedSubCategory._id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="col-span-2">
                      <Badge variant={selectedSubCategory.isDeleted ? "destructive" : "default"}>
                        {selectedSubCategory.isDeleted ? "Deleted" : "Active"}
                      </Badge>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="col-span-2">{formatDate(selectedSubCategory.createdAt)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="col-span-2">{formatDate(selectedSubCategory.updatedAt)}</span>
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
      </Card>
    </>
  )
}