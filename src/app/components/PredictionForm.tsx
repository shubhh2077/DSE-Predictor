"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Building2, BookOpen, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface PredictionResult {
  id: string
  college_name: string
  course_name: string
  city: string
  category: string
  type: string | null
  autonomous: boolean
  data2024: number | null
  data2025: number | null
  margin: number
  status: 'Very Likely' | 'Possible' | 'Borderline'
}

export function PredictionForm() {
  const [percentile, setPercentile] = useState<string>('')
  const [category, setCategory] = useState<string>('GOPEN')
  const [options, setOptions] = useState({ categories: [], branches: [], cities: [] })
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [results, setResults] = useState<PredictionResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Load state from sessionStorage on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('predictionState')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed.percentile) setPercentile(parsed.percentile)
        if (parsed.category) setCategory(parsed.category)
        if (parsed.selectedBranches) setSelectedBranches(parsed.selectedBranches)
        if (parsed.selectedCities) setSelectedCities(parsed.selectedCities)
        if (parsed.results) setResults(parsed.results)
        if (parsed.hasSearched) setHasSearched(parsed.hasSearched)
      } catch (e) {
        console.error('Failed to parse saved state', e)
      }
    }

    fetch('/api/options')
      .then(res => res.json())
      .then(data => setOptions(data))
      .catch(console.error)
  }, [])

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('predictionState', JSON.stringify({
      percentile,
      category,
      selectedBranches,
      selectedCities,
      results,
      hasSearched
    }))
  }, [percentile, category, selectedBranches, selectedCities, results, hasSearched])

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!percentile) return

    setLoading(true)
    setHasSearched(true)
    
    try {
      const params = new URLSearchParams({
        percentile,
      })
      if (category) params.append('category', category)
      
      selectedBranches.forEach(b => params.append('branches', b))
      selectedCities.forEach(c => params.append('cities', c))

      const response = await fetch(`/api/predict?${params.toString()}`)
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBranch = (branch: string) => {
    setSelectedBranches(prev => 
      prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]
    )
  }

  const toggleCity = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-white/5 pb-8">
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Find Your College
          </CardTitle>
          <CardDescription className="text-zinc-400 text-lg">
            Enter your details to get data-driven admission predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handlePredict} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Diploma Percentile</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  max="100"
                  min="0"
                  placeholder="e.g. 89.5" 
                  value={percentile}
                  onChange={(e) => setPercentile(e.target.value)}
                  className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Category</label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value ?? "")}
                >
                  <SelectTrigger className="bg-zinc-900/50 border-white/10 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    {options.categories.map((c: string) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                    {options.categories.length === 0 && <SelectItem value="GOPEN">GOPEN</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Preferred Branches (Optional)
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-white/10 rounded-md bg-zinc-900/30 custom-scrollbar">
                {options.branches.map((branch: string) => (
                  <Badge 
                    key={branch}
                    variant={selectedBranches.includes(branch) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${selectedBranches.includes(branch) ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-white/10 border-white/10'}`}
                    onClick={() => toggleBranch(branch)}
                  >
                    {branch}
                  </Badge>
                ))}
                {options.branches.length === 0 && <span className="text-xs text-zinc-500 italic px-2">Data not loaded yet</span>}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Preferred Cities (Optional)
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-white/10 rounded-md bg-zinc-900/30 custom-scrollbar">
                {options.cities.map((city: string) => (
                  <Badge 
                    key={city}
                    variant={selectedCities.includes(city) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${selectedCities.includes(city) ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-white/10 border-white/10'}`}
                    onClick={() => toggleCity(city)}
                  >
                    {city}
                  </Badge>
                ))}
                {options.cities.length === 0 && <span className="text-xs text-zinc-500 italic px-2">Data not loaded yet</span>}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)]"
              disabled={loading}
            >
              {loading ? 'Analyzing Historical Data...' : 'Predict Admission Chances'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Prediction Results</h2>
            <Badge variant="outline" className="bg-zinc-900 border-white/10">
              {results.length} Colleges Found
            </Badge>
          </div>

          {results.length === 0 ? (
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm text-center py-12">
              <p className="text-zinc-400">No colleges found within ±5% of your percentile.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={result.id}
                >
                  <Link href={`/college/${encodeURIComponent(result.college_name)}`}>
                    <Card className="h-full border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group hover:border-purple-500/50 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1 h-full ${
                        result.status === 'Very Likely' ? 'bg-emerald-500' :
                        result.status === 'Possible' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      <CardContent className="p-5 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-purple-400 transition-colors">
                              {result.college_name}
                            </h3>
                            <p className="text-zinc-400 text-sm flex items-center gap-1 mt-1">
                              <Building2 className="w-3 h-3" /> {result.course_name}
                            </p>
                          </div>
                          <Badge className={`${
                            result.status === 'Very Likely' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            result.status === 'Possible' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          } border whitespace-nowrap`}>
                            {result.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                          <div>
                            <p className="text-zinc-500 text-xs mb-1">CAP1 2025</p>
                            <p className="font-mono">{result.data2025?.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-zinc-500 text-xs mb-1">Margin</p>
                            <p className={`font-mono ${result.margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {result.margin > 0 ? '+' : ''}{result.margin.toFixed(2)}%
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 text-xs text-zinc-500">
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                            <MapPin className="w-3 h-3" /> {result.city || 'Unknown'}
                          </span>
                          <span className="bg-white/5 px-2 py-1 rounded">{result.category}</span>
                          {result.autonomous && <span className="bg-white/5 px-2 py-1 rounded text-purple-400">Autonomous</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
