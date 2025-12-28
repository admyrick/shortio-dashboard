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
      
      const links = await exportLinksToCSV({ search, domain, startDate, endDate });
      
      // Convert to CSV
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const result = await getLinks({ search, domain, startDate, endDate, limit, offset });
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, original_url } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }
    
    const updated = await updateLink(id, { title, original_url });
    return NextResponse.json(updated);
    
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update link' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Link IDs are required' }, { status: 400 });
    }
    
    const deleted = await bulkDeleteLinks(ids);
    return NextResponse.json({ deleted: deleted.length });
    
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete links' },
      { status: 500 }
    );
  }
}
