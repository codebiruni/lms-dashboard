/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import useFetchLiveClass from '@/app/default/custom-component/useFetchLiveClass'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

import GETDATA from '@/app/default/functions/GetData'
import POSTDATA from '@/app/default/functions/Post'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Loader2 } from 'lucide-react'

type Student = {
  _id: string
  id: string
  userId: {
    name: string
    email: string
  }
}

export default function CreateAttendance() {
  const [courseId, setCourseId] = useState<string | null>(null)
  const [liveClassId, setLiveClassId] = useState<string | null>(null)

  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [statusMap, setStatusMap] = useState<Record<string, string>>({})

  const [joinedAt, setJoinedAt] = useState<string>("")
  const [leftAt, setLeftAt] = useState<string>("")

  const [loadingStudents, setLoadingStudents] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  /* ----------- Fetch Courses ----------- */
  const { courses, isLoading: courseLoading } = useFetchCourses({})

  /* ----------- Fetch Live Classes ----------- */
  const { liveClasses, isLoading: liveLoading } = useFetchLiveClass({
    limit: 100,
  })

  /* ----------- Filter Live Classes by Course ----------- */
  const filteredLiveClasses = liveClasses.filter(
    (lc: any) => lc.courseId?._id === courseId
  )

  /* ----------- Fetch Students ----------- */
  useEffect(() => {
    const fetchStudents = async () => {
      if (!courseId) return

      try {
        setLoadingStudents(true)

        const res = await GETDATA<any>(
          `/v1/student/course/${courseId}?page=1&limit=100`
        )

        const data = res?.data?.data || []

        setStudents(data)
        setSelectedStudents([])
        setStatusMap({})
      } catch (err: any) {
        toast.error('Failed to fetch students')
      } finally {
        setLoadingStudents(false)
      }
    }

    fetchStudents()
  }, [courseId])

  /* ----------- Select All ----------- */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = students.map((s) => s._id)
      setSelectedStudents(allIds)

      const map: any = {}
      allIds.forEach((id) => (map[id] = 'present'))
      setStatusMap(map)
    } else {
      setSelectedStudents([])
      setStatusMap({})
    }
  }

  /* ----------- Individual Select ----------- */
  const handleSelectStudent = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents((prev) => [...prev, id])
      setStatusMap((prev) => ({ ...prev, [id]: 'present' }))
    } else {
      setSelectedStudents((prev) => prev.filter((s) => s !== id))
      setStatusMap((prev) => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })
    }
  }

  const handleStatusChange = (id: string, status: string) => {
    setStatusMap((prev) => ({ ...prev, [id]: status }))
  }

  /* ----------- Submit Attendance ----------- */
  const handleSubmit = async () => {
    if (!courseId || !liveClassId) {
      toast.error('Please select course and live class')
      return
    }

    if (!joinedAt || !leftAt) {
      toast.error('Please select join time and left time')
      return
    }

    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student')
      return
    }

    try {
      setSubmitting(true)

      const joinedDate = new Date(joinedAt)
      const leftDate = new Date(leftAt)

      for (const studentId of selectedStudents) {
        const payload = {
          courseId,
          liveClassId,
          studentId,
          status: statusMap[studentId] || 'present',
          joinedAt: joinedDate,
          leftAt: leftDate,
        }

        await POSTDATA('/v1/attendance', payload)
      }

      toast.success('Attendance created successfully 🎉')

      setSelectedStudents([])
      setStatusMap({})
      setJoinedAt("")
      setLeftAt("")

    } catch (error: any) {
      toast.error('Failed to create attendance')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Attendance</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Course + Live Class */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Select Course</Label>

              {courseLoading ? (
                <Skeleton className="h-10 w-full mt-2" />
              ) : (
                <Select onValueChange={setCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Course" />
                  </SelectTrigger>

                  <SelectContent>
                    {courses.map((course: any) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label>Select Live Class</Label>

              {liveLoading ? (
                <Skeleton className="h-10 w-full mt-2" />
              ) : (
                <Select
                  onValueChange={setLiveClassId}
                  disabled={!courseId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Live Class" />
                  </SelectTrigger>

                  <SelectContent>
                    {filteredLiveClasses.map((lc: any) => (
                      <SelectItem key={lc._id} value={lc._id}>
                        {lc.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Date Time Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Join At (Date & Time)</Label>
              <Input
                type="datetime-local"
                value={joinedAt}
                onChange={(e) => setJoinedAt(e.target.value)}
              />
            </div>

            <div>
              <Label>Left At (Date & Time)</Label>
              <Input
                type="datetime-local"
                value={leftAt}
                onChange={(e) => setLeftAt(e.target.value)}
              />
            </div>
          </div>

          {/* Students Table */}
          <div>
            <Label>Students</Label>

            {loadingStudents ? (
              <Skeleton className="h-40 w-full mt-2" />
            ) : (
              <Table className="mt-2">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox
                        checked={
                          selectedStudents.length === students.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Id</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStudents.includes(student._id)}
                          onCheckedChange={(v) =>
                            handleSelectStudent(student._id, !!v)
                          }
                        />
                      </TableCell>

                      <TableCell>{student.id}</TableCell>
                      <TableCell>{student.userId?.name}</TableCell>
                      <TableCell>{student.userId?.email}</TableCell>

                      <TableCell>
                        <Select
                          disabled={
                            !selectedStudents.includes(student._id)
                          }
                          value={statusMap[student._id] || 'present'}
                          onValueChange={(v) =>
                            handleStatusChange(student._id, v)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="present">
                              <Badge>Present</Badge>
                            </SelectItem>
                            <SelectItem value="absent">
                              <Badge variant="destructive">
                                Absent
                              </Badge>
                            </SelectItem>
                            <SelectItem value="late">
                              <Badge variant="secondary">
                                Late
                              </Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <Button
            className="w-full"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Saving Attendance...
              </>
            ) : (
              'Create Attendance'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
