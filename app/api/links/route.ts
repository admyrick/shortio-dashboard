import { NextRequest, NextResponse } from 'next/server';
import { getLinks, getStats, getDomains, updateLink, bulkDeleteLinks, exportLinksToCSV } from '@/lib/db';

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
    
    if (action === 'export') {
      const search = searchParams.get('search') || undefined;
      const domain = searchParams.get('domain') || undefined;
      const startDate = searchParams.get('startDate') || undefined;
      const endDate = searchParams.get('endDate') || undefined;
      const minClicks = searchParams.get('minClicks') ? parseInt(searchParams.get('minClicks')!) : undefined;
      const maxClicks = searchParams.get('maxClicks') ? parseInt(searchParams.get('maxClicks')!) : undefined;
      const hasTitle = searchParams.get('hasTitle') ? searchParams.get('hasTitle') === 'true' : undefined;
      
      const links = await exportLinksToCSV({ 
        search, 
        domain, 
        startDate, 
        endDate,
        minClicks,
        maxClicks,
        hasTitle
      });
      
      const headers = ['Short URL', 'Original URL', 'Title', 'Domain', 'Path', 'Clicks', 'Created At', 'Updated At'];
      const csvRows = [
        headers.join(','),
        ...links.map(link => [
          link.short_url,
          link.original_url,
          `"${(link.title || '').replace(/"/g, '""')}"`,
          link.domain,
          link.path,
          link.clicks,
          new Date(link.created_at).toISOString(),
          new Date(link.updated_at).toISOString()
        ].join(','))
      ];
      
      const csv = csvRows.join('\n');
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="shortio-links-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    const search = searchParams.get('search') || undefined;
    const domain = searchParams.get('domain') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const minClicks = searchParams.get('minClicks') ? parseInt(searchParams.get('minClicks')!) : undefined;
    const maxClicks = searchParams.get('maxClicks') ? parseInt(searchParams.get('maxClicks')!) : undefined;
    const hasTitle = searchParams.get('hasTitle') ? searchParams.get('hasTitle') === 'true' : undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const result = await getLinks({ 
      search, 
      domain, 
      startDate, 
      endDate, 
      minClicks,
      maxClicks,
      hasTitle,
      limit, 
      offset 
    });
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// ... rest of PATCH and DELETE handlers remain the same
