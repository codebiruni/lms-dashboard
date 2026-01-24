'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, LogIn, ExternalLink, BookOpen, BarChart3, Users, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import LoginPage from '../login/login-page'
import useContextData from './custom-component/useContextData'
import { useRouter } from 'next/navigation'

export default function HomeComponent() {
  const [showLogin, setShowLogin] = useState<boolean>(false)
  const {UserData} = useContextData()
  const router = useRouter()

  if (UserData && UserData?.role === 'admin') {
    router.push('/dashboard')
  }
  if (UserData && UserData?.role === 'instructor') {
    router.push('/instructor')
  }

  return (
    <div className="flex min-h-screen  w-full items-center justify-center bg-background p-2 font-sans">
      <div className="h-[calc(100vh-16px)] overflow-y-auto scroll-none w-full rounded border bg-linear-to-br from-primary/5 via-transparent to-primary/10 shadow ">
        {/* ---------------- MAIN PAGE ---------------- */}
        <div className='scroll-none'>
          {!showLogin && (
            <motion.div
              key="main"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex h-full items-center md:p-10 scroll-none justify-center"
            >
             <Card className="relative w-full scroll-none overflow-hidden border-0 bg-transparent shadow-none">
  {/* subtle gradient background */}
  <div className="absolute scroll-none inset-0 " />

  <CardContent className="relative grid gap-10 p-10 md:grid-cols-2 md:p-14">
    {/* LEFT CONTENT */}
    <div className="flex flex-col justify-center space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-10 w-10 text-primary" />
        <span className="text-sm font-medium tracking-wide text-primary">
          Smart Learning Platform
        </span>
      </div>

      <h1 className="text-4xl font-bold leading-tight md:text-5xl">
        Learn Smarter. <br />
        <span className="text-primary">Grow Faster.</span>
      </h1>

      <p className="text-lg text-muted-foreground">
        A modern Learning Management System designed to help students,
        teachers, and institutions manage courses, track progress,
        and achieve real results — all in one powerful platform.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          size="lg"
          className="gap-2"
          onClick={() => setShowLogin(true)}
        >
          <LogIn className="h-5 w-5" />
          Login to Dashboard
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="gap-2"
          onClick={() =>
            window.open('https://example.com', '_blank')
          }
        >
          <ExternalLink className="h-5 w-5" />
          Visit Main Website
        </Button>
      </div>
    </div>

    {/* RIGHT FEATURES */}
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="rounded border bg-muted/40 p-5">
        <BookOpen className="mb-3 h-6 w-6 text-primary" />
        <h3 className="font-semibold">Interactive Courses</h3>
        <p className="text-sm text-muted-foreground">
          Structured lessons, videos, and materials for effective learning.
        </p>
      </div>

      <div className="rounded border bg-muted/40 p-5">
        <BarChart3 className="mb-3 h-6 w-6 text-primary" />
        <h3 className="font-semibold">Progress Tracking</h3>
        <p className="text-sm text-muted-foreground">
          Monitor performance, completion status, and achievements.
        </p>
      </div>

      <div className="rounded border bg-muted/40 p-5">
        <Users className="mb-3 h-6 w-6 text-primary" />
        <h3 className="font-semibold">Role-Based Access</h3>
        <p className="text-sm text-muted-foreground">
          Separate dashboards for students, teachers, and admins.
        </p>
      </div>

      <div className="rounded border bg-muted/40 p-5">
        <ShieldCheck className="mb-3 h-6 w-6 text-primary" />
        <h3 className="font-semibold">Secure & Reliable</h3>
        <p className="text-sm text-muted-foreground">
          Authentication, data protection, and scalable architecture.
        </p>
      </div>
    </div>
  </CardContent>
</Card>

            </motion.div>
          )}
        </div>

        {/* ---------------- LOGIN PAGE ---------------- */}
        <div>
          {showLogin && (
            <motion.div
              key="login"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex h-full items-center justify-center"
            >
              <div className="relative h-full w-full">
                {/* Back Button */}
                <Button
                  variant="ghost"
                  className="absolute left-4 top-4 gap-2"
                  onClick={() => setShowLogin(false)}
                >
                  ← Back
                </Button>

                <LoginPage />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
