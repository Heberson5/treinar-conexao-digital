import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/auth-context"

const CHANNEL_NAME = "online-users"

/**
 * Junta-se ao canal de presença e retorna o conjunto de user IDs online.
 * Todo cliente autenticado que usar este hook (ou o tracker global) é registrado.
 */
export function useOnlineUsers() {
  const { user } = useAuth()
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase.channel(CHANNEL_NAME, {
      config: { presence: { key: user.id } },
    })

    const syncState = () => {
      const state = channel.presenceState() as Record<string, unknown[]>
      setOnlineIds(new Set(Object.keys(state)))
    }

    channel
      .on("presence", { event: "sync" }, syncState)
      .on("presence", { event: "join" }, syncState)
      .on("presence", { event: "leave" }, syncState)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  return onlineIds
}
