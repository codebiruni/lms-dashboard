/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Calendar,
  Star,
  AlertCircle,
  GraduationCap,
  RefreshCw,
  Target,
  FolderOpen,
} from 'lucide-react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'

import GETDATA from '@/app/default/functions/GetData'

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  TooltipProvider,
} from '@/components/ui/tooltip'


// Chart Components (Recharts)
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
  Sector,
} from 'recharts'
import { useRouter } from 'next/navigation'

// Types
interface DashboardData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalCourses: number
    publishedCourses: number
    totalInstructors: number
    totalStudents: number
    totalEnrollments: number
    totalRevenue: number
    monthlyRevenue: number
    pendingPayments: number
  }
  users: {
    byRole: {
      admin: number
      instructor: number
      student: number
      staff: number
    }
    recent: Array<{
      _id: string
      name: string
      email: string
      role: string
      createdAt: string
    }>
  }
  courses: {
    total: number
    published: number
    free: number
    paid: number
    popular: Array<{
      _id: string
      title: string
      totalStudents: number
      rating: number
    }>
  }
  instructors: {
    total: number
    pending: number
    approved: number
    top: Array<{
      _id: string
      name: string
      totalStudents: number
      totalCourses: number
    }>
  }
  students: {
    total: number
    enrolled: number
    completedCourses: number
    averageProgress: number
  }
  financial: {
    totalRevenue: number
    monthlyRevenue: number
    pendingPayments: number
  }
  content: {
    sections: number
    lessons: number
    quizzes: number
    assignments: number
    liveClasses: number
    recordings: number
  }
  engagement: {
    attendance: number
    quizSubmissions: number
    quizPassRate: number
    assignmentSubmissions: number
  }
  leads: {
    total: number
    byStatus: {
      new: number
      contacted: number
      qualified: number
      lost: number
      converted: number
    }
    conversionRate: number
  }
  followUps: {
    total: number
    upcoming: number
  }
  reviews: {
    total: number
    averageRating: number
    distribution: {
      1: number
      2: number
      3: number
      4: number
      5: number
    }
  }
  system: {
    categories: number
    subCategories: number
    questions: number
  }
  timestamp: string
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B']
const STATUS_COLORS = {
  new: '#3B82F6',
  contacted: '#F59E0B',
  qualified: '#10B981',
  lost: '#EF4444',
  converted: '#8B5CF2',
}

// Month names for chart labels
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Skeleton Components
function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-62.5 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

/* -------------------- Main Component -------------------- */

