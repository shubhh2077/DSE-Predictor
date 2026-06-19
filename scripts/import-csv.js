const { PrismaClient } = require('@prisma/client');
const csv = require('csv-parser');
const fs = require('fs');

const prisma = new PrismaClient();

async function importCSV(file, year) {
  const rows = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (row) => {
        rows.push({
          year,
          college_name: row.college_name,
          choice_code: String(row.choice_code),
          course_name: row.course_name,
          category: row.category,
          rank: parseInt(row.rank),
          percentile: parseFloat(row.percentile),
        });
      })
      .on('end', async () => {
        try {
          await prisma.college.createMany({
            data: rows,
          });

          console.log(`${file}: ${rows.length} rows imported`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
  });
}

async function main() {
  await importCSV('./Cutoff_CSVs/dse_cap1_cutoffs_2024.csv', 2024);
  await importCSV('./Cutoff_CSVs/dse_cap1_cutoffs_2025.csv', 2025);

  const count = await prisma.college.count();
  console.log(`Total rows in DB: ${count}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });