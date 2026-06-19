"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Building2, MapPin, BadgeCheck, TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CollegePage() {
  const params = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    
    fetch(`/api/college/${params.id}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  if (!data || data.error) {
    return <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl mb-4">College not found</h1>
      <Link href="/"><Button variant="outline">Go Back</Button></Link>
    </div>
  }

  const { collegeName, data: rawData, branches } = data

  // Process data for charts
  const branchTrends = branches.map((branch: string) => {
    const branchData = rawData.filter((d: any) => d.course_name === branch)
    const y2024 = branchData.find((d: any) => d.year === 2024)?.percentile
    const y2025 = branchData.find((d: any) => d.year === 2025)?.percentile
    
    return {
      branch: branch.substring(0, 20) + (branch.length > 20 ? '...' : ''),
      fullBranch: branch,
      '2024': y2024,
      '2025': y2025,
      diff: y2025 && y2024 ? +(y2025 - y2024).toFixed(2) : null
    }
  }).filter((b: any) => b['2025']) // Only show branches that have current data

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-zinc-400 hover:text-white hover:bg-white/5 border-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
          </Button>
        </Link>

        <div className="space-y-4 border-b border-white/10 pb-8">
          <h1 className="text-3xl md:text-5xl font-bold">{collegeName}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
            {rawData[0]?.city && (
              <span className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <MapPin className="w-4 h-4" /> {rawData[0].city}
              </span>
            )}
            {rawData[0]?.type && (
              <span className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <Building2 className="w-4 h-4" /> {rawData[0].type}
              </span>
            )}
            {rawData[0]?.autonomous && (
              <span className="flex items-center gap-1 bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-full border border-purple-500/20">
                <BadgeCheck className="w-4 h-4" /> Autonomous
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Branch Comparison Chart */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Branch Cutoffs (2025)</CardTitle>
              <CardDescription className="text-zinc-400">Comparison of latest cutoffs across branches</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchTrends} layout="vertical" margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                  <XAxis type="number" domain={['dataMin - 2', 'dataMax + 1']} stroke="#ffffff50" />
                  <YAxis dataKey="branch" type="category" width={100} stroke="#ffffff50" tick={{fontSize: 12}} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff10', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="2025" fill="#a855f7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Historical Trend */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Detailed Branch Statistics</CardTitle>
              <CardDescription className="text-zinc-400">Historical comparison 2024 vs 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {branchTrends.map((branch: any, i: number) => (
                  <div key={i} className="p-4 bg-zinc-900/50 rounded-lg border border-white/5">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-sm text-zinc-200">{branch.fullBranch}</h4>
                      {branch.diff !== null && (
                        <Badge className={`${branch.diff > 0 ? 'bg-emerald-500/10 text-emerald-400' : branch.diff < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-zinc-500/10 text-zinc-400'} border-0`}>
                          {branch.diff > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : branch.diff < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
                          {Math.abs(branch.diff)}%
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-zinc-500">2024 Cutoff</p>
                        <p className="font-mono text-lg">{branch['2024'] ? `${branch['2024']}%` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">2025 Cutoff</p>
                        <p className="font-mono text-lg text-purple-400">{branch['2025']}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
