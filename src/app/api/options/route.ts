import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_CATEGORIES = [
  'GOPEN', 'LOPEN', 'OBC', 'SC', 'ST', 'VJ/DT', 'NT-A', 'NT-B', 'NT-C', 'NT-D', 'SBC', 'EWS', 'TFWS', 'PWD', 'DEF', 'ORPHAN'
];

const DEFAULT_BRANCHES = [
  'Computer Engineering',
  'Information Technology',
  'Artificial Intelligence and Data Science',
  'Artificial Intelligence and Machine Learning',
  'Electronics and Telecommunication Engg',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Automation and Robotics',
  'Chemical Engineering',
  'Instrumentation Engineering'
];

const DEFAULT_CITIES = [
  'Pune', 'Pimpri-Chinchwad', 'Mumbai', 'Navi Mumbai', 'Thane', 
  'Nagpur', 'Nashik', 'Aurangabad', 'Amravati', 'Nanded', 
  'Kolhapur', 'Solapur', 'Jalgaon', 'Ahmednagar', 'Dhule', 'Sangli', 'Satara'
];

export async function GET() {
  try {
    // Get unique categories, branches, cities from DB
    const dbCategories = await prisma.college.findMany({
      select: { category: true },
      distinct: ['category']
    });

    const dbBranches = await prisma.college.findMany({
      select: { course_name: true },
      distinct: ['course_name']
    });

    const dbCities = await prisma.college.findMany({
      select: { city: true },
      where: { city: { not: null } },
      distinct: ['city']
    });

    // Merge DB results with defaults and deduplicate
    const categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...dbCategories.map(c => c.category)]));
    const branches = Array.from(new Set([...DEFAULT_BRANCHES, ...dbBranches.map(c => c.course_name)]));
    const cities = Array.from(new Set([...DEFAULT_CITIES, ...dbCities.map(c => c.city).filter(Boolean)]));

    // Sort alphabetically
    categories.sort();
    branches.sort();
    cities.sort();

    return NextResponse.json({
      categories,
      branches,
      cities
    });
  } catch (error) {
    console.error('Options API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}