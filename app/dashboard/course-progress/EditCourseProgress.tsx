/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Award, X, CheckCircle, TrendingUp } from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'

import PATCHDATA from '@/app/default/functions/Patch'
import GETDATA from '@/app/default/functions/GetData'

/* -------------------- Types -------------------- */

interface EditCourseProgressProps {
  progress: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditCourseProgress({
  progress,
  open,
  onOpenChange,
  onSuccess
}: EditCourseProgressProps) {
  /* ---------- STATES ---------- */
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [courseSections, setCourseSections] = useState<any[]>([])
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [currentSectionLessons, setCurrentSectionLessons] = useState<any[]>([])
  const [allLessons, setAllLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingSections, setFetchingSections] = useState(false)
  const [fetchingLessons, setFetchingLessons] = useState(false)
  const [totalLessons, setTotalLessons] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completedAt, setCompletedAt] = useState('')

  /* ---------- LOAD PROGRESS DATA ---------- */
  useEffect(() => {
    if (progress && open) {
      setCompletedLessons(progress.completedLessons?.map((l: any) => l._id) || [])
      setTotalLessons(progress.totalLessons || 0)
      setIsCompleted(progress.isCompleted || false)
      
      if (progress.completedAt) {
        const date = new Date(progress.completedAt)
        setCompletedAt(date.toISOString().slice(0, 16))
      }
    }
  }, [progress, open])

  /* ---------- FETCH COURSE SECTIONS ---------- */
  useEffect(() => {
    const fetchCourseSections = async () => {
      if (!progress?.course?._id || !open) return

      try {
        setFetchingSections(true)
        const res = await GETDATA<any>(`/v1/course-section?course=${progress.course._id}&limit=100`)
        const sections = res?.data?.data || []
        setCourseSections(sections)
        
        // Set first section as default if available
        if (sections.length > 0) {
          setSelectedSection(sections[0]._id)
        }
      } catch (error) {
        console.error('Failed to fetch sections:', error)
        toast.error('Failed to load course sections')
      } finally {
        setFetchingSections(false)
      }
    }

    fetchCourseSections()
  }, [progress, open])

  /* ---------- FETCH LESSONS FOR SELECTED SECTION ---------- */
  useEffect(() => {
    const fetchSectionLessons = async () => {
      if (!selectedSection) return

      try {
        setFetchingLessons(true)
        const res = await GETDATA<any>(`/v1/lesson?courseSection=${selectedSection}&limit=100`)
        const lessons = res?.data?.data || []
        setCurrentSectionLessons(lessons)
      } catch (error) {
        console.error('Failed to fetch lessons:', error)
        toast.error('Failed to load lessons')
      } finally {
        setFetchingLessons(false)
      }
    }

    fetchSectionLessons()
  }, [selectedSection])

  /* ---------- COLLECT ALL LESSONS FROM ALL SECTIONS ---------- */
  useEffect(() => {
    const fetchAllLessons = async () => {
      if (!progress?.course?._id || !open) return

      try {
        // Get all sections
        const sectionsRes = await GETDATA<any>(`/v1/course-section?course=${progress.course._id}&limit=100`)
        const sections = sectionsRes?.data?.data || []
        
        let allLessonsList: any[] = []
        
        // Fetch lessons for each section
        for (const section of sections) {
          const lessonsRes = await GETDATA<any>(`/v1/lesson?courseSection=${section._id}&limit=100`)
          const lessons = lessonsRes?.data?.data || []
          allLessonsList = [...allLessonsList, ...lessons]
        }
        
        setAllLessons(allLessonsList)
        setTotalLessons(allLessonsList.length)
      } catch (error) {
        console.error('Failed to fetch all lessons:', error)
      }
    }

    fetchAllLessons()
  }, [progress, open])

  /* ---------- RESET FORM ---------- */
  const resetForm = () => {
    setSelectedSection('')
    setCourseSections([])
    setCompletedLessons([])
    setCurrentSectionLessons([])
    setAllLessons([])
    setIsCompleted(false)
    setCompletedAt('')
  }

  /* ---------- HANDLERS ---------- */
  const handleSelectAllInSection = (checked: boolean) => {
    if (checked) {
      const sectionLessonIds = currentSectionLessons.map((l) => l._id)
      const newCompletedLessons = [...new Set([...completedLessons, ...sectionLessonIds])]
      setCompletedLessons(newCompletedLessons)
    } else {
      const sectionLessonIds = currentSectionLessons.map((l) => l._id)
      const filteredLessons = completedLessons.filter(id => !sectionLessonIds.includes(id))
      setCompletedLessons(filteredLessons)
    }
  }

  const handleSelectLesson = (id: string, checked: boolean) => {
    if (checked) {
      setCompletedLessons((prev) => [...prev, id])
    } else {
      setCompletedLessons((prev) => prev.filter((l) => l !== id))
    }
  }

  const isSectionFullySelected = () => {
    if (currentSectionLessons.length === 0) return false
    return currentSectionLessons.every(lesson => completedLessons.includes(lesson._id))
  }

  const isSectionPartiallySelected = () => {
    if (currentSectionLessons.length === 0) return false
    const selectedInSection = currentSectionLessons.filter(lesson => 
      completedLessons.includes(lesson._id)
    ).length
    return selectedInSection > 0 && selectedInSection < currentSectionLessons.length
  }

