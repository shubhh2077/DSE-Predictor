import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    
    const header = rows[0].map(col => col.trim().toLowerCase());
    
    // Validate required columns
    const requiredColumns = ['year', 'college_name', 'choice_code', 'course_name', 'category', 'rank', 'percentile'];
    for (const col of requiredColumns) {
      if (!header.includes(col)) {
        return NextResponse.json({ error: `Missing required column: ${col}` }, { status: 400 });
      }
    }

    // Process rows
    const dataToInsert = [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].length < requiredColumns.length || !rows[i][0]) continue;
      
      const row: Record<string, any> = {};
      header.forEach((col, index) => {
        row[col] = rows[i][index]?.trim() || null;
      });

      dataToInsert.push({
        year: parseInt(row.year),
        college_name: row.college_name,
        choice_code: row.choice_code,
        course_name: row.course_name,
        category: row.category,
        rank: parseInt(row.rank),
        percentile: parseFloat(row.percentile),
        city: row.city || null,
        type: row.type || null,
        autonomous: row.autonomous?.toLowerCase() === 'true' || row.autonomous === '1'
      });
    }

    // Insert data
    const result = await prisma.college.createMany({
      data: dataToInsert,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${result.count} records.` 
    });

  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
