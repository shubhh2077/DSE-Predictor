import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const percentileStr = searchParams.get('percentile');
    const category = searchParams.get('category');
    const branches = searchParams.getAll('branches');
    const cities = searchParams.getAll('cities');

    if (!percentileStr) {
      return NextResponse.json({ error: 'Percentile is required' }, { status: 400 });
    }

    const percentile = parseFloat(percentileStr);
    
    // Prediction logic window: User Percentile ± 5
    const minPercentile = percentile - 5;
    const maxPercentile = percentile + 5;

    // Base query conditions
    const where: any = {};

    // Get 2025 actual data within the percentile range first
    const data2025 = await prisma.college.findMany({
      where: {
        year: 2025,
        category: category || undefined,
        ...(branches.length > 0 ? { course_name: { in: branches } } : {}),
        ...(cities.length > 0 ? { city: { in: cities } } : {}),
        percentile: {
          gte: minPercentile,
          lte: maxPercentile
        }
      }
    });

    if (data2025.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Now get the matching 2024 data for comparison
    const matchConditions = data2025.map(d => ({
      college_name: d.college_name,
      course_name: d.course_name,
      category: d.category
    }));

    const data2024 = await prisma.college.findMany({
      where: {
        year: 2024,
        OR: matchConditions
      }
    });

    // Group by college and branch to consolidate years
    const groupedResults = new Map();

    // Process 2025 data (our baseline for prediction)
    for (const row of data2025) {
      const key = `${row.college_name}-${row.course_name}-${row.category}`;
      groupedResults.set(key, {
        id: row.id,
        college_name: row.college_name,
        course_name: row.course_name,
        city: row.city,
        category: row.category,
        data2024: null,
        data2025: row.percentile,
        type: row.type,
        autonomous: row.autonomous
      });
    }

    // Add 2024 comparison data
    for (const row of data2024) {
      const key = `${row.college_name}-${row.course_name}-${row.category}`;
      if (groupedResults.has(key)) {
        groupedResults.get(key).data2024 = row.percentile;
      }
    }

    // Process and score the results
    const results = Array.from(groupedResults.values())
      .filter(entry => entry.data2025 !== null) // Must have latest data to predict
      .map(entry => {
        const targetPercentile = entry.data2025 as number;
        const margin = percentile - targetPercentile;
        
        // Determine prediction status
        let status = 'Borderline';
        if (margin >= 0) status = 'Very Likely';
        else if (margin >= -2) status = 'Possible';

        // Filter out everything below -5 (already handled by initial query mostly, but just to be sure)
        if (margin < -5) return null;

        return {
          ...entry,
          margin,
          status
        };
      })
      .filter(entry => entry !== null)
      .sort((a, b) => Math.abs(a!.margin) - Math.abs(b!.margin)); // Sort by closest margin

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Prediction API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
