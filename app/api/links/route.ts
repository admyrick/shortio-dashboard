import { NextRequest, NextResponse } from 'next/server';
import { getLinks, getStats, getDomains } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  try {
    if (action === 'stats') {
      const stats = await getStats();
      return NextResponse.json(stats);
    }
    
    if (action === 'domains') {
      const domains = await getDomains();
      return NextResponse.json(domains);
    }
    
    const search = searchParams.get('search') || undefined;
    const domain = searchParams.get('domain') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const result = await getLinks({ search, domain, limit, offset });
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}