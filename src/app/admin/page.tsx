"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (res.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, message: data.error })
      }
    } catch (err) {
      setResult({ success: false, message: 'Failed to upload file' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>Upload Historical Data</CardTitle>
            <CardDescription className="text-zinc-400">
              Upload CSV files containing CAP round cutoff data.
              Required columns: year, college_name, choice_code, course_name, category, rank, percentile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:bg-white/5 transition-colors">
                <Input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-4">
                  <UploadCloud className="w-12 h-12 text-zinc-400" />
                  <div className="space-y-1">
                    <p className="font-medium">{file ? file.name : 'Click to select or drag and drop'}</p>
                    <p className="text-sm text-zinc-500">CSV files only</p>
                  </div>
                </label>
              </div>

              {result && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${result.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {result.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {result.message}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={!file || loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? 'Uploading & Processing...' : 'Upload Data'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
