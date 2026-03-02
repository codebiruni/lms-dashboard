/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { FileText, Loader2, Download, Eye, Search } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import POSTDATA from '@/app/default/functions/Post'
import useFetchStudents from '@/app/default/custom-component/useFeatchStudent'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

interface CreateCertificateProps {
  onSuccess?: () => void
}

export default function CreateCertificate({ onSuccess }: CreateCertificateProps) {
  // Data fetching
  const [studentSearch, setStudentSearch] = useState('')
  const [courseSearch, setCourseSearch] = useState('')
  const [studentOpen, setStudentOpen] = useState(false)
  const [courseOpen, setCourseOpen] = useState(false)

  const { Students: students, isLoading: studentsLoading } = useFetchStudents({
    page: 1,
    limit: 100,
    search: studentSearch,
    deleted: false,
  })

  const { courses, isLoading: coursesLoading } = useFetchCourses({
    page: 1,
    limit: 100,
    search: courseSearch,
    deleted: false,
  })

  // Form state
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [issuedDate, setIssuedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Generate certificate
  const handleGenerate = async (download: boolean = false) => {
    if (!selectedStudent) {
      toast.error('Please select a student')
      return
    }

    if (!selectedCourse) {
      toast.error('Please select a course')
      return
    }

    try {
      setLoading(true)

      const payload = {
        studentId: selectedStudent._id,
        courseId: selectedCourse._id,
      }

      if (download) {
        // Download PDF directly
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/certificate/generate-and-download`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        console.log(response)

        if (!response.ok) {
          throw new Error('Failed to generate certificate')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `certificate-${selectedStudent.userId?.name || 'student'}-${selectedCourse.title}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        toast.success('Certificate downloaded successfully!')
      } else {
        // Generate and store
        const res = await POSTDATA('/v1/certificate/generate', payload)

        if (!res?.success) {
          throw new Error(res?.message || 'Failed to generate certificate')
        }

        toast.success('Certificate generated and stored successfully!')
        
        // Reset form
        setSelectedStudent(null)
        setSelectedCourse(null)
        setIssuedDate(new Date().toISOString().split('T')[0])
        
        if (onSuccess) onSuccess()
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Preview certificate
  const handlePreview = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student')
      return
    }

    if (!selectedCourse) {
      toast.error('Please select a course')
      return
    }

    try {
      setPreviewLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/certificate/generate-and-view/${selectedStudent._id}/${selectedCourse._id}`
      )

      if (!response.ok) {
        throw new Error('Failed to generate preview')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setPreviewUrl(url)
      setShowPreview(true)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Certificate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Selection with Search */}
          <div className="space-y-2">
            <Label>Select Student <span className="text-red-500">*</span></Label>
            <Popover open={studentOpen} onOpenChange={setStudentOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={studentOpen}
                  className="w-full justify-between"
                >
                  {selectedStudent ? (
                    <div className="flex items-center gap-2">
                      {selectedStudent.userId?.image && (
                        <Image
                          src={selectedStudent.userId.image}
                          alt={selectedStudent.userId.name}
                          width={24}
                          height={24}
                          className="rounded full"
                        />
                      )}
                      <span>{selectedStudent.userId?.name || selectedStudent.id}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {selectedStudent.id}
                      </Badge>
                    </div>
                  ) : (
                    "Select a student..."
                  )}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-100 p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search students..." 
                    onValueChange={setStudentSearch}
                  />
                  <CommandEmpty>
                    {studentsLoading ? 'Loading...' : 'No students found.'}
                  </CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {students.map((student: any) => (
                      <CommandItem
                        key={student._id}
                        value={`${student.userId?.name || ''} ${student.id}`}
                        onSelect={() => {
                          setSelectedStudent(student)
                          setStudentOpen(false)
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {student.userId?.image && (
                            <Image
                              src={student.userId.image}
                              alt={student.userId.name}
                              width={32}
                              height={32}
                              className="rounded full"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">
                              {student.userId?.name || 'Unnamed Student'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {student.id} | Email: {student.userId?.email || 'N/A'}
                            </p>
                          </div>
                          {selectedStudent?._id === student._id && (
                            <Badge variant="default" className="ml-2">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Course Selection with Search */}
          <div className="space-y-2">
            <Label>Select Course <span className="text-red-500">*</span></Label>
            <Popover open={courseOpen} onOpenChange={setCourseOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={courseOpen}
                  className="w-full justify-between"
                >
                  {selectedCourse ? (
                    <div className="flex items-center gap-2">
                      {selectedCourse.thumbnail && (
                        <Image
                          src={selectedCourse.thumbnail}
                          alt={selectedCourse.title}
                          width={24}
                          height={24}
                          className="rounded"
                        />
                      )}
                      <span>{selectedCourse.title}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {selectedCourse.level}
                      </Badge>
                    </div>
                  ) : (
                    "Select a course..."
                  )}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-100 p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search courses..." 
                    onValueChange={setCourseSearch}
                  />
                  <CommandEmpty>
                    {coursesLoading ? 'Loading...' : 'No courses found.'}
                  </CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {courses.map((course: any) => (
                      <CommandItem
                        key={course._id}
                        value={course.title}
                        onSelect={() => {
                          setSelectedCourse(course)
                          setCourseOpen(false)
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {course.thumbnail && (
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{course.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Level: {course.level} | Price: ${course.price}
                            </p>
                          </div>
                          {selectedCourse?._id === course._id && (
                            <Badge variant="default" className="ml-2">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Issued Date */}
          <div className="space-y-2">
            <Label>Issued Date</Label>
            <Input
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => handleGenerate(true)}
              disabled={loading || !selectedStudent || !selectedCourse}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>

            <Button
              onClick={handlePreview}
              disabled={previewLoading || !selectedStudent || !selectedCourse}
              variant="outline"
              className="w-full"
            >
              {previewLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              Preview
            </Button>

            <Button
              onClick={() => handleGenerate(false)}
              disabled={loading || !selectedStudent || !selectedCourse}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Generate & Store
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-full rounded border"
                title="Certificate Preview"
              />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (previewUrl) {
                  const a = document.createElement('a')
                  a.href = previewUrl
                  a.download = `certificate-${selectedStudent?.userId?.name || 'student'}-${selectedCourse?.title}.pdf`
                  a.click()
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}