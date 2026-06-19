const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const data = await prisma.college.findMany();
  fs.writeFileSync(
    'college_full.json',
    JSON.stringify(data, null, 2)
  );
  console.log(`Exported ${data.length} rows`);
}

main()
  .finally(() => prisma.$disconnect());