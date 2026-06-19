const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log("Starting...");

  const data = JSON.parse(fs.readFileSync('college_full.json', 'utf8'));

  console.log("Rows:", data.length);

  const result = await prisma.college.createMany({
    data: data.map(row => ({
      year: row.year,
      college_name: row.college_name,
      choice_code: row.choice_code,
      course_name: row.course_name,
      category: row.category,
      rank: row.rank,
      percentile: row.percentile,
      city: row.city,
      type: row.type,
      autonomous: row.autonomous
    }))
  });

  console.log(result);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });