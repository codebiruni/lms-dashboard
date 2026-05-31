/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { UploadCloud, Save, Loader2, X, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

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

import POSTDATA from '@/app/default/functions/Post'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

export interface ICreateCertificate {
    image: string;
    studentIdPosition: {
        left?: number;      // Percentage (0-100)
        top?: number;       // Percentage (0-100)
        fontSize?: number;  // Pixels
    }
    namePosition: {
        left?: number;      // Percentage (0-100)
        top?: number;       // Percentage (0-100)
        fontSize?: number;  // Pixels
    }
    courseNamePosition: {
        left?: number;      // Percentage (0-100)
        top?: number;       // Percentage (0-100)
        fontSize?: number;  // Pixels
    }
    fontFamily?: string;
    color?: string;
    course: any;
    isDelete: boolean;
}

type DraggableElement = 'studentId' | 'name' | 'courseName' | null

export default function CreateCertificateTemplate() {
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

    // Position states - USING PERCENTAGES (0-100)
    const [studentIdPos, setStudentIdPos] = useState({ left: 50, top: 30, fontSize: 24 })
    const [namePos, setNamePos] = useState({ left: 50, top: 45, fontSize: 36 })
    const [courseNamePos, setCourseNamePos] = useState({ left: 50, top: 60, fontSize: 28 })

    // Active element for dragging and editing
    const [activeElement, setActiveElement] = useState<DraggableElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

    // Canvas ref for positioning calculations
    const canvasRef = useRef<HTMLDivElement>(null)
    const canvasContainerRef = useRef<HTMLDivElement>(null)

    // Font options
    const fontOptions = [
        'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 
        'Georgia', 'Verdana', 'Trebuchet MS', 'Impact', 'Palatino',
        'Garamond', 'Comic Sans MS', 'Lucida Console'
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
            left: width > 0 ? (pixelLeft / width) * 100 : 50,
            top: height > 0 ? (pixelTop / height) * 100 : 50
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

    // Drag handlers - converting between pixels and percentages
    const handleMouseDown = (e: React.MouseEvent, element: DraggableElement) => {
        e.preventDefault()
        e.stopPropagation()
        if (!canvasRef.current || !element) return

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

        // Convert percentage to pixel for drag start
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
            
            // Calculate new pixel position
            let newPixelLeft = e.clientX - canvasRect.left - dragOffset.x
            let newPixelTop = e.clientY - canvasRect.top - dragOffset.y
            
            // Constrain to canvas bounds
            newPixelLeft = Math.max(0, Math.min(newPixelLeft, canvasRect.width))
            newPixelTop = Math.max(0, Math.min(newPixelTop, canvasRect.height))
            
            // Convert to percentage
            const newPercentage = getPercentagePosition(newPixelLeft, newPixelTop)

            // Update state with percentages
            switch (activeElement) {
                case 'studentId':
                    setStudentIdPos(prev => ({ 
                        ...prev, 
                        left: newPercentage.left, 
                        top: newPercentage.top 
                    }))
                    break
                case 'name':
                    setNamePos(prev => ({ 
                        ...prev, 
                        left: newPercentage.left, 
                        top: newPercentage.top 
                    }))
                    break
                case 'courseName':
                    setCourseNamePos(prev => ({ 
                        ...prev, 
                        left: newPercentage.left, 
                        top: newPercentage.top 
                    }))
                    break
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
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

    // Nudge position by percentage points
    const nudgePosition = (direction: 'left' | 'right' | 'up' | 'down') => {
        if (!activeElement) {
            toast.error('Please select an element first')
            return
        }

        const step = 1 // 1% step

        switch (activeElement) {
            case 'studentId':
                setStudentIdPos(prev => ({
                    ...prev,
                    left: direction === 'left' ? Math.max(0, prev.left - step) : direction === 'right' ? Math.min(100, prev.left + step) : prev.left,
                    top: direction === 'up' ? Math.max(0, prev.top - step) : direction === 'down' ? Math.min(100, prev.top + step) : prev.top
                }))
                break
            case 'name':
                setNamePos(prev => ({
                    ...prev,
                    left: direction === 'left' ? Math.max(0, prev.left - step) : direction === 'right' ? Math.min(100, prev.left + step) : prev.left,
                    top: direction === 'up' ? Math.max(0, prev.top - step) : direction === 'down' ? Math.min(100, prev.top + step) : prev.top
                }))
                break
            case 'courseName':
                setCourseNamePos(prev => ({
                    ...prev,
                    left: direction === 'left' ? Math.max(0, prev.left - step) : direction === 'right' ? Math.min(100, prev.left + step) : prev.left,
                    top: direction === 'up' ? Math.max(0, prev.top - step) : direction === 'down' ? Math.min(100, prev.top + step) : prev.top
                }))
                break
        }
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
            
            // Append position data as percentages (0-100) - NO width/height
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
            setStudentIdPos({ left: 50, top: 30, fontSize: 24 })
            setNamePos({ left: 50, top: 45, fontSize: 36 })
            setCourseNamePos({ left: 50, top: 60, fontSize: 28 })
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

    return (
        <div className="container mx-auto hidden sm:block">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Canvas Preview - Left side */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Design Canvas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div 
                                ref={canvasContainerRef}
                                className="relative w-full bg-muted rounded-lg overflow-hidden border-2 border-dashed"
                                style={{ aspectRatio: imageDimensions.width && imageDimensions.height ? `${imageDimensions.width}/${imageDimensions.height}` : '1.414/1' }}
                            >
                                <div
                                    ref={canvasRef}
                                    className="relative w-full h-full"
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

                                    {/* Draggable Elements */}
                                    <div className="relative w-full h-full">
                                        {/* Student ID */}
                                        <div
                                            className={`absolute ${activeElement === 'studentId' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                                                }`}
                                            style={{
                                                ...getElementStyle(studentIdPos),
                                                cursor: isDragging && activeElement === 'studentId' ? 'grabbing' : 'grab',
                                                userSelect: 'none',
                                                whiteSpace: 'nowrap',
                                            }}
                                            onMouseDown={(e) => handleMouseDown(e, 'studentId')}
                                            onClick={() => selectElement('studentId')}
                                        >
                                            <div className="flex items-center gap-1 p-1 bg-white/10 backdrop-blur-sm rounded border border-dashed border-primary/30">
                                                <Badge variant="secondary" className="text-[10px] py-0 h-4">ID</Badge>
                                                <span 
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

                                        {/* Student Name */}
                                        <div
                                            className={`absolute ${activeElement === 'name' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                                                }`}
                                            style={{
                                                ...getElementStyle(namePos),
                                                cursor: isDragging && activeElement === 'name' ? 'grabbing' : 'grab',
                                                userSelect: 'none',
                                                whiteSpace: 'nowrap',
                                            }}
                                            onMouseDown={(e) => handleMouseDown(e, 'name')}
                                            onClick={() => selectElement('name')}
                                        >
                                            <div className="flex items-center gap-1 p-1 bg-white/10 backdrop-blur-sm rounded border border-dashed border-primary/30">
                                                <Badge variant="secondary" className="text-[10px] py-0 h-4">Name</Badge>
                                                <span 
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

                                        {/* Course Name */}
                                        <div
                                            className={`absolute ${activeElement === 'courseName' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                                                }`}
                                            style={{
                                                ...getElementStyle(courseNamePos),
                                                cursor: isDragging && activeElement === 'courseName' ? 'grabbing' : 'grab',
                                                userSelect: 'none',
                                                whiteSpace: 'nowrap',
                                            }}
                                            onMouseDown={(e) => handleMouseDown(e, 'courseName')}
                                            onClick={() => selectElement('courseName')}
                                        >
                                            <div className="flex items-center gap-1 p-1 bg-white/10 backdrop-blur-sm rounded border border-dashed border-primary/30">
                                                <Badge variant="secondary" className="text-[10px] py-0 h-4">Course</Badge>
                                                <span 
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
                                    </div>

                                    {!imagePreview && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <p className="text-muted-foreground">Upload background image to start designing</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="mt-4 text-sm text-muted-foreground space-y-1">
                                <p>💡 Click on any element to select it, then drag to position.</p>
                                <p>📏 Positions are saved as percentages for perfect scaling across all certificate sizes.</p>
                                <p>🎨 Selected elements will have a blue ring.</p>
                                <p>⚡ Use the Position tab to fine-tune location and font size.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Right Panel - Form Controls */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Certificate Template Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Course Selection */}
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
                                            <p className="text-xs text-muted-foreground">Upload background</p>
                                        </div>
                                    )}
                                </div>
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
                                <div className="space-y-4">
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
                                        <Label>Position (Percentage)</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs">Left: {activeElement === 'studentId' ? studentIdPos.left.toFixed(1) : activeElement === 'name' ? namePos.left.toFixed(1) : courseNamePos.left.toFixed(1)}%</Label>
                                                <Slider
                                                    value={[activeElement === 'studentId' ? studentIdPos.left : activeElement === 'name' ? namePos.left : courseNamePos.left]}
                                                    onValueChange={(value) => {
                                                        const newLeft = value[0]
                                                        switch (activeElement) {
                                                            case 'studentId':
                                                                setStudentIdPos(prev => ({ ...prev, left: newLeft }))
                                                                break
                                                            case 'name':
                                                                setNamePos(prev => ({ ...prev, left: newLeft }))
                                                                break
                                                            case 'courseName':
                                                                setCourseNamePos(prev => ({ ...prev, left: newLeft }))
                                                                break
                                                        }
                                                    }}
                                                    min={0}
                                                    max={100}
                                                    step={0.5}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Top: {activeElement === 'studentId' ? studentIdPos.top.toFixed(1) : activeElement === 'name' ? namePos.top.toFixed(1) : courseNamePos.top.toFixed(1)}%</Label>
                                                <Slider
                                                    value={[activeElement === 'studentId' ? studentIdPos.top : activeElement === 'name' ? namePos.top : courseNamePos.top]}
                                                    onValueChange={(value) => {
                                                        const newTop = value[0]
                                                        switch (activeElement) {
                                                            case 'studentId':
                                                                setStudentIdPos(prev => ({ ...prev, top: newTop }))
                                                                break
                                                            case 'name':
                                                                setNamePos(prev => ({ ...prev, top: newTop }))
                                                                break
                                                            case 'courseName':
                                                                setCourseNamePos(prev => ({ ...prev, top: newTop }))
                                                                break
                                                        }
                                                    }}
                                                    min={0}
                                                    max={100}
                                                    step={0.5}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Nudge Position (1% steps)</Label>
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
                                </div>
                            )}

                            {!activeElement && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Click on any element on the canvas to edit its position and font size
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !selectedCourse || !image}
                        size="lg"
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Template...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Create Certificate Template
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}