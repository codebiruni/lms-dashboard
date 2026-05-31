/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
    UploadCloud, Save, Loader2, X, Minus, Plus, 
    Move, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    Eye, EyeOff, Settings, Image as ImageIcon,
    Copy, Grid, ZoomIn, ZoomOut, ChevronLeft, Lock, Unlock
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
        left?: number;      // Percentage 0-100
        top?: number;       // Percentage 0-100
        fontSize?: number;  // Pixels
    }
    namePosition: {
        left?: number;      // Percentage 0-100
        top?: number;       // Percentage 0-100
        fontSize?: number;  // Pixels
    }
    courseNamePosition: {
        left?: number;      // Percentage 0-100
        top?: number;       // Percentage 0-100
        fontSize?: number;  // Pixels
    }
    fontFamily?: string;
    color?: string;
    course: any;
    isDelete: boolean;
}

type DraggableElement = 'studentId' | 'name' | 'courseName' | null

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
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

    // Position states - USING PERCENTAGES (0-100) for backend compatibility
    const [studentIdPos, setStudentIdPos] = useState({ left: 50, top: 30, fontSize: 18 })
    const [namePos, setNamePos] = useState({ left: 50, top: 45, fontSize: 24 })
    const [courseNamePos, setCourseNamePos] = useState({ left: 50, top: 60, fontSize: 20 })

    // Active element for dragging and editing
    const [activeElement, setActiveElement] = useState<DraggableElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

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
    const touchStartRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null)

    // Font options
    const fontOptions = [
        'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 
        'Georgia', 'Verdana', 'Trebuchet MS', 'Impact', 'Palatino',
        'Garamond', 'Comic Sans MS', 'Lucida Console', 'Roboto', 
        'Open Sans', 'Lato', 'Montserrat', 'Poppins'
    ]

    // Get current dimensions of canvas
    const getCanvasDimensions = () => {
        if (!canvasRef.current) return { width: 0, height: 0 }
        const rect = canvasRef.current.getBoundingClientRect()
        return { width: rect.width, height: rect.height }
    }

    // Convert percentage to pixels for positioning
    const getPixelPosition = (percentLeft: number, percentTop: number) => {
        const { width, height } = getCanvasDimensions()
        return {
            left: (percentLeft / 100) * width,
            top: (percentTop / 100) * height
        }
    }

    // Convert pixel position to percentage
    const getPercentagePosition = (pixelLeft: number, pixelTop: number) => {
        const { width, height } = getCanvasDimensions()
        return {
            left: width > 0 ? Math.max(0, Math.min(100, (pixelLeft / width) * 100)) : 50,
            top: height > 0 ? Math.max(0, Math.min(100, (pixelTop / height) * 100)) : 50
        }
    }

    // Handle image upload and get dimensions
    const handleImageUpload = (file: File) => {
        setImage(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            const imgUrl = reader.result as string
            setImagePreview(imgUrl)
            
            // Get image dimensions
            const img = new window.Image()
            img.onload = () => {
                setImageDimensions({ width: img.width, height: img.height })
            }
            img.src = imgUrl
        }
        reader.readAsDataURL(file)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (e.dataTransfer.files?.[0]) {
            handleImageUpload(e.dataTransfer.files[0])
        }
    }

    // Touch handlers for mobile
    const handleTouchStart = (e: React.TouchEvent, element: DraggableElement) => {
        e.preventDefault()
        if (!canvasRef.current || !element) return

        const layer = layers.find(l => l.id === element)
        if (layer?.locked) {
            toast.error('This element is locked')
            return
        }

        const touch = e.touches[0]
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
            default:
                return
        }

        const pixelPos = getPixelPosition(currentPos.left, currentPos.top)
        
        setActiveElement(element)
        setIsDragging(true)
        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            left: pixelPos.left,
            top: pixelPos.top
        }
    }

    const handleTouchMove = (e: TouchEvent) => {
        if (!canvasRef.current || !isDragging || !activeElement || !touchStartRef.current) return

        e.preventDefault()
        const touch = e.touches[0]
        const canvasRect = canvasRef.current.getBoundingClientRect()
        
        const deltaX = touch.clientX - touchStartRef.current.x
        const deltaY = touch.clientY - touchStartRef.current.y
        
        let newPixelLeft = touchStartRef.current.left + deltaX
        let newPixelTop = touchStartRef.current.top + deltaY
        
        // Constrain to canvas bounds
        newPixelLeft = Math.max(0, Math.min(newPixelLeft, canvasRect.width))
        newPixelTop = Math.max(0, Math.min(newPixelTop, canvasRect.height))
        
        // Convert to percentage
        const newPercentage = getPercentagePosition(newPixelLeft, newPixelTop)

        switch (activeElement) {
            case 'studentId':
                setStudentIdPos(prev => ({ ...prev, left: newPercentage.left, top: newPercentage.top }))
                break
            case 'name':
                setNamePos(prev => ({ ...prev, left: newPercentage.left, top: newPercentage.top }))
                break
            case 'courseName':
                setCourseNamePos(prev => ({ ...prev, left: newPercentage.left, top: newPercentage.top }))
                break
        }
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
        touchStartRef.current = null
    }

    // Mouse handlers (for development with mouse)
    const handleMouseDown = (e: React.MouseEvent, element: DraggableElement) => {
        e.preventDefault()
        e.stopPropagation()
        if (!canvasRef.current || !element) return

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
            default:
                return
        }

        const pixelPos = getPixelPosition(currentPos.left, currentPos.top)
        
        setActiveElement(element)
        setIsDragging(true)
        setDragOffset({
            x: e.clientX - canvasRect.left - pixelPos.left,
            y: e.clientY - canvasRect.top - pixelPos.top,
        })
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRef.current || !isDragging || !activeElement) return

            const canvasRect = canvasRef.current.getBoundingClientRect()
            let currentPos

            switch (activeElement) {
                case 'studentId':
                    currentPos = studentIdPos
                    break
                case 'name':
                    currentPos = namePos
                    break
                case 'courseName':
                    currentPos = courseNamePos
                    break
                default:
                    return
            }

            const pixelPos = getPixelPosition(currentPos.left, currentPos.top)
            
            let newPixelLeft = e.clientX - canvasRect.left - dragOffset.x
            let newPixelTop = e.clientY - canvasRect.top - dragOffset.y
            
            newPixelLeft = Math.max(0, Math.min(newPixelLeft, canvasRect.width))
            newPixelTop = Math.max(0, Math.min(newPixelTop, canvasRect.height))
            
            const newPercentage = getPercentagePosition(newPixelLeft, newPixelTop)

            switch (activeElement) {
                case 'studentId':
                    setStudentIdPos(prev => ({ ...prev, left: newPercentage.left, top: newPercentage.top }))
                    break
                case 'name':
                    setNamePos(prev => ({ ...prev, left: newPercentage.left, top: newPercentage.top }))
                    break
                case 'courseName':
                    setCourseNamePos(prev => ({ ...prev, left: newPercentage.left, top: newPercentage.top }))
                    break
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        // Touch event listeners
        const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e)
        const handleGlobalTouchEnd = () => handleTouchEnd()

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
            document.addEventListener('touchend', handleGlobalTouchEnd)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('touchmove', handleGlobalTouchMove)
            document.removeEventListener('touchend', handleGlobalTouchEnd)
        }
    }, [isDragging, activeElement, dragOffset])

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

    // Update position for active element
    const updatePosition = (axis: 'left' | 'top', value: number) => {
        switch (activeElement) {
            case 'studentId':
                setStudentIdPos(prev => ({ ...prev, [axis]: Math.max(0, Math.min(100, value)) }))
                break
            case 'name':
                setNamePos(prev => ({ ...prev, [axis]: Math.max(0, Math.min(100, value)) }))
                break
            case 'courseName':
                setCourseNamePos(prev => ({ ...prev, [axis]: Math.max(0, Math.min(100, value)) }))
                break
        }
    }

    // Get active element font size
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

    // Get active element position
    const getActivePosition = () => {
        switch (activeElement) {
            case 'studentId':
                return { left: studentIdPos.left, top: studentIdPos.top }
            case 'name':
                return { left: namePos.left, top: namePos.top }
            case 'courseName':
                return { left: courseNamePos.left, top: courseNamePos.top }
            default:
                return { left: 50, top: 50 }
        }
    }

    // Nudge position by percentage points
    const nudgePosition = (direction: 'left' | 'right' | 'up' | 'down') => {
        if (!activeElement) {
            toast.error('Select an element first')
            return
        }

        const step = 2 // 2% step for mobile
        const currentPos = getActivePosition()

        switch (direction) {
            case 'left':
                updatePosition('left', currentPos.left - step)
                break
            case 'right':
                updatePosition('left', currentPos.left + step)
                break
            case 'up':
                updatePosition('top', currentPos.top - step)
                break
            case 'down':
                updatePosition('top', currentPos.top + step)
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

    // Duplicate element (coming soon)
    const duplicateElement = () => {
        if (!activeElement) return
        toast.info('Duplicate feature coming soon')
    }

    // Delete element (coming soon)
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
            
            formData.append('course', selectedCourse)
            formData.append('fontFamily', fontFamily)
            formData.append('color', textColor)
            formData.append('isDelete', String(isDelete))
            
            // Append position data as percentages - NO width/height
            formData.append('studentIdPosition', JSON.stringify({
                left: studentIdPos.left,
                top: studentIdPos.top,
                fontSize: studentIdPos.fontSize
            }))
            
            formData.append('namePosition', JSON.stringify({
                left: namePos.left,
                top: namePos.top,
                fontSize: namePos.fontSize
            }))
            
            formData.append('courseNamePosition', JSON.stringify({
                left: courseNamePos.left,
                top: courseNamePos.top,
                fontSize: courseNamePos.fontSize
            }))

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
            setImageDimensions({ width: 0, height: 0 })
            setStudentIdPos({ left: 50, top: 30, fontSize: 18 })
            setNamePos({ left: 50, top: 45, fontSize: 24 })
            setCourseNamePos({ left: 50, top: 60, fontSize: 20 })
            setActiveElement(null)

        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    // Get style for an element (converts percentage to pixel for display)
    const getElementStyle = (pos: { left: number; top: number; fontSize: number }) => {
        const { left, top } = getPixelPosition(pos.left, pos.top)
        return {
            left,
            top,
            fontSize: `${pos.fontSize}px`,
            transform: 'translate(-50%, -50%)',
        }
    }

    // Handle back button
    const handleBack = () => {
        if (typeof window !== 'undefined') {
            window.history.back()
        }
    }

    return (
        <div className="h-screen flex flex-col bg-background sm:hidden">
            {/* Header - Mobile friendly */}
            <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-primary-foreground hover:bg-primary/90"
                        onClick={handleBack}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="font-bold text-base">Certificate Designer</h1>
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
                className="flex-1 overflow-auto bg-muted/30 p-3 relative"
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
                        className="relative w-full bg-white rounded-lg shadow-xl overflow-hidden border border-border"
                        style={{ aspectRatio: '1.414/1' }}
                    >
                        {imagePreview && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={imagePreview}
                                alt="Certificate Background"
                                className="absolute inset-0 w-full h-full object-contain"
                                draggable={false}
                            />
                        )}

                        {/* Draggable Elements */}
                        <div className="relative w-full h-full">
                            {/* Student ID */}
                            {layers.find(l => l.id === 'studentId')?.visible && (
                                <div
                                    className={`absolute ${activeElement === 'studentId' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                                        } ${layers.find(l => l.id === 'studentId')?.locked ? 'opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
                                    style={{
                                        ...getElementStyle(studentIdPos),
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={(e) => !layers.find(l => l.id === 'studentId')?.locked && handleMouseDown(e, 'studentId')}
                                    onTouchStart={(e) => !layers.find(l => l.id === 'studentId')?.locked && handleTouchStart(e, 'studentId')}
                                    onClick={() => !layers.find(l => l.id === 'studentId')?.locked && selectElement('studentId')}
                                >
                                    <div className="flex items-center gap-1 p-1.5 bg-white/10 backdrop-blur-sm rounded border border-dashed border-primary/30">
                                        <Badge variant="secondary" className="text-[8px] py-0 h-3.5 px-1">ID</Badge>
                                        <span 
                                            className="truncate text-xs"
                                            style={{
                                                fontSize: studentIdPos.fontSize,
                                                color: textColor,
                                                fontFamily,
                                                textShadow: '0 0 5px rgba(255,255,255,0.8)'
                                            }}
                                        >
                                            STU-12345
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Student Name */}
                            {layers.find(l => l.id === 'name')?.visible && (
                                <div
                                    className={`absolute ${activeElement === 'name' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                                        } ${layers.find(l => l.id === 'name')?.locked ? 'opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
                                    style={{
                                        ...getElementStyle(namePos),
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={(e) => !layers.find(l => l.id === 'name')?.locked && handleMouseDown(e, 'name')}
                                    onTouchStart={(e) => !layers.find(l => l.id === 'name')?.locked && handleTouchStart(e, 'name')}
                                    onClick={() => !layers.find(l => l.id === 'name')?.locked && selectElement('name')}
                                >
                                    <div className="flex items-center gap-1 p-1.5 bg-white/10 backdrop-blur-sm rounded border border-dashed border-primary/30">
                                        <Badge variant="secondary" className="text-[8px] py-0 h-3.5 px-1">Name</Badge>
                                        <span 
                                            className="truncate text-xs"
                                            style={{
                                                fontSize: namePos.fontSize,
                                                color: textColor,
                                                fontFamily,
                                                textShadow: '0 0 5px rgba(255,255,255,0.8)'
                                            }}
                                        >
                                            John Doe
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Course Name */}
                            {layers.find(l => l.id === 'courseName')?.visible && (
                                <div
                                    className={`absolute ${activeElement === 'courseName' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                                        } ${layers.find(l => l.id === 'courseName')?.locked ? 'opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
                                    style={{
                                        ...getElementStyle(courseNamePos),
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={(e) => !layers.find(l => l.id === 'courseName')?.locked && handleMouseDown(e, 'courseName')}
                                    onTouchStart={(e) => !layers.find(l => l.id === 'courseName')?.locked && handleTouchStart(e, 'courseName')}
                                    onClick={() => !layers.find(l => l.id === 'courseName')?.locked && selectElement('courseName')}
                                >
                                    <div className="flex items-center gap-1 p-1.5 bg-white/10 backdrop-blur-sm rounded border border-dashed border-primary/30">
                                        <Badge variant="secondary" className="text-[8px] py-0 h-3.5 px-1">Course</Badge>
                                        <span 
                                            className="truncate text-xs"
                                            style={{
                                                fontSize: courseNamePos.fontSize,
                                                color: textColor,
                                                fontFamily,
                                                textShadow: '0 0 5px rgba(255,255,255,0.8)'
                                            }}
                                        >
                                            Web Development
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!imagePreview && (
                            <div 
                                className="absolute inset-0 flex items-center justify-center bg-muted/20 cursor-pointer"
                                onClick={() => {
                                    const input = document.createElement('input')
                                    input.type = 'file'
                                    input.accept = '.jpg,.jpeg,.png,.webp'
                                    input.onchange = (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0]
                                        if (file) handleImageUpload(file)
                                    }
                                    input.click()
                                }}
                            >
                                <div className="text-center p-4">
                                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">Tap to upload background</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Toolbar - Mobile optimized */}
            <div className="bg-card border-t border-border">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-4 rounded-none h-12">
                        <TabsTrigger value="elements" className="text-xs py-2">Elements</TabsTrigger>
                        <TabsTrigger value="style" className="text-xs py-2">Style</TabsTrigger>
                        <TabsTrigger value="layers" className="text-xs py-2">Layers</TabsTrigger>
                        <TabsTrigger value="export" className="text-xs py-2">Export</TabsTrigger>
                    </TabsList>

                    {/* Elements Tab */}
                    <TabsContent value="elements" className="mt-0 p-3 max-h-[45vh] overflow-y-auto">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="shrink-0">
                                        <ImageIcon className="h-4 w-4 mr-1" />
                                        Background
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
                                    <SheetHeader>
                                        <SheetTitle>Background Image</SheetTitle>
                                    </SheetHeader>
                                    <div className="py-4">
                                        <div
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={handleDrop}
                                            className="relative h-40 cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 hover:border-primary transition flex items-center justify-center mb-4"
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
                                                            setImagePreview(null)
                                                            setImageDimensions({ width: 0, height: 0 })
                                                        }}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">Tap to upload</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm">Select Course</Label>
                                            <Select
                                                value={selectedCourse}
                                                onValueChange={setSelectedCourse}
                                                disabled={coursesLoading}
                                            >
                                                <SelectTrigger className="h-10">
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
                                onClick={() => selectElement('studentId')}
                            >
                                Student ID
                            </Button>
                            <Button 
                                variant={activeElement === 'name' ? 'default' : 'outline'} 
                                size="sm"
                                onClick={() => selectElement('name')}
                            >
                                Student Name
                            </Button>
                            <Button 
                                variant={activeElement === 'courseName' ? 'default' : 'outline'} 
                                size="sm"
                                onClick={() => selectElement('courseName')}
                            >
                                Course Name
                            </Button>
                        </div>

                        {activeElement && (
                            <div className="p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium capitalize">{activeElement}</span>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={duplicateElement}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={deleteElement}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                                    <div></div>
                                    <Button size="default" variant="outline" className="h-10" onClick={() => nudgePosition('up')}>
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <div></div>
                                    <Button size="default" variant="outline" className="h-10" onClick={() => nudgePosition('left')}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <Button size="default" variant="outline" className="h-10" onClick={() => nudgePosition('down')}>
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button size="default" variant="outline" className="h-10" onClick={() => nudgePosition('right')}>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!activeElement && (
                            <div className="text-center py-6 text-sm text-muted-foreground">
                                Tap any element on the canvas to edit
                            </div>
                        )}
                    </TabsContent>

                    {/* Style Tab */}
                    <TabsContent value="style" className="mt-0 p-3 max-h-[45vh] overflow-y-auto">
                        {activeElement ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Select value={fontFamily} onValueChange={setFontFamily}>
                                        <SelectTrigger className="flex-1 h-10 text-sm">
                                            <SelectValue placeholder="Font" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fontOptions.map(font => (
                                                <SelectItem key={font} value={font} style={{ fontFamily: font }} className="text-sm">
                                                    {font}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="w-10 h-10 p-1"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <Label>Font Size: {getActiveFontSize()}px</Label>
                                    </div>
                                    <Slider
                                        value={[getActiveFontSize()]}
                                        onValueChange={(value) => updateFontSize(value[0])}
                                        min={12}
                                        max={72}
                                        step={1}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <Label>Position Left: {getActivePosition().left.toFixed(1)}%</Label>
                                    </div>
                                    <Slider
                                        value={[getActivePosition().left]}
                                        onValueChange={(value) => updatePosition('left', value[0])}
                                        min={0}
                                        max={100}
                                        step={1}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <Label>Position Top: {getActivePosition().top.toFixed(1)}%</Label>
                                    </div>
                                    <Slider
                                        value={[getActivePosition().top]}
                                        onValueChange={(value) => updatePosition('top', value[0])}
                                        min={0}
                                        max={100}
                                        step={1}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                Select an element to style
                            </div>
                        )}
                    </TabsContent>

                    {/* Layers Tab */}
                    <TabsContent value="layers" className="mt-0 p-3 max-h-[45vh] overflow-y-auto">
                        <div className="space-y-2">
                            {layers.map(layer => (
                                <div key={layer.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <span className="text-sm font-medium capitalize">
                                        {layer.id === 'studentId' ? 'Student ID' : layer.id === 'name' ? 'Student Name' : 'Course Name'}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8"
                                            onClick={() => toggleLayerVisibility(layer.id)}
                                        >
                                            {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8"
                                            onClick={() => toggleLayerLock(layer.id)}
                                        >
                                            {layer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Export Tab */}
                    <TabsContent value="export" className="mt-0 p-3 max-h-[45vh] overflow-y-auto">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Soft Delete</p>
                                    <p className="text-xs text-muted-foreground">Mark template as deleted</p>
                                </div>
                                <Switch checked={isDelete} onCheckedChange={setIsDelete} />
                            </div>
                            
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !selectedCourse || !image}
                                className="w-full h-11"
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