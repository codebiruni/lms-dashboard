'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-linear-to-tr from-primary/5 via-background to-primary/10 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 items-center gap-10 p-8 md:p-16"
      >
        {/* LEFT: Illustration + Text */}
        <div className="space-y-6 text-center md:text-left">
          <div className="flex justify-center md:justify-start">
            <div className="h-20 w-20 rounded bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
          </div>

          <h1 className="text-6xl font-extrabold tracking-tight text-foreground">
            404
          </h1>

          <h2 className="text-3xl md:text-4xl font-bold text-muted-foreground">
            Oops! Page not found
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-md">
            The page you’re looking for might have been removed, had its name
            changed, or is temporarily unavailable. Don’t worry, you can go back
            to safety.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.back()}
            >
              Try Going Back
            </Button>
          </div>
        </div>

        {/* RIGHT: Hero Illustration */}
        <div className="flex items-center justify-center">
          <motion.img
            src="/404-illustration.jpg" 
            alt="Page not found illustration"
            className="w-full rounded max-w-md"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </div>
  )
}
