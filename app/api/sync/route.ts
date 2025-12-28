import { NextResponse } from 'next/server';
import { fetchAllLinks, syncLinksToDatabase } from '@/lib/shortio';

export async function POST() {
  try {
    console.log('Starting sync...');
    const links = await fetchAllLinks();
    console.log(`Fetched ${links.length} links from Short.io`);
    
    const synced = await syncLinksToDatabase(links);
    console.log(`Synced ${synced} links to database`);
    
    return NextResponse.json({
      success: true,
      synced,
      message: `Successfully synced ${synced} links`
    });
    
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync links', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