export default function AdminDashboardInventory() {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await GETDATA('/v1/dashboard/admin')
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to load dashboard data')
      }
      return res
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  const data = response?.data as DashboardData | undefined

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Generate monthly user growth data from real data (simulated distribution)
  const getUserGrowthData = () => {
    if (!data) return []
    
    // Distribute total users across last 6 months with realistic growth pattern
    const totalUsers = data.overview.totalUsers
    const monthlyData = []
    
    // Create realistic distribution (last month gets most users, earlier months get fewer)
    const weights = [0.1, 0.15, 0.2, 0.25, 0.3, 0.4] // Increasing weights
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = MONTHS[month.getMonth()]
      const users = Math.round((totalUsers * weights[5-i]) / totalWeight)
      
      monthlyData.push({
        month: monthName,
        users: users,
      })
    }
    
    return monthlyData
  }

  // Prepare chart data from real data
  const getUserRoleData = () => {
    if (!data) return []
    return [
      { name: 'Admin', value: data.users.byRole.admin, color: '#FF6B6B' },
      { name: 'Instructor', value: data.users.byRole.instructor, color: '#4ECDC4' },
      { name: 'Student', value: data.users.byRole.student, color: '#45B7D1' },
      { name: 'Staff', value: data.users.byRole.staff, color: '#96CEB4' },
    ]
  }

  const getLeadStatusData = () => {
    if (!data) return []
    return [
      { name: 'New', value: data.leads.byStatus.new, color: STATUS_COLORS.new },
      { name: 'Contacted', value: data.leads.byStatus.contacted, color: STATUS_COLORS.contacted },
      { name: 'Qualified', value: data.leads.byStatus.qualified, color: STATUS_COLORS.qualified },
      { name: 'Lost', value: data.leads.byStatus.lost, color: STATUS_COLORS.lost },
      { name: 'Converted', value: data.leads.byStatus.converted, color: STATUS_COLORS.converted },
    ].filter(item => item.value > 0) // Only show statuses with values
  }

  const getContentDistribution = () => {
    if (!data) return []
    return [
      { name: 'Sections', value: data.content.sections, color: '#0088FE' },
      { name: 'Lessons', value: data.content.lessons, color: '#00C49F' },
      { name: 'Quizzes', value: data.content.quizzes, color: '#FFBB28' },
      { name: 'Assignments', value: data.content.assignments, color: '#FF8042' },
      { name: 'Live Classes', value: data.content.liveClasses, color: '#8884D8' },
      { name: 'Recordings', value: data.content.recordings, color: '#FF6B6B' },
    ].filter(item => item.value > 0) // Only show content types with values
  }

  const getEngagementData = () => {
    if (!data) return []
    return [
      { name: 'Attendance', value: data.engagement.attendance },
      { name: 'Quiz Submissions', value: data.engagement.quizSubmissions },
      { name: 'Assignments', value: data.engagement.assignmentSubmissions },
    ].filter(item => item.value > 0) // Only show engagement types with values
  }

  // Custom active shape for pie chart
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#888">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={10} textAnchor="middle" className="text-2xl font-bold">
          {value}
        </text>
        <text x={cx} y={cx} dy={30} textAnchor="middle" fill="#888">
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
        <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Calendar className="mr-2 h-3 w-3" />
              {data ? format(new Date(data.timestamp), 'PPP p') : 'Loading...'}
            </Badge>
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.overview.totalUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data?.overview.activeUsers} active · {data?.users.byRole.admin} admins
                  </p>
                  <Progress 
                    value={((data?.overview.activeUsers ?? 0) / (data?.overview.totalUsers ?? 1)) * 100} 
                    className="h-1 mt-3" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.overview.totalCourses}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data?.courses.published} published · {data?.courses.free} free
                  </p>
                  <Progress 
                    value={((data?.courses.published ?? 0) / (data?.courses.total ?? 1)) * 100} 
                    className="h-1 mt-3" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(data?.financial.totalRevenue || 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(data?.financial.monthlyRevenue || 0)} this month
                  </p>
                  <div className="flex items-center mt-3 text-xs">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">
                      {data?.financial.monthlyRevenue && data?.financial.totalRevenue 
                        ? Math.round((data.financial.monthlyRevenue / data.financial.totalRevenue) * 100) 
                        : 0}%
                    </span>
                    <span className="text-muted-foreground ml-1">of total</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.overview.totalEnrollments}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data?.students.completedCourses} completed · {data?.students.averageProgress}% avg progress
                  </p>
                  <Progress value={data?.students.averageProgress ?? 0} className="h-1 mt-3" />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Area Chart - User Growth (Based on real data) */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Platform user growth over time (simulated based on current data)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-62.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={getUserGrowthData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="users" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pie Chart - User Roles (Real data) */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-62.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={getUserRoleData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                      >
                        {getUserRoleData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <RechartsTooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Donut Chart - Lead Status (Real data) */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Lead Status</CardTitle>
                <CardDescription>Current leads by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-62.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={getLeadStatusData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {getLeadStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Bar Chart - Content Distribution (Real data) */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Content Overview</CardTitle>
                <CardDescription>Platform content distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-75">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getContentDistribution()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#3B82F6">
                        {getContentDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#0088FE]" />
                    <span>Total: {
                      (data?.content.sections ?? 0) + 
                      (data?.content.lessons ?? 0) + 
                      (data?.content.quizzes ?? 0) + 
                      (data?.content.assignments ?? 0) + 
                      (data?.content.liveClasses ?? 0) + 
                      (data?.content.recordings ?? 0)
                    }</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          )}

          {/* Radial Chart - Engagement Metrics (Real data) */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Platform engagement overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-75">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="10%"
                      outerRadius="80%"
                      barSize={20}
                      data={getEngagementData().map((item, index) => ({
                        ...item,
                        fill: COLORS[index % COLORS.length],
                      }))}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                        label={{ position: 'insideStart', fill: '#fff' }}
                      />
                      <Legend
                        iconSize={10}
                        layout="horizontal"
                        verticalAlign="bottom"
                        wrapperStyle={{ paddingTop: 20 }}
                      />
                      <RechartsTooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bottom Section */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Recent Users */}
          <Card className='flex flex-col justify-between'>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className=" pr-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data?.users.recent.map((user) => (
                      <div key={user._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t px-4 py-4 ">
              <Button onClick={()=> router.push('/dashboard/user')} variant="outline" className="w-full cursor-pointer -mb-4" size="sm">
                View All Users
              </Button>
            </CardFooter>
          </Card>

          {/* Popular Courses */}
          <Card className='flex flex-col justify-between'>
            <CardHeader>
              <CardTitle>Popular Courses</CardTitle>
              <CardDescription>Most enrolled courses</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className=" pr-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data?.courses.popular.map((course) => (
                      <div key={course._id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{course.title}</p>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-xs">{course.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{course.totalStudents} students</span>
                          <Progress 
                            value={Math.min((course.totalStudents / 100) * 100, 100)} 
                            className="h-1 w-20" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t px-4 py-4 ">
              <Button onClick={()=> router.push('/dashboard/course')} variant="outline" className="w-full  cursor-pointer -mb-4" size="sm">
                View All Courses
              </Button>
            </CardFooter>
          </Card>

          {/* Top Instructors */}
          <Card className='flex flex-col justify-between'>
            <CardHeader>
              <CardTitle>Top Instructors</CardTitle>
              <CardDescription>Best performing instructors</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className=" pr-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data?.instructors.top.map((instructor) => (
                      <div key={instructor._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials(instructor.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{instructor.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {instructor.totalCourses} courses · {instructor.totalStudents} students
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          #{instructor.totalStudents} students
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t px-4 py-4  ">
              <Button onClick={()=> router.push('/dashboard/instructor')} variant="outline" className="w-full cursor-pointer -mb-4" size="sm">
                View All Instructors
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 md:grid-cols-4">
          {isLoading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reviews</p>
                      <p className="text-2xl font-bold">{data?.reviews.total}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Star className="h-6 w-6 text-blue-600 fill-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {data?.reviews.averageRating} avg rating
                    </Badge>
                    <span className="text-xs text-muted-foreground">5 stars: {data?.reviews.distribution[5]}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Leads</p>
                      <p className="text-2xl font-bold">{data?.leads.total}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {data?.leads.conversionRate}% conversion
                    </Badge>
                    <span className="text-xs text-muted-foreground">Qualified: {data?.leads.byStatus.qualified}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Follow-ups</p>
                      <p className="text-2xl font-bold">{data?.followUps.total}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {data?.followUps.upcoming} upcoming
                    </Badge>
                    <span className="text-xs text-muted-foreground">Need attention</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">System</p>
                      <p className="text-2xl font-bold">
                        {(data?.system.categories ?? 0) + 
                         (data?.system.subCategories ?? 0) + 
                         (data?.system.questions ?? 0)}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <FolderOpen className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {data?.system.categories ?? 0} categories
                    </Badge>
                    <span className="text-xs text-muted-foreground">{data?.system.questions ?? 0} questions</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}