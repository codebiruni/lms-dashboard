

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { UploadCloud, Save, Loader2, X, Minus, Plus, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GETDATA from '@/app/default/functions/GetData'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'
import PATCHDATA from '@/app/default/functions/Patch'

export interface ICreateCertificate {
    image: string;
    studentIdPosition: {
        left?: number;
        top?: number;
        fontSize?: number;
        width?: number;
        height?: number;
    }
    namePosition: {
        left?: number;
        top?: number;
        fontSize?: number;
        width?: number;
        height?: number;
    }
    courseNamePosition: {
        left?: number;
        top?: number;
        fontSize?: number;
        width?: number;
        height?: number;
    }
    fontFamily?: string;
    color?: string;
    course: any;
    isDelete: boolean;
}

type DraggableElement = 'studentId' | 'name' | 'courseName' | null
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null

interface EditCertificateTemplateProps {
    templateId: string
    onSuccess?: () => void
    onCancel?: () => void
}

export default function EditCertificateTemplate({ 
    templateId, 
    onSuccess, 
    onCancel 
}: EditCertificateTemplateProps) {
    const router = useRouter()
    
    // Courses data
    const { courses, isLoading: coursesLoading } = useFetchCourses({
        page: 1,
        limit: 100,
        deleted: false,
    })

    // Loading state for initial data
    const [initialLoading, setInitialLoading] = useState(true)

    // Form state
    const [selectedCourse, setSelectedCourse] = useState<string>('')
    const [fontFamily, setFontFamily] = useState<string>('Arial')
    const [textColor, setTextColor] = useState<string>('#333333')
    const [isDelete, setIsDelete] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    // Image state
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [existingImage, setExistingImage] = useState<string | null>(null)

    // Position states for draggable elements with sizes
    const [studentIdPos, setStudentIdPos] = useState({ left: 200, top: 200, fontSize: 24, width: 120, height: 40 })
    const [namePos, setNamePos] = useState({ left: 200, top: 300, fontSize: 32, width: 200, height: 50 })
    const [courseNamePos, setCourseNamePos] = useState({ left: 200, top: 400, fontSize: 28, width: 250, height: 45 })

    // Active element for dragging and editing
    const [activeElement, setActiveElement] = useState<DraggableElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

    // Canvas ref for positioning calculations
    const canvasRef = useRef<HTMLDivElement>(null)
    const elementRefs = {
        studentId: useRef<HTMLDivElement>(null),
        name: useRef<HTMLDivElement>(null),
        courseName: useRef<HTMLDivElement>(null)
    }

    // Font options
    const fontOptions = [
        'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 
        'Georgia', 'Verdana', 'Trebuchet MS', 'Impact', 'Palatino',
        'Garamond', 'Comic Sans MS', 'Lucida Console', 'Roboto',
        'Open Sans', 'Lato', 'Montserrat', 'Poppins'
    ]

    // Fetch template data
    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                setInitialLoading(true)
                const res = await GETDATA(`/v1/certificate-template/${templateId}`)
                
                if (res?.success && res?.data) {
                    const template = res.data
                    
                    // Set form fields
                    setSelectedCourse(template.course._id)
                    setFontFamily(template.fontFamily || 'Arial')
                    setTextColor(template.color || '#333333')
                    setIsDelete(template.isDelete || false)
                    
                    // Set positions
                    if (template.studentIdPosition) {
                        setStudentIdPos({
                            left: template.studentIdPosition.left || 200,
                            top: template.studentIdPosition.top || 200,
                            fontSize: template.studentIdPosition.fontSize || 24,
                            width: template.studentIdPosition.width || 120,
                            height: template.studentIdPosition.height || 40
                        })
                    }
                    
                    if (template.namePosition) {
                        setNamePos({
                            left: template.namePosition.left || 200,
                            top: template.namePosition.top || 300,
                            fontSize: template.namePosition.fontSize || 32,
                            width: template.namePosition.width || 200,
                            height: template.namePosition.height || 50
                        })
                    }
                    
                    if (template.courseNamePosition) {
                        setCourseNamePos({
                            left: template.courseNamePosition.left || 200,
                            top: template.courseNamePosition.top || 400,
                            fontSize: template.courseNamePosition.fontSize || 28,
                            width: template.courseNamePosition.width || 250,
                            height: template.courseNamePosition.height || 45
                        })
                    }
                    
                    // Set image
                    if (template.image) {
                        setExistingImage(template.image)
                        setImagePreview(template.image)
                    }
                } else {
                    toast.error('Failed to load template data')
                }
            } catch (error: any) {
                toast.error(error.message || 'Error loading template')
            } finally {
                setInitialLoading(false)
            }
        }

        if (templateId) {
            fetchTemplate()
        }
    }, [templateId])

    // Handle image upload
    const handleImageUpload = (file: File) => {
        setImage(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
            setExistingImage(null) // Clear existing image when new one is uploaded
        }
        reader.readAsDataURL(file)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (e.dataTransfer.files?.[0]) {
            handleImageUpload(e.dataTransfer.files[0])
        }
    }

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent, element: DraggableElement) => {
        e.preventDefault()
        e.stopPropagation()
        if (!canvasRef.current || !element || isResizing) return

        const canvasRect = canvasRef.current.getBoundingClientRect()
        let currentPos

        switch (element) {
            case 'studentId':
                currentPos = studentIdPos
                break
            case 'name':
                currentPos = namePos
                break
            case 'courseName':
                currentPos = courseNamePos
                break
        }

        setActiveElement(element)
        setIsDragging(true)
        setDragOffset({
            x: e.clientX - canvasRect.left - currentPos.left,
            y: e.clientY - canvasRect.top - currentPos.top,
        })
    }

    // Resize handlers
    const handleResizeStart = (e: React.MouseEvent, element: DraggableElement, handle: ResizeHandle) => {
        e.preventDefault()
        e.stopPropagation()
        if (!element || !handle) return

        let currentPos
        switch (element) {
            case 'studentId':
                currentPos = studentIdPos
                break
            case 'name':
                currentPos = namePos
                break
            case 'courseName':
                currentPos = courseNamePos
                break
        }

        setActiveElement(element)
        setIsResizing(true)
        setResizeHandle(handle)
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: currentPos.width || 100,
            height: currentPos.height || 40
        })
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRef.current) return

            if (isDragging && activeElement) {
                // Handle dragging
                const canvasRect = canvasRef.current.getBoundingClientRect()
                const newLeft = Math.max(0, Math.min(e.clientX - canvasRect.left - dragOffset.x, canvasRect.width))
                const newTop = Math.max(0, Math.min(e.clientY - canvasRect.top - dragOffset.y, canvasRect.height))

                switch (activeElement) {
                    case 'studentId':
                        setStudentIdPos(prev => ({ ...prev, left: newLeft, top: newTop }))
                        break
                    case 'name':
                        setNamePos(prev => ({ ...prev, left: newLeft, top: newTop }))
                        break
                    case 'courseName':
                        setCourseNamePos(prev => ({ ...prev, left: newLeft, top: newTop }))
                        break
                }
            } else if (isResizing && activeElement && resizeHandle) {
                // Handle resizing
                const deltaX = e.clientX - resizeStart.x
                const deltaY = e.clientY - resizeStart.y
                
                let newWidth = resizeStart.width
                let newHeight = resizeStart.height

                switch (resizeHandle) {
                    case 'se': // Bottom-right
                        newWidth = Math.max(50, resizeStart.width + deltaX)
                        newHeight = Math.max(30, resizeStart.height + deltaY)
                        break
                    case 'sw': // Bottom-left
                        newWidth = Math.max(50, resizeStart.width - deltaX)
                        newHeight = Math.max(30, resizeStart.height + deltaY)
                        break
                    case 'ne': // Top-right
                        newWidth = Math.max(50, resizeStart.width + deltaX)
                        newHeight = Math.max(30, resizeStart.height - deltaY)
                        break
                    case 'nw': // Top-left
                        newWidth = Math.max(50, resizeStart.width - deltaX)
                        newHeight = Math.max(30, resizeStart.height - deltaY)
                        break
                }

                switch (activeElement) {
                    case 'studentId':
                        setStudentIdPos(prev => ({ ...prev, width: newWidth, height: newHeight }))
                        break
                    case 'name':
                        setNamePos(prev => ({ ...prev, width: newWidth, height: newHeight }))
                        break
                    case 'courseName':
                        setCourseNamePos(prev => ({ ...prev, width: newWidth, height: newHeight }))
                        break
                }
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            setIsResizing(false)
            setResizeHandle(null)
        }

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, isResizing, activeElement, dragOffset, resizeHandle, resizeStart])

    // Handle element selection
    const selectElement = (element: DraggableElement) => {
        setActiveElement(element)
    }

    // Update font size for active element
    const updateFontSize = (size: number) => {
        switch (activeElement) {
            case 'studentId':
                setStudentIdPos(prev => ({ ...prev, fontSize: size }))
                break
            case 'name':
                setNamePos(prev => ({ ...prev, fontSize: size }))
                break
            case 'courseName':
                setCourseNamePos(prev => ({ ...prev, fontSize: size }))
                break
        }
    }

    // Update dimensions for active element
    const updateDimensions = (type: 'width' | 'height', value: number) => {
        switch (activeElement) {
            case 'studentId':
                setStudentIdPos(prev => ({ ...prev, [type]: value }))
                break
            case 'name':
                setNamePos(prev => ({ ...prev, [type]: value }))
                break
            case 'courseName':
                setCourseNamePos(prev => ({ ...prev, [type]: value }))
                break
        }
    }

    // Get active element styles
    const getActiveFontSize = () => {
        switch (activeElement) {
            case 'studentId':
                return studentIdPos.fontSize
            case 'name':
                return namePos.fontSize
            case 'courseName':
                return courseNamePos.fontSize
            default:
                return 24
        }
    }

    const getActiveDimensions = () => {
        switch (activeElement) {
            case 'studentId':
                return { width: studentIdPos.width || 120, height: studentIdPos.height || 40 }
            case 'name':
                return { width: namePos.width || 200, height: namePos.height || 50 }
            case 'courseName':
                return { width: courseNamePos.width || 250, height: courseNamePos.height || 45 }
            default:
                return { width: 100, height: 40 }
        }
    }

    // Nudge position by arrow keys
    const nudgePosition = (direction: 'left' | 'right' | 'up' | 'down') => {
        if (!activeElement) {
            toast.error('Please select an element first')
            return
        }

        const step = 5
        switch (activeElement) {
            case 'studentId':
                setStudentIdPos(prev => ({
                    ...prev,
                    left: direction === 'left' ? prev.left - step : direction === 'right' ? prev.left + step : prev.left,
                    top: direction === 'up' ? prev.top - step : direction === 'down' ? prev.top + step : prev.top
                }))
                break
            case 'name':
                setNamePos(prev => ({
                    ...prev,
                    left: direction === 'left' ? prev.left - step : direction === 'right' ? prev.left + step : prev.left,
                    top: direction === 'up' ? prev.top - step : direction === 'down' ? prev.top + step : prev.top
                }))
                break
            case 'courseName':
                setCourseNamePos(prev => ({
                    ...prev,
                    left: direction === 'left' ? prev.left - step : direction === 'right' ? prev.left + step : prev.left,
                    top: direction === 'up' ? prev.top - step : direction === 'down' ? prev.top + step : prev.top
                }))
                break
        }
    }

    // Submit form - Update template
    const handleSubmit = async () => {
        if (!selectedCourse) {
            toast.error('Please select a course')
            return
        }

        if (!image && !existingImage) {
            toast.error('Please upload a certificate background image')
            return
        }

        try {
            setLoading(true)

            const formData = new FormData()
            
            // Append each field individually
            formData.append('course', selectedCourse)
            formData.append('fontFamily', fontFamily)
            formData.append('color', textColor)
            formData.append('isDelete', String(isDelete))
            
            // Append position data as JSON strings
            formData.append('studentIdPosition', JSON.stringify({
                left: studentIdPos.left,
                top: studentIdPos.top,
                fontSize: studentIdPos.fontSize,
                width: studentIdPos.width,
                height: studentIdPos.height
            }))
            
            formData.append('namePosition', JSON.stringify({
                left: namePos.left,
                top: namePos.top,
                fontSize: namePos.fontSize,
                width: namePos.width,
                height: namePos.height
            }))
            
            formData.append('courseNamePosition', JSON.stringify({
                left: courseNamePos.left,
                top: courseNamePos.top,
                fontSize: courseNamePos.fontSize,
                width: courseNamePos.width,
                height: courseNamePos.height
            }))

            // Append the image if new one is uploaded
            if (image) {
                formData.append('image', image)
            }

            const res = await PATCHDATA(`/v1/certificate-template/${templateId}`, formData)

            if (!res?.success) {
                throw new Error(res?.message || 'Failed to update certificate template')
            }

            toast.success('Certificate template updated successfully!')

            if (onSuccess) {
                onSuccess()
            } else {
                router.push('/certificate-templates')
            }

        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    // Resize handle component
    const ResizeHandles = ({ element }: { element: DraggableElement }) => {
        if (activeElement !== element) return null

        return (
            <>
                {/* Top-left handle */}
                <div
                    className="absolute w-4 h-4 bg-primary border-2 border-white rounded-sm cursor-nw-resize"
                    style={{ left: -6, top: -6 }}
                    onMouseDown={(e) => handleResizeStart(e, element, 'nw')}
                />
                {/* Top-right handle */}
                <div
                    className="absolute w-4 h-4 bg-primary border-2 border-white rounded-sm cursor-ne-resize"
                    style={{ right: -6, top: -6 }}
                    onMouseDown={(e) => handleResizeStart(e, element, 'ne')}
                />
                {/* Bottom-left handle */}
                <div
                    className="absolute w-4 h-4 bg-primary border-2 border-white rounded-sm cursor-sw-resize"
                    style={{ left: -6, bottom: -6 }}
                    onMouseDown={(e) => handleResizeStart(e, element, 'sw')}
                />
                {/* Bottom-right handle */}
                <div
                    className="absolute w-4 h-4 bg-primary border-2 border-white rounded-sm cursor-se-resize"
                    style={{ right: -6, bottom: -6 }}
                    onMouseDown={(e) => handleResizeStart(e, element, 'se')}
                />
            </>
        )
    }

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={onCancel || (() => router.back())}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Edit Certificate Template</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Canvas Preview - Left side */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Design Canvas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                ref={canvasRef}
                                className="relative w-full aspect-[1.414/1] bg-muted rounded-lg overflow-hidden border-2 border-dashed"
                                style={{
                                    backgroundImage: imagePreview ? 'none' : 'radial-gradient(circle at 10px 10px, #ccc 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}
                            >
                                {imagePreview && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={imagePreview}
                                        alt="Certificate Background"
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                )}

                                {/* Draggable and Resizable Elements */}
                                <div className="relative w-full h-full">
                                    {/* Student ID */}
                                    <div
                                        ref={elementRefs.studentId}
                                        className={`absolute ${activeElement === 'studentId' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                                            }`}
                                        style={{
                                            left: studentIdPos.left,
                                            top: studentIdPos.top,
                                            transform: 'translate(-50%, -50%)',
                                            width: studentIdPos.width,
                                            height: studentIdPos.height,
                                            cursor: isDragging && activeElement === 'studentId' ? 'grabbing' : 'grab',
                                            userSelect: 'none',
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, 'studentId')}
                                        onClick={() => selectElement('studentId')}
                                    >
                                        <div className="w-full h-full flex items-center justify-center p-1 bg-white/10 backdrop-blur-sm rounded border border-dashed border-primary/30"
                                             style={{
                                                 fontSize: studentIdPos.fontSize,
                                                 color: textColor,
                                                 fontFamily,
                                                 textShadow: '0 0 5px rgba(255,255,255,0.8)'
                                             }}>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="secondary" className="text-[10px] py-0 h-4">ID</Badge>
                                                <span className="truncate">STU-12345</span>
                                            </div>
                                        </div>
                                        <ResizeHandles element="studentId" />
                                    </div>

                                    {/* Student Name */}
                                    <div
                                        ref={elementRefs.name}
                                        className={`absolute ${activeElement === 'name' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                                            }`}
                                        style={{
                                            left: namePos.left,
                                            top: namePos.top,
                                            transform: 'translate(-50%, -50%)',
                                            width: namePos.width,
                                            height: namePos.height,
                                            cursor: isDragging && activeElement === 'name' ? 'grabbing' : 'grab',
                                            userSelect: 'none',
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, 'name')}
                                        onClick={() => selectElement('name')}
                                    >
                                        <div className="w-full h-full flex items-center justify-center p-1 bg-white/10 backdrop-blur-sm rounded border border-dashed border-primary/30"
                                             style={{
                                                 fontSize: namePos.fontSize,
                                                 color: textColor,
                                                 fontFamily,
                                                 textShadow: '0 0 5px rgba(255,255,255,0.8)'
                                             }}>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="secondary" className="text-[10px] py-0 h-4">Name</Badge>
                                                <span className="truncate">John Doe</span>
                                            </div>
                                        </div>
                                        <ResizeHandles element="name" />
                                    </div>

                                    {/* Course Name */}
                                    <div
                                        ref={elementRefs.courseName}
                                        className={`absolute ${activeElement === 'courseName' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                                            }`}
                                        style={{
                                            left: courseNamePos.left,
                                            top: courseNamePos.top,
                                            transform: 'translate(-50%, -50%)',
                                            width: courseNamePos.width,
                                            height: courseNamePos.height,
                                            cursor: isDragging && activeElement === 'courseName' ? 'grabbing' : 'grab',
                                            userSelect: 'none',
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, 'courseName')}
                                        onClick={() => selectElement('courseName')}
                                    >
                                        <div className="w-full h-full flex items-center justify-center p-1 bg-white/10 backdrop-blur-sm rounded border border-dashed border-primary/30"
                                             style={{
                                                 fontSize: courseNamePos.fontSize,
                                                 color: textColor,
                                                 fontFamily,
                                                 textShadow: '0 0 5px rgba(255,255,255,0.8)'
                                             }}>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="secondary" className="text-[10px] py-0 h-4">Course</Badge>
                                                <span className="truncate">Web Development</span>
                                            </div>
                                        </div>
                                        <ResizeHandles element="courseName" />
                                    </div>
                                </div>

                                {!imagePreview && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-muted-foreground">Upload background image to start designing</p>
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="mt-4 text-sm text-muted-foreground space-y-1">
                                <p>💡 Click on any element to select it, then drag to position.</p>
                                <p>📏 Use the blue handles to resize elements. Drag from corners to resize.</p>
                                <p>🎨 Selected elements will have a blue ring and resize handles.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Right Panel - Form Controls */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Course Selection */}
                            <div className="space-y-2">
                                <Label>Course <span className="text-red-500">*</span></Label>
                                <Select
                                    value={selectedCourse}
                                    onValueChange={setSelectedCourse}
                                    disabled={coursesLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course: any) => (
                                            <SelectItem key={course._id} value={course._id}>
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label>Background Image</Label>
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    className="relative h-32 cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 hover:border-primary transition flex items-center justify-center"
                                >
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                                    />
                                    {imagePreview ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                fill
                                                className="object-contain rounded-lg"
                                            />
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="absolute top-1 right-1 h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setImage(null)
                                                    setImagePreview(existingImage) // Revert to existing image
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">Upload background</p>
                                        </div>
                                    )}
                                </div>
                                {existingImage && !image && (
                                    <p className="text-xs text-muted-foreground">
                                        Using existing image. Upload a new one to replace.
                                    </p>
                                )}
                            </div>

                            <Separator />

                            {/* Font and Color Controls */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Font Family</Label>
                                    <Select value={fontFamily} onValueChange={setFontFamily}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select font" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fontOptions.map(font => (
                                                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                                    {font}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Text Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={textColor}
                                            onChange={(e) => setTextColor(e.target.value)}
                                            className="w-12 h-10 p-1"
                                        />
                                        <Input
                                            type="text"
                                            value={textColor}
                                            onChange={(e) => setTextColor(e.target.value)}
                                            className="flex-1"
                                            placeholder="#333333"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label>Soft Delete</Label>
                                    <Switch checked={isDelete} onCheckedChange={setIsDelete} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Element Controls */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Element Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Element Selection */}
                            <div className="flex gap-2 flex-wrap">
                                <Badge
                                    variant={activeElement === 'studentId' ? 'default' : 'outline'}
                                    className="cursor-pointer py-2 px-3"
                                    onClick={() => selectElement('studentId')}
                                >
                                    Student ID
                                </Badge>
                                <Badge
                                    variant={activeElement === 'name' ? 'default' : 'outline'}
                                    className="cursor-pointer py-2 px-3"
                                    onClick={() => selectElement('name')}
                                >
                                    Student Name
                                </Badge>
                                <Badge
                                    variant={activeElement === 'courseName' ? 'default' : 'outline'}
                                    className="cursor-pointer py-2 px-3"
                                    onClick={() => selectElement('courseName')}
                                >
                                    Course Name
                                </Badge>
                            </div>

                            {activeElement && (
                                <Tabs defaultValue="position" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="position">Position</TabsTrigger>
                                        <TabsTrigger value="size">Size</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="position" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Font Size: {getActiveFontSize()}px</Label>
                                            <Slider
                                                value={[getActiveFontSize()]}
                                                onValueChange={(value) => updateFontSize(value[0])}
                                                min={12}
                                                max={72}
                                                step={1}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Nudge Position</Label>
                                            <div className="grid grid-cols-3 gap-2 max-w-40 mx-auto">
                                                <div></div>
                                                <Button size="sm" variant="outline" onClick={() => nudgePosition('up')}>
                                                    ↑
                                                </Button>
                                                <div></div>
                                                <Button size="sm" variant="outline" onClick={() => nudgePosition('left')}>
                                                    ←
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => nudgePosition('down')}>
                                                    ↓
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => nudgePosition('right')}>
                                                    →
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            <p>X: {Math.round(activeElement === 'studentId' ? studentIdPos.left : activeElement === 'name' ? namePos.left : courseNamePos.left)}px</p>
                                            <p>Y: {Math.round(activeElement === 'studentId' ? studentIdPos.top : activeElement === 'name' ? namePos.top : courseNamePos.top)}px</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="size" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Width: {getActiveDimensions().width}px</Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateDimensions('width', getActiveDimensions().width - 10)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <Slider
                                                    value={[getActiveDimensions().width]}
                                                    onValueChange={(value) => updateDimensions('width', value[0])}
                                                    min={50}
                                                    max={400}
                                                    step={5}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateDimensions('width', getActiveDimensions().width + 10)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Height: {getActiveDimensions().height}px</Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateDimensions('height', getActiveDimensions().height - 5)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <Slider
                                                    value={[getActiveDimensions().height]}
                                                    onValueChange={(value) => updateDimensions('height', value[0])}
                                                    min={30}
                                                    max={200}
                                                    step={5}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateDimensions('height', getActiveDimensions().height + 5)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onCancel || (() => router.back())}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !selectedCourse || (!image && !existingImage)}
                            className="flex-1"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Update Template
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}