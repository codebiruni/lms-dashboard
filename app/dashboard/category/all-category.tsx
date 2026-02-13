/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Pencil,
  Loader2,
  ImageIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RotateCcw,
  Eye,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

import useFetchCategory from "@/app/default/custom-component/useFeatchCategory"
import DELETEDATA from "@/app/default/functions/DeleteData"
import PATCHDATA from "@/app/default/functions/Patch"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import EditCategory from "./EditCategory"

/* -------------------- Types -------------------- */

interface Category {
  _id: string
  name: string
  image: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

/* -------------------- SKELETON -------------------- */
function CategoryTableSkeleton() {
  return (
    <Card className="rounded shadow-sm">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4 px-6 pb-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[60px_1fr_120px_200px] items-center gap-4 py-2"
            >
              <Skeleton className="h-12 w-12 rounded" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-6 w-20 rounded" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-9 w-9 rounded" />
                <Skeleton className="h-9 w-9 rounded" />
                <Skeleton className="h-9 w-9 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t px-6 py-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-5 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------- MAIN COMPONENT -------------------- */

export default function AllCategory() {
  /* -------------------- STATE -------------------- */
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [deleted, setDeleted] = useState<"false" | "true">("false")
  const [limit] = useState(10)

  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<"soft" | "hard">("soft")
  const [confirmAction, setConfirmAction] = useState<"delete" | "restore">("delete")
  
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  /* -------------------- DATA -------------------- */
  const {
    categories,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFetchCategory({
    page,
    limit,
    search,
    deleted: deleted === "true",
  })

  const totalPages = Math.ceil(meta.total / limit)

  /* -------------------- HANDLERS -------------------- */
  const handleDelete = async () => {
    if (!confirmId) return

    try {
      let url = ""
      let successMessage = ""

      if (confirmAction === "restore") {
        url = `/v1/category/restore/${confirmId}`
        successMessage = "Category restored successfully"
      } else {
        url = deleteType === "hard"
          ? `/v1/category/hard/${confirmId}`
          : `/v1/category/soft/${confirmId}`
        successMessage = deleteType === "hard"
          ? "Category permanently deleted"
          : "Category moved to trash"
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

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedCategory(null)
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

  /* -------------------- LOADING / ERROR -------------------- */
  if (isLoading) return <CategoryTableSkeleton />

  if (error) {
    return (
      <div className="text-center text-sm text-red-500">
        Failed to load categories
      </div>
    )
  }

  /* -------------------- UI -------------------- */
  return (
    <>
      {/* Edit Category Dialog */}
      {selectedCategory && (
        <EditCategory
          category={selectedCategory}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <Card className="rounded shadow-sm">
        {/* HEADER */}
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-xl font-semibold">
            Categories
          </CardTitle>

          <div className="flex gap-2">
            {/* SEARCH */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search category..."
                value={search}
                onChange={(e) => {
                  setPage(1)
                  setSearch(e.target.value)
                }}
                className="pl-9"
              />
            </div>

            {/* DELETED FILTER */}
            <Select
              value={deleted}
              onValueChange={(v) => {
                setDeleted(v as "true" | "false")
                setPage(1)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Active</SelectItem>
                <SelectItem value="true">Deleted</SelectItem>
              </SelectContent>
            </Select>

            {/* CREATE BUTTON */}
            <Button asChild>
              <Link href="/dashboard/category/create">
                Add Category
              </Link>
            </Button>
          </div>
        </CardHeader>

        {/* TABLE */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No categories found
                  </TableCell>
                </TableRow>
              )}

              {categories.map((category: Category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={44}
                        height={44}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="font-medium">
                    {category.name}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(category.createdAt)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={category.isDeleted ? "destructive" : "default"}
                    >
                      {category.isDeleted ? "Deleted" : "Active"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* View Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCategory(category)
                          setDetailsOpen(true)
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {!category.isDeleted ? (
                        <>
                          {/* Edit Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(category)}
                            title="Edit Category"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {/* Delete Button - Opens dialog with dropdown */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedCategory(category)
                              setConfirmId(category._id)
                              setConfirmAction("delete")
                              setDeleteType("soft") // Default to soft delete
                            }}
                            title="Delete Category"
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
                              setSelectedCategory(category)
                              setConfirmId(category._id)
                              setConfirmAction("restore")
                            }}
                            title="Restore Category"
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

          {/* FOOTER */}
          <div className="flex flex-col gap-3 border-t px-6 py-4 md:flex-row md:items-center md:justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, meta.total)} of {meta.total} categories
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
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {isFetching && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </CardContent>

        {/* CONFIRM DIALOG with Dropdown */}
        <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {confirmAction === "restore"
                  ? "Restore category?"
                  : "Delete category?"}
              </DialogTitle>
              <DialogDescription>
                {confirmAction === "restore"
                  ? "The category will be restored and become visible again."
                  : "Choose how you want to delete this category."}
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

                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  {deleteType === "soft" ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-yellow-600" />
                      Category will be moved to trash. You can restore it later.
                    </p>
                  ) : (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      This action cannot be undone. The category will be permanently deleted.
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

        {/* DETAILS DIALOG */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Category Details
              </DialogTitle>
            </DialogHeader>

            {selectedCategory && (
              <div className="space-y-4 py-3">
                <div className="flex justify-center">
                  {selectedCategory.image ? (
                    <Image
                      src={selectedCategory.image}
                      alt={selectedCategory.name}
                      width={120}
                      height={120}
                      className="rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="flex h-30 w-30 items-center justify-center rounded-lg bg-muted">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="col-span-2 font-medium">{selectedCategory.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="col-span-2 font-mono text-xs">{selectedCategory._id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="col-span-2">
                      <Badge variant={selectedCategory.isDeleted ? "destructive" : "default"}>
                        {selectedCategory.isDeleted ? "Deleted" : "Active"}
                      </Badge>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="col-span-2">{formatDate(selectedCategory.createdAt)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="col-span-2">{formatDate(selectedCategory.updatedAt)}</span>
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