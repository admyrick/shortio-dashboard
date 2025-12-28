const SHORT_IO_API_KEY = process.env.SHORT_IO_API_KEY!;
const DOMAIN_ID = process.env.SHORT_IO_DOMAIN_ID!;

export async function fetchAllLinks() {
  const allLinks: any[] = [];
  let pageToken: string | null = null;
  
  while (true) {
    let url = `https://api.short.io/api/links?domain_id=${DOMAIN_ID}&limit=150`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'Authorization': SHORT_IO_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Short.io API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const links = data.links || [];
    
    allLinks.push(...links);
    console.log(`Fetched ${links.length} links. Total: ${allLinks.length}`);
    
    pageToken = data.pageToken;
    if (!pageToken) break;
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return allLinks;
}

export async function syncLinksToDatabase(links: any[]) {
  const { query } = await import('./db');
  
  for (const link of links) {
    await query(`
      INSERT INTO short_links (
        short_io_id, short_url, original_url, path, title, domain,
        clicks, created_at, updated_at, expires_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (short_io_id) 
      DO UPDATE SET
        short_url = EXCLUDED.short_url,
        original_url = EXCLUDED.original_url,
        title = EXCLUDED.title,
        clicks = EXCLUDED.clicks,
        updated_at = EXCLUDED.updated_at,
        synced_at = NOW()
    `, [
      link.id,
      link.shortURL,
      link.originalURL,
      link.path,
      link.title,
      link.domain,
      link.clicks || 0,
      link.createdAt,
      link.updatedAt,
      link.expiresAt,
      JSON.stringify(link)
    ]);
  }
  
  return links.length;
}