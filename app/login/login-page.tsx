'use client'

import { motion } from 'framer-motion'
import LoginForm from './login-form'

export default function LoginPage() {
  return (
    <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
        className="min-h-full min-w-full  flex items-center justify-center bg-muted/50 px-4"
      >
        <LoginForm />
      </motion.div>
  )
}
