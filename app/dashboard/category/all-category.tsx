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
} from "lucide-react"
import { toast } from "sonner"

import useFetchCategory from "@/app/default/custom-component/useFeatchCategory"
import DELETEDATA from "@/app/default/functions/DeleteData"

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

/* -------------------- SKELETON -------------------- */
function CategoryTableSkeleton() {
  return (
    <div className="rounded border bg-background">
      <div className="flex items-center justify-between p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-64" />
      </div>

      <div className="space-y-4 px-6 pb-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[60px_1fr_120px_160px] items-center gap-4"
          >
            <Skeleton className="h-12 w-12 rounded" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-8 w-28 justify-self-end" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AllCategory() {
  /* -------------------- STATE -------------------- */
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [deleted, setDeleted] = useState<"false" | "true">("false")

  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<"soft" | "hard">("soft")

  const limit = 50

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

  /* -------------------- DELETE HANDLER -------------------- */
  const handleDelete = async () => {
    if (!confirmId) return

    try {
      const url =
        deleteType === "hard"
          ? `/v1/category/hard/${confirmId}`
          : `/v1/category/soft/${confirmId}`

      const res = await DELETEDATA(url)

      if (res.success) {
        toast.success(
          deleteType === "hard"
            ? "Category permanently deleted"
            : deleted === "true"
            ? "Category restored successfully"
            : "Category soft deleted"
        )
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
        </div>
      </CardHeader>

      {/* TABLE */}
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  No categories found
                </TableCell>
              </TableRow>
            )}

            {categories.map((category: any) => (
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

                <TableCell>
                  <Badge
                    variant={category.isDeleted ? "destructive" : "default"}
                  >
                    {category.isDeleted ? "Deleted" : "Active"}
                  </Badge>
                </TableCell>

                <TableCell className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/category/action/${category._id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>

                  {deleted === "true" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setDeleteType("soft")
                        setConfirmId(category._id)
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setDeleteType("soft")
                        setConfirmId(category._id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDeleteType("hard")
                      setConfirmId(category._id)
                    }}
                  >
                    Hard
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* FOOTER */}
        <div className="flex flex-col gap-3 border-t px-6 py-4 md:flex-row md:items-center md:justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1}–
            {Math.min(page * limit, meta.total)} of {meta.total}
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

      {/* CONFIRM DIALOG */}
      <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteType === "hard"
                ? "Permanently delete category?"
                : deleted === "true"
                ? "Restore category?"
                : "Soft delete category?"}
            </DialogTitle>
            <DialogDescription>
              {deleteType === "hard"
                ? "This action cannot be undone."
                : "You can restore it later."}
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
