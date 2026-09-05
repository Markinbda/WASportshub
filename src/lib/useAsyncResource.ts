import { useEffect, useEffectEvent, useState } from 'react'

export function useAsyncResource<T>(loader: () => Promise<T>, initialValue: T, reloadKey = 'initial') {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const load = useEffectEvent(loader)

  useEffect(() => {
    let active = true
    void load()
      .then((next) => {
        if (active) setData(next)
      })
      .catch((reason: unknown) => {
        console.error('[useAsyncResource]', reason)
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [reloadKey])

  return { data, loading, error, setData }
}