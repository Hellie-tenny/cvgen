export function isOfflineMode() {
  const v =
    process.env.NEXT_PUBLIC_OFFLINE ??
    process.env.OFFLINE ??
    process.env.NEXT_PUBLIC_NO_NETWORK ??
    process.env.NO_NETWORK

  if (!v) return false
  return v === '1' || v.toLowerCase() === 'true' || v.toLowerCase() === 'yes'
}

