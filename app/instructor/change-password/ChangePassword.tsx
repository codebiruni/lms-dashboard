'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, KeyRound, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

// Shadcn/ui imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

import POSTDATA from '@/app/default/functions/Post'

interface FormData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

interface FormErrors {
  oldPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default function ChangePassword() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const [formData, setFormData] = useState<FormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  const [errors, setErrors] = useState<FormErrors>({})

  // Calculate password strength
  useEffect(() => {
    let strength = 0
    const { newPassword } = formData
    if (newPassword) {
      if (newPassword.length >= 8) strength += 25
      if (/[A-Z]/.test(newPassword)) strength += 25
      if (/[0-9]/.test(newPassword)) strength += 25
      if (/[^A-Za-z0-9]/.test(newPassword)) strength += 25
    }
    setPasswordStrength(strength)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.newPassword])

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500'
    if (passwordStrength <= 50) return 'bg-orange-500'
    if (passwordStrength <= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak'
    if (passwordStrength <= 50) return 'Fair'
    if (passwordStrength <= 75) return 'Good'
    return 'Strong'
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Validate old password
    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Old password is required'
    } else if (formData.oldPassword.length < 6) {
      newErrors.oldPassword = 'Old password must be at least 6 characters'
    }
    
    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters'
      } else if (!/[A-Z]/.test(formData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one uppercase letter'
      } else if (!/[a-z]/.test(formData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one lowercase letter'
      } else if (!/[0-9]/.test(formData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one number'
      } else if (!/[^A-Za-z0-9]/.test(formData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one special character'
      } else if (formData.newPassword === formData.oldPassword) {
        newErrors.newPassword = 'New password must be different from old password'
      }
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleReset = () => {
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setErrors({})
    setPasswordStrength(0)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await POSTDATA('/v1/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      })

      if (response.success) {
        toast.success('Password changed successfully!', {
          description: 'Your password has been updated. Please login again.',
          duration: 5000,
        })
        
        // Reset form
        handleReset()
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        toast.error(response.message || 'Failed to change password', {
          description: 'Please check your old password and try again.',
        })
      }
    } catch (error) {
      console.error('Password change error:', error)
      toast.error('An error occurred', {
        description: 'Please try again later.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center border-b pb-6">
          <div className="mx-auto w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Change Password
          </CardTitle>
          <CardDescription className="text-base">
            Create a strong and secure password to protect your account
          </CardDescription>
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6 pt-6">
            {/* Old Password Field */}
            <div className="space-y-2">
              <Label htmlFor="oldPassword" className="text-sm font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  className="pr-10 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.oldPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.oldPassword}
                </p>
              )}
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-semibold flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="pr-10 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Password strength:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength <= 25 ? 'text-red-500' :
                      passwordStrength <= 50 ? 'text-orange-500' :
                      passwordStrength <= 75 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.newPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pr-10 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Requirements Alert */}
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">Password requirements:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>At least 8 characters long</li>
                  <li>Contains at least one uppercase letter (A-Z)</li>
                  <li>Contains at least one lowercase letter (a-z)</li>
                  <li>Contains at least one number (0-9)</li>
                  <li>Contains at least one special character (!@#$%^&*)</li>
                  <li>New password must be different from old password</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex gap-3 pt-2 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
              className="flex-1 h-11"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}