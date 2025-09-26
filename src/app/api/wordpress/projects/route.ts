import { NextRequest, NextResponse } from 'next/server'
import { wpApi } from '@/lib/wordpress'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const params = {
    per_page: parseInt(searchParams.get('per_page') || '10'),
    page: parseInt(searchParams.get('page') || '1'),
    orderby: searchParams.get('orderby') || 'date',
    order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
  }

  try {
    const projects = await wpApi.getProjects(params)
    return NextResponse.json({ 
      success: true, 
      data: projects,
      count: projects.length 
    })
  } catch (error) {
    console.error('WordPress API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch projects',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
