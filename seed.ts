import { prisma } from '@/lib/prisma'

async function seed() {
  await prisma.college.createMany({
    data: [
      {
        year: 2024,
        college_name: 'PCCOE Ravet',
        choice_code: '100224210',
        course_name: 'Artificial Intelligence and Machine Learning',
        category: 'GOPEN',
        rank: 647,
        percentile: 89.1,
        city: 'Pune',
        type: 'Private',
        autonomous: true
      },
      {
        year: 2025,
        college_name: 'PCCOE Ravet',
        choice_code: '100224210',
        course_name: 'Artificial Intelligence and Machine Learning',
        category: 'GOPEN',
        rank: 630,
        percentile: 89.3,
        city: 'Pune',
        type: 'Private',
        autonomous: true
      },
      {
        year: 2024,
        college_name: 'COEP Pune',
        choice_code: '100114210',
        course_name: 'Computer Engineering',
        category: 'GOPEN',
        rank: 120,
        percentile: 98.5,
        city: 'Pune',
        type: 'Government',
        autonomous: true
      },
      {
        year: 2025,
        college_name: 'COEP Pune',
        choice_code: '100114210',
        course_name: 'Computer Engineering',
        category: 'GOPEN',
        rank: 110,
        percentile: 99.1,
        city: 'Pune',
        type: 'Government',
        autonomous: true
      }
    ]
  })
  console.log('Dummy data seeded!')
}

seed().catch(console.error)