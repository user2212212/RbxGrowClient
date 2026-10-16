"use client"
import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/shadcn/dialog"
import { API } from "@/lib/env"
import { useSiteStore } from "@/store/site"
import toast from "react-hot-toast"

interface LoginProps {
  children: React.ReactNode
}

export function Login({ children }: LoginProps) {
  const [open, setOpen] = React.useState(false)
  const [username, setUsername] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [verification, setVerification] = React.useState<{ session: string; phase: string } | null>(null)
  const { setSession } = useSiteStore()

  const reset = () => {
    setUsername("")
    setLoading(false)
    setVerification(null)
  }

  const submit = async () => {
    if (!username.trim()) return toast.error("Enter a Roblox username")
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/session/roblox`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          verification ? { username, session: verification.session } : { username }
        ),
      })
      const data = await res.json()
      const ok = data.success ?? data.sucess

      if (!res.ok || !ok) {
        toast.error(data.message || "Login failed")
        return
      }

      if (data.data?.session && data.data?.user?._id) {
        setSession(data.data.session, data.data.user)
        toast.success("Logged in")
        setOpen(false)
        reset()
        return
      }
      if (data.data?.verification) {
        setVerification({
          session: data.data.verification.session,
          phase: data.data.verification.phase,
        })
        return
      }

      toast.error("Unexpected response")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent showCloseButton={false}>
        {verification && (
          <div className="pr-8">
            <p>Put this phrase in your Roblox profile description:</p>
            <p className="font-bold wrap-break-words">{verification.phase}</p>
          </div>
        )}

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Roblox Username"
          disabled={loading || !!verification}
        />

        <button type="button" disabled={loading} onClick={submit}>
          {loading
            ? "Loading..."
            : verification
            ? "I've updated my profile"
            : "Continue with Roblox"}
        </button>
      </DialogContent>
    </Dialog>
  )
}

export default Login