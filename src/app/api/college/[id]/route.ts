import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    
    const collegeName = decodeURIComponent(id);

    const collegeData = await prisma.college.findMany({
      where: {
        college_name: collegeName
      },
      orderBy: {
        year: 'asc'
      }
    });

    if (!collegeData.length) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    const branches = Array.from(new Set(collegeData.map(c => c.course_name)));
    const categories = Array.from(new Set(collegeData.map(c => c.category)));

    return NextResponse.json({ 
      collegeName,
      data: collegeData,
      branches,
      categories
    });

  } catch (error) {
    console.error('College API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
