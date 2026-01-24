'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { UploadCloud, ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import POSTDATA from "@/app/default/functions/Post"

export default function CreateInstructor() {
  /* -------------------- STATE -------------------- */
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [expertise, setExpertise] = useState("")
  const [selery, setSelery] = useState<number | "">("")

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  /* -------------------- IMAGE HANDLERS -------------------- */
  const handleFile = (file: File) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!name || !email || !password) {
      toast.error("Name, email and password are required")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("password", password)

      if (phone) formData.append("phone", phone)
      if (bio) formData.append("bio", bio)
      if (expertise) formData.append("expertise", expertise)
      if (selery !== "") formData.append("selery", String(selery))
      if (image) formData.append("image", image)

      const res = await POSTDATA("/v1/instructor", formData)

      if (!res.success) {
        throw new Error(res?.message || "Failed to create instructor")
      }

      toast.success("Instructor created successfully 🎉 OTP sent to email")

      /* RESET */
      setName("")
      setEmail("")
      setPhone("")
      setPassword("")
      setBio("")
      setExpertise("")
      setSelery("")
      setImage(null)
      setPreview(null)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="rounded shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Create New Instructor
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* -------- BASIC INFO -------- */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                placeholder="+8801XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* -------- INSTRUCTOR INFO -------- */}
          <div className="space-y-2">
            <Label>Expertise</Label>
            <Input
              placeholder="Web Development, Data Science"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              placeholder="Short instructor bio..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Salary</Label>
            <Input
              type="number"
              placeholder="50000"
              value={selery}
              onChange={(e) =>
                setSelery(e.target.value ? Number(e.target.value) : "")
              }
            />
          </div>

          {/* -------- IMAGE -------- */}
          <div className="space-y-2">
            <Label>Profile Image</Label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative flex h-52 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) =>
                  e.target.files && handleFile(e.target.files[0])
                }
              />

              {preview ? (
                <Image
                  src={preview}
                  alt="preview"
                  fill
                  className="rounded object-cover"
                />
              ) : (
                <>
                  <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop image here or click to upload
                  </p>
                </>
              )}
            </div>
          </div>

          {/* -------- SUBMIT -------- */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Create Instructor
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
