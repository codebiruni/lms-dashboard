/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { 
    FileText,  Eye, Edit, Trash2, 
    ChevronLeft, ChevronRight, Search, X,
    Loader2, MoreHorizontal, RefreshCw, Plus,
    Image as ImageIcon, Type, 
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import EditCertificateTemplate from './EditCertificateTemplate'
import useFetchTemplates from '@/app/default/custom-component/useFetchCertificateTemplate'
import DELETEDATA from '@/app/default/functions/DeleteData'



// Simple version with just the formats you need
export const formatDate = (
  date: string | number | Date | null | undefined,
  format: 'default' | 'short' | 'dd/mm/yyyy' | 'yyyy-mm-dd' = 'default'
): string => {
  if (!date) return 'N/A'

  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Invalid Date'

    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    const shortYear = year.toString().slice(-2)
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthName = months[d.getMonth()]

    switch (format) {
      case 'dd/mm/yyyy':
        return `${day}/${month}/${year}`
      case 'yyyy-mm-dd':
        return `${year}-${month}-${day}`
      case 'short':
        return `${day}/${month}/${shortYear}`
      case 'default':
      default:
        return `${monthName} ${day}, ${year}`
    }
  } catch {
    return 'Invalid Date'
  }
}

export default function AllCertificateTemplate() {
    const router = useRouter()
    
    // State
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [deleteFilter, setDeleteFilter] = useState<'all' | 'active' | 'deleted'>('active')
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [hardDelete, setHardDelete] = useState(false)
    const [updating, setUpdating] = useState(false)

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    // Fetch templates
    const { 
        templates, 
        meta, 
        isLoading, 
        isFetching, 
        refetch,
        totalPages 
    } = useFetchTemplates({
        page,
        limit,
        search: debouncedSearch,
        isDelete: deleteFilter === 'all' ? undefined : deleteFilter === 'deleted',
    })

    // Handle delete/restore
    const handleDeleteToggle = async (template: any, permanent: boolean = false) => {
        try {
            setUpdating(true)
            const url = permanent 
                ? `/v1/certificate-template/${template._id}?hard=true`
                : `/v1/certificate-template/${template._id}/toggle-delete`

            const res = await DELETEDATA(url)

            if (res?.success) {
                toast.success(
                    permanent 
                        ? 'Template permanently deleted' 
                        : template.isDelete 
                            ? 'Template restored successfully' 
                            : 'Template moved to trash'
                )
                refetch()
                setDeleteDialogOpen(false)
                setDetailsOpen(false)
            } else {
                throw new Error(res?.message || 'Operation failed')
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setUpdating(false)
        }
    }

    // Handle view details
    const handleViewDetails = (template: any) => {
        setSelectedTemplate(template)
        setDetailsOpen(true)
    }

    // Handle edit
    const handleEdit = (template: any) => {
        setSelectedTemplate(template)
        setEditOpen(true)
    }

    // Handle edit success
    const handleEditSuccess = () => {
        setEditOpen(false)
        refetch()
    }

    // Handle create new
    const handleCreateNew = () => {
        router.push('/certificate-templates/create')
    }

    // Preview image
    const handlePreviewImage = (imageUrl: string) => {
        window.open(imageUrl, '_blank')
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Certificate Templates
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => refetch()}>
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button onClick={handleCreateNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Template
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by course name, font family..."
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
                                    <TableHead>Preview</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Font Family</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    // Loading skeletons
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-12 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : templates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No certificate templates found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    templates.map((template: any) => (
                                        <TableRow key={template._id} className={template.isDelete ? 'bg-muted/50' : ''}>
                                            <TableCell>
                                                <div 
                                                    className="relative h-12 w-20 rounded cursor-pointer overflow-hidden border"
                                                    onClick={() => handlePreviewImage(template.image)}
                                                >
                                                    <Image
                                                        src={template.image}
                                                        alt="Template preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{template.course?.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Level: {template.course?.level || 'N/A'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Type className="h-3 w-3 text-muted-foreground" />
                                                    <span style={{ fontFamily: template.fontFamily }}>
                                                        {template.fontFamily}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="h-5 w-5 rounded border"
                                                        style={{ backgroundColor: template.color }}
                                                    />
                                                    <span>{template.color}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(template.createdAt, 'short')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge >
                                                    {template.isDelete ? 'Deleted' : 'Active'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewDetails(template)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Details
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuItem onClick={() => handlePreviewImage(template.image)}>
                                                            <ImageIcon className="h-4 w-4 mr-2" />
                                                            View Image
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuItem onClick={() => handleEdit(template)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        
                                                        <Separator className="my-1" />
                                                        
                                                        {!template.isDelete ? (
                                                            <DropdownMenuItem 
                                                                onClick={() => {
                                                                    setSelectedTemplate(template)
                                                                    setHardDelete(false)
                                                                    setDeleteDialogOpen(true)
                                                                }}
                                                                className="text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Move to Trash
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <>
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleDeleteToggle(template)}
                                                                >
                                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                                    Restore
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => {
                                                                        setSelectedTemplate(template)
                                                                        setHardDelete(true)
                                                                        setDeleteDialogOpen(true)
                                                                    }}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, meta.total)} of {meta.total} templates
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
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Template Details</DialogTitle>
                    </DialogHeader>
                    
                    {selectedTemplate && (
                        <div className="space-y-6">
                            {/* Preview Image */}
                            <div className="relative w-full aspect-[1.414/1] rounded lg overflow-hidden border">
                                <Image
                                    src={selectedTemplate.image}
                                    alt="Template preview"
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            {/* Course Info */}
                            <div className="p-4 bg-muted/30 rounded lg">
                                <h3 className="font-semibold mb-2">Course Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Course</p>
                                        <p className="font-medium">{selectedTemplate.course?.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Course ID</p>
                                        <p className="font-medium text-xs">{selectedTemplate.course?._id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Position Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Student ID Position */}
                                <div className="p-4 bg-muted/30 rounded lg">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Badge variant="secondary">ID</Badge>
                                        Student ID
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                        <p>Left: {selectedTemplate.studentIdPosition?.left}px</p>
                                        <p>Top: {selectedTemplate.studentIdPosition?.top}px</p>
                                        <p>Font Size: {selectedTemplate.studentIdPosition?.fontSize}px</p>
                                        {selectedTemplate.studentIdPosition?.width && (
                                            <p>Width: {selectedTemplate.studentIdPosition.width}px</p>
                                        )}
                                        {selectedTemplate.studentIdPosition?.height && (
                                            <p>Height: {selectedTemplate.studentIdPosition.height}px</p>
                                        )}
                                    </div>
                                </div>

                                {/* Name Position */}
                                <div className="p-4 bg-muted/30 rounded lg">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Badge variant="secondary">Name</Badge>
                                        Student Name
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                        <p>Left: {selectedTemplate.namePosition?.left}px</p>
                                        <p>Top: {selectedTemplate.namePosition?.top}px</p>
                                        <p>Font Size: {selectedTemplate.namePosition?.fontSize}px</p>
                                        {selectedTemplate.namePosition?.width && (
                                            <p>Width: {selectedTemplate.namePosition.width}px</p>
                                        )}
                                        {selectedTemplate.namePosition?.height && (
                                            <p>Height: {selectedTemplate.namePosition.height}px</p>
                                        )}
                                    </div>
                                </div>

                                {/* Course Name Position */}
                                <div className="p-4 bg-muted/30 rounded lg">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Badge variant="secondary">Course</Badge>
                                        Course Name
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                        <p>Left: {selectedTemplate.courseNamePosition?.left}px</p>
                                        <p>Top: {selectedTemplate.courseNamePosition?.top}px</p>
                                        <p>Font Size: {selectedTemplate.courseNamePosition?.fontSize}px</p>
                                        {selectedTemplate.courseNamePosition?.width && (
                                            <p>Width: {selectedTemplate.courseNamePosition.width}px</p>
                                        )}
                                        {selectedTemplate.courseNamePosition?.height && (
                                            <p>Height: {selectedTemplate.courseNamePosition.height}px</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Style Settings */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Font Family</p>
                                    <p className="font-medium" style={{ fontFamily: selectedTemplate.fontFamily }}>
                                        {selectedTemplate.fontFamily}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Color</p>
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="h-5 w-5 rounded border"
                                            style={{ backgroundColor: selectedTemplate.color }}
                                        />
                                        <p className="font-medium">{selectedTemplate.color}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Created</p>
                                    <p>{formatDate(selectedTemplate.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Last Updated</p>
                                    <p>{formatDate(selectedTemplate.updatedAt)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <Badge >
                                        {selectedTemplate.isDelete ? 'Deleted' : 'Active'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePreviewImage(selectedTemplate.image)}
                                >
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    View Full Image
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setDetailsOpen(false)
                                        handleEdit(selectedTemplate)
                                    }}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Template
                                </Button>
                                {!selectedTemplate.isDelete ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setDetailsOpen(false)
                                            setSelectedTemplate(selectedTemplate)
                                            setHardDelete(false)
                                            setDeleteDialogOpen(true)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Move to Trash
                                    </Button>
                                ) : (
                                    <Button
                                        variant="default"
                                        onClick={() => handleDeleteToggle(selectedTemplate)}
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
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Certificate Template</DialogTitle>
                    </DialogHeader>
                    {selectedTemplate && (
                        <EditCertificateTemplate
                            templateId={selectedTemplate._id}
                            onSuccess={handleEditSuccess}
                            onCancel={() => setEditOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {hardDelete ? 'Permanently Delete Template' : 'Move Template to Trash'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {selectedTemplate && (
                        <div className="space-y-4 py-4">
                            <p>
                                {hardDelete 
                                    ? 'Are you sure you want to permanently delete this template? This action cannot be undone.'
                                    : 'Are you sure you want to move this template to trash? You can restore it later.'}
                            </p>
                            
                            <div className="p-4 bg-muted/30 rounded lg">
                                <p className="font-medium">{selectedTemplate.course?.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    Font: {selectedTemplate.fontFamily} | Color: {selectedTemplate.color}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant={hardDelete ? 'destructive' : 'default'}
                            onClick={() => handleDeleteToggle(selectedTemplate, hardDelete)}
                            disabled={updating}
                        >
                            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {hardDelete ? 'Permanently Delete' : 'Move to Trash'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}