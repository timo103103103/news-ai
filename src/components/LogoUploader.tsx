import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  onUploaded?: (url: string) => void
}

export default function LogoUploader({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const MAX_SIZE = 2 * 1024 * 1024
  const ACCEPT = ['image/jpeg', 'image/png', 'image/svg+xml']

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setError(null)
    setFile(null)
    setPreview(null)
    if (!f) return
    if (!ACCEPT.includes(f.type)) {
      setError('Invalid file type. Use JPG, PNG, or SVG.')
      return
    }
    if (f.size > MAX_SIZE) {
      setError('File too large. Max 2MB.')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const upload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
      const key = `logo/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage.from('branding').upload(key, file, {
        upsert: true,
        cacheControl: '3600',
      })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('branding').getPublicUrl(key)
      const url = data.publicUrl
      localStorage.setItem('appLogoUrl', url)
      onUploaded?.(url)
    } catch (e: any) {
      setError(e?.message || 'Upload failed. Check network/storage.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Upload Logo (JPG/PNG/SVG, max 2MB)</label>
      <input type="file" accept=".jpg,.jpeg,.png,.svg" onChange={handleSelect} />
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Preview" className="h-16 w-16 object-contain rounded" />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={upload}
        disabled={!file || loading}
        className={`px-4 py-2 rounded bg-blue-600 text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Uploading…' : 'Save Logo'}
      </button>
    </div>
  )
}
