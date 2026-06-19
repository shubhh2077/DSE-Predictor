import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// List of cities to check against college names
const CITIES = [
  'Pune', 'Mumbai', 'Navi Mumbai', 'Nagpur', 'Nashik', 'Aurangabad', 
  'Amravati', 'Nanded', 'Pimpri', 'Chinchwad', 'Kolhapur', 'Solapur', 
  'Jalgaon', 'Ahmednagar', 'Dhule', 'Sangli', 'Satara', 'Thane', 'Karad',
  'Ratnagiri', 'Jalna', 'Latur', 'Chandrapur', 'Wardha', 'Gondia', 'Yavatmal'
]

async function importCSV(filePath: string, year: number) {
  console.log(`Importing ${filePath} for year ${year}...`)
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`)
    return
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  // Using csv-parse to handle quotes correctly
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true
  })

  console.log(`Found ${records.length} records. Processing...`)

  const batchSize = 1000
  let inserted = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    
    const dataToInsert = batch.map((row: any) => {
      const collegeName = row.college_name || ''
      
      // Infer city
      let city = null
      for (const c of CITIES) {
        if (collegeName.toLowerCase().includes(c.toLowerCase())) {
          city = c
          break
        }
      }

      // Infer type and autonomous
      const isAutonomous = collegeName.toLowerCase().includes('autonomous')
      let type = 'Private'
      if (collegeName.toLowerCase().includes('government')) type = 'Government'
      else if (collegeName.toLowerCase().includes('university')) type = 'University'

      return {
        year,
        college_name: collegeName,
        choice_code: row.choice_code || '',
        course_name: row.course_name || '',
        category: row.category || '',
        rank: parseInt(row.rank) || 0,
        percentile: parseFloat(row.percentile) || 0,
        city,
        type,
        autonomous: isAutonomous
      }
    }).filter((r: any) => r.college_name && r.category && !isNaN(r.percentile))

    await prisma.college.createMany({
      data: dataToInsert
    })
    
    inserted += dataToInsert.length
    console.log(`Inserted ${inserted}/${records.length}...`)
  }
}

async function main() {
  await prisma.college.deleteMany({}) // clear old data
  
  const basePath = path.join(process.cwd(), 'Cutoff_CSVs')
  await importCSV(path.join(basePath, 'dse_cap1_cutoffs_2024.csv'), 2024)
  await importCSV(path.join(basePath, 'dse_cap1_cutoffs_2025.csv'), 2025)
  
  console.log('Done importing!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
