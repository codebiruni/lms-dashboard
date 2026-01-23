/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from 'lucide-react'

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
import { useEffect, useState } from 'react'
import LOGINUSER from '../default/functions/LoginUser'
import { toast } from 'sonner'
import useContextData from '../default/custom-component/useContextData'
import { useRouter } from 'next/navigation'

type LoginFormValues = {
  identifier: string
  password: string
  remember: boolean
}

const saveLoginCreditional = (data:LoginFormValues) => {
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

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const {handleUser , handleProfile} = useContextData()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>()

  /* ---------------- Load saved credentials ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem('loginCredentials')
    if (saved) {
      const parsed = JSON.parse(saved)
      setValue('identifier', parsed.identifier)
      setValue('password', parsed.password)
      setValue('remember', true)
    }
  }, [setValue])

  /* ---------------- Submit ---------------- */
  const onSubmit = async(data: LoginFormValues) => {
    saveLoginCreditional(data)
    setIsLoading(true);
    setError(null);

    try {
      const res = await LOGINUSER("/v1/auth/dashboard-login", data);
      if (!res.success) {
        setError(res.message || "Invalid credentials");
        toast.error(res.message || "Invalid credentials");
      } else {
        const user = res.data.user;
        handleProfile(res.data.Profile)
        handleUser({
          _id: user._id,
          id: user.id,
          role: user.role,
          name: user.name,
          image: user.image,
        });
        toast.success("You have been logged in successfully");
        reset();
        if (user.role === 'admin') {
         router.push("/dashboard"); 
        }
      }
    } catch (err: any) {
      console.log(err);
      setError("An unexpected error occurred");
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
    
  }

  return (
    <Card className="relative w-full max-w-md my-10 overflow-hidden border bg-background shadow-xl">
      {/* subtle premium gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10" />

      <CardHeader className="relative space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>

        <CardTitle className="text-2xl font-bold">
          Welcome Back
        </CardTitle>
        <CardDescription>
          Sign in to continue to your dashboard
        </CardDescription>
        {error ? <CardDescription className='w-full p-1 bg-red-200 text-red-600 text-center'>
          {error}
        </CardDescription> : ""}
        
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
              className="text-sm hidden text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button
  size="lg"
  type="submit"
  disabled={isLoading}
  className="w-full flex items-center justify-center gap-2 transition-all"
>
  {isLoading ? (
    <>
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Signing In...</span>
    </>
  ) : (
    <>
      <LogIn className="h-5 w-5" />
      <span>Sign In</span>
    </>
  )}
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
