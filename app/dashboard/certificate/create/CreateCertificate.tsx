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
    <div style={{ width: '100%', height: '100%', padding: '2%' }}>
      <Card style={{ width: '100%', height: '100%' }}>
        <CardHeader style={{ padding: '3%' }}>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '2%' }}>
            <FileText style={{ height: '5%', width: '5%' }} />
            <span style={{ fontSize: '1.5rem' }}>Generate Certificate</span>
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: '3%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5%' }}>
            {/* Student Selection with Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2%', width: '100%' }}>
              <Label style={{ marginBottom: '1%' }}>
                Select Student <span style={{ color: 'red' }}>*</span>
              </Label>
              <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={studentOpen}
                    style={{ 
                      width: '100%', 
                      justifyContent: 'space-between',
                      padding: '2%'
                    }}
                  >
                    {selectedStudent ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2%' }}>
                        {selectedStudent.userId?.image && (
                          <Image
                            src={selectedStudent.userId.image}
                            alt={selectedStudent.userId.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        )}
                        <span>{selectedStudent.userId?.name || selectedStudent.id}</span>
                        <Badge variant="outline" style={{ marginLeft: '2%', fontSize: '70%' }}>
                          {selectedStudent.id}
                        </Badge>
                      </div>
                    ) : (
                      "Select a student..."
                    )}
                    <Search style={{ marginLeft: '2%', height: '4%', width: '4%', opacity: 0.5 }} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent style={{ width: '90%', padding: 0 }}>
                  <Command>
                    <CommandInput 
                      placeholder="Search students..." 
                      onValueChange={setStudentSearch}
                    />
                    <CommandEmpty>
                      {studentsLoading ? 'Loading...' : 'No students found.'}
                    </CommandEmpty>
                    <CommandGroup style={{ maxHeight: '50%', overflow: 'auto' }}>
                      {students.map((student: any) => (
                        <CommandItem
                          key={student._id}
                          value={`${student.userId?.name || ''} ${student.id}`}
                          onSelect={() => {
                            setSelectedStudent(student)
                            setStudentOpen(false)
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2%', width: '100%' }}>
                            {student.userId?.image && (
                              <Image
                                src={student.userId.image}
                                alt={student.userId.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: '500' }}>
                                {student.userId?.name || 'Unnamed Student'}
                              </p>
                              <p style={{ fontSize: '70%', color: 'gray' }}>
                                ID: {student.id} | Email: {student.userId?.email || 'N/A'}
                              </p>
                            </div>
                            {selectedStudent?._id === student._id && (
                              <Badge variant="default" style={{ marginLeft: '2%' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2%', width: '100%' }}>
              <Label style={{ marginBottom: '1%' }}>
                Select Course <span style={{ color: 'red' }}>*</span>
              </Label>
              <Popover open={courseOpen} onOpenChange={setCourseOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={courseOpen}
                    style={{ 
                      width: '100%', 
                      justifyContent: 'space-between',
                      padding: '2%'
                    }}
                  >
                    {selectedCourse ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2%' }}>
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
                        <Badge variant="outline" style={{ marginLeft: '2%', fontSize: '70%' }}>
                          {selectedCourse.level}
                        </Badge>
                      </div>
                    ) : (
                      "Select a course..."
                    )}
                    <Search style={{ marginLeft: '2%', height: '4%', width: '4%', opacity: 0.5 }} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent style={{ width: '90%', padding: 0 }}>
                  <Command>
                    <CommandInput 
                      placeholder="Search courses..." 
                      onValueChange={setCourseSearch}
                    />
                    <CommandEmpty>
                      {coursesLoading ? 'Loading...' : 'No courses found.'}
                    </CommandEmpty>
                    <CommandGroup style={{ maxHeight: '50%', overflow: 'auto' }}>
                      {courses.map((course: any) => (
                        <CommandItem
                          key={course._id}
                          value={course.title}
                          onSelect={() => {
                            setSelectedCourse(course)
                            setCourseOpen(false)
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2%', width: '100%' }}>
                            {course.thumbnail && (
                              <Image
                                src={course.thumbnail}
                                alt={course.title}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: '500' }}>{course.title}</p>
                              <p style={{ fontSize: '70%', color: 'gray' }}>
                                Level: {course.level} | Price: ${course.price}
                              </p>
                            </div>
                            {selectedCourse?._id === course._id && (
                              <Badge variant="default" style={{ marginLeft: '2%' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2%', width: '100%' }}>
              <Label>Issued Date</Label>
              <Input
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                style={{ width: '100%', padding: '2%' }}
              />
            </div>

            <Separator style={{ margin: '3% 0' }} />

            {/* Action Buttons */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '2%',
              width: '100%'
            }}>
              <Button
                onClick={() => handleGenerate(true)}
                disabled={loading || !selectedStudent || !selectedCourse}
                variant="outline"
                style={{ width: '100%', padding: '3%' }}
              >
                {loading ? (
                  <Loader2 style={{ marginRight: '2%', height: '4%', width: '4%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Download style={{ marginRight: '2%', height: '4%', width: '4%' }} />
                )}
                Download PDF
              </Button>

              <Button
                onClick={handlePreview}
                disabled={previewLoading || !selectedStudent || !selectedCourse}
                variant="outline"
                style={{ width: '100%', padding: '3%' }}
              >
                {previewLoading ? (
                  <Loader2 style={{ marginRight: '2%', height: '4%', width: '4%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Eye style={{ marginRight: '2%', height: '4%', width: '4%' }} />
                )}
                Preview
              </Button>

              <Button
                onClick={() => handleGenerate(false)}
                disabled={loading || !selectedStudent || !selectedCourse}
                style={{ width: '100%', padding: '3%' }}
              >
                {loading ? (
                  <Loader2 style={{ marginRight: '2%', height: '4%', width: '4%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <FileText style={{ marginRight: '2%', height: '4%', width: '4%' }} />
                )}
                Generate & Store
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent style={{ 
          maxWidth: '90%', 
          width: '90%',
          height: '85vh',
          padding: '0'
        }}>
          <DialogHeader style={{ padding: '3%' }}>
            <DialogTitle style={{ fontSize: '1.5rem' }}>Certificate Preview</DialogTitle>
          </DialogHeader>
          <div style={{ width: '100%', height: 'calc(100% - 20%)', padding: '2%' }}>
            {previewUrl && (
              <iframe
                src={previewUrl}
                style={{ width: '100%', height: '100%', borderRadius: '2%', border: '1px solid #ccc' }}
                title="Certificate Preview"
              />
            )}
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '2%',
            padding: '3%',
            paddingTop: '1%'
          }}>
            <Button
              variant="outline"
              style={{ padding: '2% 4%' }}
              onClick={() => {
                if (previewUrl) {
                  const a = document.createElement('a')
                  a.href = previewUrl
                  a.download = `certificate-${selectedStudent?.userId?.name || 'student'}-${selectedCourse?.title}.pdf`
                  a.click()
                }
              }}
            >
              <Download style={{ marginRight: '2%', height: '4%', width: '4%' }} />
              Download
            </Button>
            <Button 
              onClick={() => setShowPreview(false)}
              style={{ padding: '2% 4%' }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add keyframe animation for spinner */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}