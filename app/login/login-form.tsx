'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type LoginFormValues = {
  identifier: string
  password: string
  remember: boolean
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>()

  /* ---------------- Load saved credentials ---------------- */
  React.useEffect(() => {
    const saved = localStorage.getItem('loginCredentials')
    if (saved) {
      const parsed = JSON.parse(saved)
      setValue('identifier', parsed.identifier)
      setValue('password', parsed.password)
      setValue('remember', true)
    }
  }, [setValue])

  /* ---------------- Submit ---------------- */
  const onSubmit = (data: LoginFormValues) => {
    console.log('Login Data:', data)

    if (data.remember) {
      localStorage.setItem(
        'loginCredentials',
        JSON.stringify({
          identifier: data.identifier,
          password: data.password,
        }),
      )
    } else {
      localStorage.removeItem('loginCredentials')
    }
  }

  return (
    <Card className="relative w-full max-w-md my-10 overflow-hidden border bg-background shadow-xl">
      {/* subtle premium gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10" />

      <CardHeader className="relative space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>

        <CardTitle className="text-2xl font-bold">
          Welcome Back
        </CardTitle>
        <CardDescription>
          Sign in to continue to your dashboard
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email or Phone */}
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Phone</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="identifier"
                placeholder="you@example.com or 01XXXXXXXXX"
                className="pl-9"
                {...register('identifier', {
                  required: 'Email or phone is required',
                })}
              />
            </div>
            {errors.identifier && (
              <p className="text-sm text-destructive">
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pr-10"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" {...register('remember')} />
              <Label htmlFor="remember" className="cursor-pointer">
                Remember me
              </Label>
            </div>

            <button
              type="button"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button size="lg" type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          Secure login · LMS Platform
        </p>
      </CardContent>
    </Card>
  )
}