  /* ---------- SUBMIT HANDLER ---------- */
  const handleSubmit = async () => {
    try {
      setLoading(true)

      const progressPercentage = totalLessons > 0
        ? Math.round((completedLessons.length / totalLessons) * 100)
        : 0

      const payload = {
        completedLessons,
        progressPercentage,
        isCompleted: progressPercentage === 100 || isCompleted,
        ...((progressPercentage === 100 || isCompleted) && { 
          completedAt: completedAt || new Date().toISOString() 
        })
      }

      const res = await PATCHDATA(`/v1/course-progress/${progress._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update course progress')
      }

      toast.success('Course progress updated successfully')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update course progress')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    resetForm()
  }

  if (!open) return null

  const progressPercentage = totalLessons > 0
    ? Math.round((completedLessons.length / totalLessons) * 100)
    : 0

  /* -------------------- UI -------------------- */
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Card className="w-full max-w-4xl rounded shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Edit Course Progress
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Student:</p>
                  <p className="font-medium">{progress.student?.userId?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Course:</p>
                  <p className="font-medium">{progress.course?.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Student ID:</p>
                  <Badge variant="outline" className="font-mono">
                    {progress.student?.id || progress.student?._id?.slice(-6)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Progress:</p>
                  <Badge 
                    variant={progress.progressPercentage === 100 ? 'default' : 'secondary'}
                    className={progress.progressPercentage === 100 ? 'bg-green-600' : ''}
                  >
                    {progress.progressPercentage}%
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 py-6 max-h-[70vh] overflow-y-auto">
              {/* Progress Overview */}
              <div className="bg-muted/30 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Progress Overview</h3>
                  <Badge variant="outline">
                    {completedLessons.length}/{totalLessons} Lessons
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span className="font-bold">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>

              {/* Section Selector */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Select Section</Label>
                {fetchingSections ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : courseSections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sections found for this course</p>
                ) : (
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a section" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseSections.map((section) => (
                        <SelectItem key={section._id} value={section._id}>
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Lessons Table for Selected Section */}
              {selectedSection && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-medium">
                      Lessons in {courseSections.find(s => s._id === selectedSection)?.title || 'Section'}
                    </Label>
                    {!fetchingLessons && currentSectionLessons.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                            id="select-section"
                            checked={isSectionFullySelected()}
                            onCheckedChange={handleSelectAllInSection}
                            ref={(checkbox) => {
                              if (checkbox) {
                                const input = checkbox.querySelector('input')
                                if (input) {
                                  input.indeterminate = isSectionPartiallySelected()
                                }
                              }
                            }}
                          />
                        <Label htmlFor="select-section" className="text-sm cursor-pointer">
                          Select All in Section
                        </Label>
                      </div>
                    )}
                  </div>

                  {fetchingLessons ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : currentSectionLessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No lessons found in this section
                    </p>
                  ) : (
                    <div className="border rounded max-h-75 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead className="w-12">Select</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentSectionLessons.map((lesson) => (
                            <TableRow key={lesson._id}>
                              <TableCell>
                                <Checkbox
                                  checked={completedLessons.includes(lesson._id)}
                                  onCheckedChange={(v) => handleSelectLesson(lesson._id, !!v)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{lesson.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{lesson.lessonType}</Badge>
                              </TableCell>
                              <TableCell>{lesson.duration || '-'} min</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* Completion Toggle */}
              <div className="flex items-center justify-between rounded border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isCompleted" className="text-base font-medium">
                    Mark as Completed
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Manually mark this course as completed
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={isCompleted || progressPercentage === 100 ? 'default' : 'secondary'}
                    className={isCompleted || progressPercentage === 100 ? 'bg-green-600' : ''}
                  >
                    {isCompleted || progressPercentage === 100 ? 'Completed' : 'In Progress'}
                  </Badge>
                  <input
                    type="checkbox"
                    id="isCompleted"
                    checked={isCompleted || progressPercentage === 100}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                    disabled={progressPercentage === 100}
                  />
                </div>
              </div>

              {/* Completed At - Show only if completed */}
              {(isCompleted || progressPercentage === 100) && (
                <div className="space-y-2">
                  <Label htmlFor="completedAt">Completed At</Label>
                  <Input
                    id="completedAt"
                    type="datetime-local"
                    value={completedAt}
                    onChange={(e) => setCompletedAt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Current: {progress.completedAt ? new Date(progress.completedAt).toLocaleString() : 'Not recorded'}
                  </p>
                </div>
              )}

              {/* Current Status Badge */}
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded">
                <Badge variant="outline">Current Status</Badge>
                {progress.isDeleted ? (
                  <Badge variant="destructive">Deleted</Badge>
                ) : progress.isCompleted ? (
                  <Badge variant="default" className="bg-green-600">Completed</Badge>
                ) : (
                  <Badge variant="secondary">
                    <TrendingUp size={12} className="mr-1" />
                    In Progress
                  </Badge>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={loading || fetchingSections || fetchingLessons}
                  size="lg"
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Award className="mr-2 h-4 w-4" />
                      Update Progress
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  size="lg"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}