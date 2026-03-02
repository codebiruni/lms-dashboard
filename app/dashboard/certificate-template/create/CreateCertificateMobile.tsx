/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
    UploadCloud, Save, Loader2, X, Minus, Plus, 
    Move, Trash2,
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    Eye, EyeOff, Settings, Image as ImageIcon,
    Copy, Grid, ZoomIn, ZoomOut
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import POSTDATA from '@/app/default/functions/Post'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

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

export default function CreateCertificateMobile() {
    // Courses data
    const { courses, isLoading: coursesLoading } = useFetchCourses({
        page: 1,
        limit: 100,
        deleted: false,
    })

    // Form state
    const [selectedCourse, setSelectedCourse] = useState<string>('')
    const [fontFamily, setFontFamily] = useState<string>('Arial')
    const [textColor, setTextColor] = useState<string>('#333333')
    const [isDelete, setIsDelete] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    // Image state
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Position states for draggable elements with sizes
    const [studentIdPos, setStudentIdPos] = useState({ left: 200, top: 200, fontSize: 18, width: 100, height: 30 })
    const [namePos, setNamePos] = useState({ left: 200, top: 300, fontSize: 24, width: 160, height: 40 })
    const [courseNamePos, setCourseNamePos] = useState({ left: 200, top: 400, fontSize: 20, width: 200, height: 35 })

    // Active element for dragging and editing
    const [activeElement, setActiveElement] = useState<DraggableElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

    // UI state
    const [showGrid, setShowGrid] = useState(true)
    const [zoom, setZoom] = useState(1)
    const [activeTab, setActiveTab] = useState('elements')
    const [layers, setLayers] = useState([
        { id: 'studentId', name: 'Student ID', visible: true, locked: false },
        { id: 'name', name: 'Student Name', visible: true, locked: false },
        { id: 'courseName', name: 'Course Name', visible: true, locked: false },
    ])

    // Canvas ref for positioning calculations
    const canvasRef = useRef<HTMLDivElement>(null)
    const canvasContainerRef = useRef<HTMLDivElement>(null)
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

    // Handle image upload
    const handleImageUpload = (file: File) => {
        setImage(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
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

        // Check if element is locked
        const layer = layers.find(l => l.id === element)
        if (layer?.locked) {
            toast.error('This element is locked')
            return
        }

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

        // Check if element is locked
        const layer = layers.find(l => l.id === element)
        if (layer?.locked) {
            toast.error('This element is locked')
            return
        }

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

    // Toggle layer visibility
    const toggleLayerVisibility = (layerId: string) => {
        setLayers(prev => prev.map(layer => 
            layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
        ))
    }

    // Toggle layer lock
    const toggleLayerLock = (layerId: string) => {
        setLayers(prev => prev.map(layer => 
            layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
        ))
    }

    // Duplicate element
    const duplicateElement = () => {
        if (!activeElement) return
        
        toast.info('Duplicate feature coming soon')
    }

    // Delete element
    const deleteElement = () => {
        if (!activeElement) return
        
        toast.info('Delete feature coming soon')
    }

    // Submit form
    const handleSubmit = async () => {
        if (!selectedCourse) {
            toast.error('Please select a course')
            return
        }

        if (!image) {
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

            // Append the image
            formData.append('image', image)

            const res = await POSTDATA('/v1/certificate-template', formData)

            if (!res?.success) {
                throw new Error(res?.message || 'Failed to create certificate template')
            }

            toast.success('Certificate template created successfully!')

            // Reset form
            setSelectedCourse('')
            setFontFamily('Arial')
            setTextColor('#333333')
            setIsDelete(false)
            setImage(null)
            setImagePreview(null)
            setStudentIdPos({ left: 200, top: 200, fontSize: 18, width: 100, height: 30 })
            setNamePos({ left: 200, top: 300, fontSize: 24, width: 160, height: 40 })
            setCourseNamePos({ left: 200, top: 400, fontSize: 20, width: 200, height: 35 })
            setActiveElement(null)

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
                    className="absolute w-5 h-5 bg-primary border-2 border-white rounded full shadow-lg cursor-nw-resize"
                    style={{ left: -8, top: -8 }}
                    onMouseDown={(e) => handleResizeStart(e, element, 'nw')}
                />
                {/* Top-right handle */}
                <div
                    className="absolute w-5 h-5 bg-primary border-2 border-white rounded full shadow-lg cursor-ne-resize"
                    style={{ right: -8, top: -8 }}
                    onMouseDown={(e) => handleResizeStart(e, element, 'ne')}
                />
                {/* Bottom-left handle */}
                <div
                    className="absolute w-5 h-5 bg-primary border-2 border-white rounded full shadow-lg cursor-sw-resize"
                    style={{ left: -8, bottom: -8 }}
                    onMouseDown={(e) => handleResizeStart(e, element, 'sw')}
                />
                {/* Bottom-right handle */}
                <div
                    className="absolute w-5 h-5 bg-primary border-2 border-white rounded full shadow-lg cursor-se-resize"
                    style={{ right: -8, bottom: -8 }}
                    onMouseDown={(e) => handleResizeStart(e, element, 'se')}
                />
            </>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-background sm:hidden">
            {/* Header - PixelLab style */}
            <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/90">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="font-bold text-lg">Certificate Designer</h1>
                </div>
                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-primary-foreground hover:bg-primary/90"
                        onClick={() => setShowGrid(!showGrid)}
                    >
                        <Grid className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/90">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}>
                                <ZoomIn className="h-4 w-4 mr-2" /> Zoom In
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}>
                                <ZoomOut className="h-4 w-4 mr-2" /> Zoom Out
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setZoom(1)}>
                                <Eye className="h-4 w-4 mr-2" /> Reset Zoom
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Canvas Area - Main workspace */}
            <div 
                ref={canvasContainerRef}
                className="flex-1 overflow-auto bg-muted/30 p-4 relative"
                style={{
                    backgroundImage: showGrid ? 'radial-gradient(circle at 10px 10px, rgba(0,0,0,0.05) 1px, transparent 1px)' : 'none',
                    backgroundSize: '20px 20px'
                }}
            >
                <div 
                    className="relative mx-auto transition-transform duration-200"
                    style={{ 
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center',
                        maxWidth: '100%'
                    }}
                >
                    <div
                        ref={canvasRef}
                        className="relative w-full aspect-[1.414/1] bg-white rounded lg shadow-xl overflow-hidden border-2 border-border"
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
                            {/* Student ID - only show if visible */}
                            {layers.find(l => l.id === 'studentId')?.visible && (
                                <div
                                    ref={elementRefs.studentId}
                                    className={`absolute ${activeElement === 'studentId' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                                        } ${layers.find(l => l.id === 'studentId')?.locked ? 'opacity-50' : ''}`}
                                    style={{
                                        left: studentIdPos.left,
                                        top: studentIdPos.top,
                                        transform: 'translate(-50%, -50%)',
                                        width: studentIdPos.width,
                                        height: studentIdPos.height,
                                        cursor: layers.find(l => l.id === 'studentId')?.locked ? 'not-allowed' : (isDragging && activeElement === 'studentId' ? 'grabbing' : 'grab'),
                                        userSelect: 'none',
                                    }}
                                    onMouseDown={(e) => !layers.find(l => l.id === 'studentId')?.locked && handleMouseDown(e, 'studentId')}
                                    onClick={() => !layers.find(l => l.id === 'studentId')?.locked && selectElement('studentId')}
                                >
                                    <div className="w-full h-full flex items-center justify-center p-1 bg-white/10 backdrop-blur-sm rounded border border-dashed border-primary/30"
                                        style={{
                                            fontSize: studentIdPos.fontSize,
                                            color: textColor,
                                            fontFamily,
                                            textShadow: '0 0 5px rgba(255,255,255,0.8)'
                                        }}>
                                        <div className="flex items-center gap-1">
                                            <Badge variant="secondary" className="text-[8px] py-0 h-3 px-1">ID</Badge>
                                            <span className="truncate text-xs">STU-12345</span>
                                        </div>
                                    </div>
                                    {!layers.find(l => l.id === 'studentId')?.locked && <ResizeHandles element="studentId" />}
                                </div>
                            )}

                            {/* Student Name - only show if visible */}
                            {layers.find(l => l.id === 'name')?.visible && (
                                <div
                                    ref={elementRefs.name}
                                    className={`absolute ${activeElement === 'name' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                                        } ${layers.find(l => l.id === 'name')?.locked ? 'opacity-50' : ''}`}
                                    style={{
                                        left: namePos.left,
                                        top: namePos.top,
                                        transform: 'translate(-50%, -50%)',
                                        width: namePos.width,
                                        height: namePos.height,
                                        cursor: layers.find(l => l.id === 'name')?.locked ? 'not-allowed' : (isDragging && activeElement === 'name' ? 'grabbing' : 'grab'),
                                        userSelect: 'none',
                                    }}
                                    onMouseDown={(e) => !layers.find(l => l.id === 'name')?.locked && handleMouseDown(e, 'name')}
                                    onClick={() => !layers.find(l => l.id === 'name')?.locked && selectElement('name')}
                                >
                                    <div className="w-full h-full flex items-center justify-center p-1 bg-white/10 backdrop-blur-sm rounded border border-dashed border-primary/30"
                                        style={{
                                            fontSize: namePos.fontSize,
                                            color: textColor,
                                            fontFamily,
                                            textShadow: '0 0 5px rgba(255,255,255,0.8)'
                                        }}>
                                        <div className="flex items-center gap-1">
                                            <Badge variant="secondary" className="text-[8px] py-0 h-3 px-1">Name</Badge>
                                            <span className="truncate text-xs">John Doe</span>
                                        </div>
                                    </div>
                                    {!layers.find(l => l.id === 'name')?.locked && <ResizeHandles element="name" />}
                                </div>
                            )}

                            {/* Course Name - only show if visible */}
                            {layers.find(l => l.id === 'courseName')?.visible && (
                                <div
                                    ref={elementRefs.courseName}
                                    className={`absolute ${activeElement === 'courseName' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                                        } ${layers.find(l => l.id === 'courseName')?.locked ? 'opacity-50' : ''}`}
                                    style={{
                                        left: courseNamePos.left,
                                        top: courseNamePos.top,
                                        transform: 'translate(-50%, -50%)',
                                        width: courseNamePos.width,
                                        height: courseNamePos.height,
                                        cursor: layers.find(l => l.id === 'courseName')?.locked ? 'not-allowed' : (isDragging && activeElement === 'courseName' ? 'grabbing' : 'grab'),
                                        userSelect: 'none',
                                    }}
                                    onMouseDown={(e) => !layers.find(l => l.id === 'courseName')?.locked && handleMouseDown(e, 'courseName')}
                                    onClick={() => !layers.find(l => l.id === 'courseName')?.locked && selectElement('courseName')}
                                >
                                    <div className="w-full h-full flex items-center justify-center p-1 bg-white/10 backdrop-blur-sm rounded border border-dashed border-primary/30"
                                        style={{
                                            fontSize: courseNamePos.fontSize,
                                            color: textColor,
                                            fontFamily,
                                            textShadow: '0 0 5px rgba(255,255,255,0.8)'
                                        }}>
                                        <div className="flex items-center gap-1">
                                            <Badge variant="secondary" className="text-[8px] py-0 h-3 px-1">Course</Badge>
                                            <span className="truncate text-xs">Web Development</span>
                                        </div>
                                    </div>
                                    {!layers.find(l => l.id === 'courseName')?.locked && <ResizeHandles element="courseName" />}
                                </div>
                            )}
                        </div>

                        {!imagePreview && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                                <div className="text-center p-4">
                                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">Tap to upload background</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Toolbar - PixelLab style */}
            <div className="bg-card border-t border-border p-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-4 mb-2">
                        <TabsTrigger value="elements" className="text-xs py-1.5">Elements</TabsTrigger>
                        <TabsTrigger value="style" className="text-xs py-1.5">Style</TabsTrigger>
                        <TabsTrigger value="layers" className="text-xs py-1.5">Layers</TabsTrigger>
                        <TabsTrigger value="export" className="text-xs py-1.5">Export</TabsTrigger>
                    </TabsList>

                    {/* Elements Tab */}
                    <TabsContent value="elements" className="mt-0">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="shrink-0">
                                        <ImageIcon className="h-4 w-4 mr-1" />
                                        BG
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[80vh] rounded t-xl">
                                    <SheetHeader>
                                        <SheetTitle>Background Image</SheetTitle>
                                    </SheetHeader>
                                    <div className="py-4">
                                        <div
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={handleDrop}
                                            className="relative h-40 cursor-pointer rounded lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 hover:border-primary transition flex items-center justify-center mb-4"
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
                                                        className="object-contain rounded lg"
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        className="absolute top-1 right-1 h-6 w-6"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setImage(null)
                                                            setImagePreview(null)
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

                                        <div className="space-y-2">
                                            <Label>Select Course</Label>
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
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <Button 
                                variant={activeElement === 'studentId' ? 'default' : 'outline'} 
                                size="sm"
                                className="shrink-0"
                                onClick={() => selectElement('studentId')}
                            >
                                <Badge className="mr-1 h-4 w-4 p-0">ID</Badge>
                                Student ID
                            </Button>
                            <Button 
                                variant={activeElement === 'name' ? 'default' : 'outline'} 
                                size="sm"
                                className="shrink-0"
                                onClick={() => selectElement('name')}
                            >
                                <Badge className="mr-1 h-4 w-4 p-0">Name</Badge>
                                Name
                            </Button>
                            <Button 
                                variant={activeElement === 'courseName' ? 'default' : 'outline'} 
                                size="sm"
                                className="shrink-0"
                                onClick={() => selectElement('courseName')}
                            >
                                <Badge className="mr-1 h-4 w-4 p-0">Course</Badge>
                                Course
                            </Button>
                        </div>

                        {activeElement && (
                            <div className="mt-2 p-2 bg-muted/30 rounded lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Selected: {activeElement}</span>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={duplicateElement}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={deleteElement}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                    <Button size="sm" variant="outline" className="h-8" onClick={() => nudgePosition('up')}>
                                        <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8" onClick={() => nudgePosition('left')}>
                                        <ArrowLeft className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8" onClick={() => nudgePosition('down')}>
                                        <ArrowDown className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8" onClick={() => nudgePosition('right')}>
                                        <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* Style Tab */}
                    <TabsContent value="style" className="mt-0">
                        {activeElement ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Select value={fontFamily} onValueChange={setFontFamily}>
                                        <SelectTrigger className="flex-1 h-8 text-xs">
                                            <SelectValue placeholder="Font" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fontOptions.slice(0, 8).map(font => (
                                                <SelectItem key={font} value={font} style={{ fontFamily: font }} className="text-xs">
                                                    {font}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="w-8 h-8 p-0.5"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <Label>Font Size: {getActiveFontSize()}px</Label>
                                    </div>
                                    <Slider
                                        value={[getActiveFontSize()]}
                                        onValueChange={(value) => updateFontSize(value[0])}
                                        min={12}
                                        max={72}
                                        step={1}
                                        className="py-1"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <Label>Width: {getActiveDimensions().width}px</Label>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 w-6 p-0"
                                            onClick={() => updateDimensions('width', getActiveDimensions().width - 10)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <Slider
                                            value={[getActiveDimensions().width]}
                                            onValueChange={(value) => updateDimensions('width', value[0])}
                                            min={50}
                                            max={300}
                                            step={5}
                                            className="flex-1"
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 w-6 p-0"
                                            onClick={() => updateDimensions('width', getActiveDimensions().width + 10)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <Label>Height: {getActiveDimensions().height}px</Label>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 w-6 p-0"
                                            onClick={() => updateDimensions('height', getActiveDimensions().height - 5)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <Slider
                                            value={[getActiveDimensions().height]}
                                            onValueChange={(value) => updateDimensions('height', value[0])}
                                            min={30}
                                            max={150}
                                            step={5}
                                            className="flex-1"
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 w-6 p-0"
                                            onClick={() => updateDimensions('height', getActiveDimensions().height + 5)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                                Select an element to style
                            </div>
                        )}
                    </TabsContent>

                    {/* Layers Tab */}
                    <TabsContent value="layers" className="mt-0">
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                            {layers.map(layer => (
                                <div key={layer.id} className="flex items-center justify-between p-2 bg-muted/30 rounded lg">
                                    <span className="text-sm font-medium">{layer.name}</span>
                                    <div className="flex gap-1">
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-7 w-7"
                                            onClick={() => toggleLayerVisibility(layer.id)}
                                        >
                                            {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-7 w-7"
                                            onClick={() => toggleLayerLock(layer.id)}
                                        >
                                            {layer.locked ? <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> : <Move className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Export Tab */}
                    <TabsContent value="export" className="mt-0">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded lg">
                                <div>
                                    <p className="text-xs font-medium">Soft Delete</p>
                                    <p className="text-[10px] text-muted-foreground">Mark template as deleted</p>
                                </div>
                                <Switch checked={isDelete} onCheckedChange={setIsDelete} />
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !selectedCourse || !image}
                                className="w-full"
                                size="default"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Template
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}