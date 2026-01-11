import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function getLinks(filters?: {
  search?: string;
  domain?: string;
  domains?: string[];
  startDate?: string;
  endDate?: string;
  minClicks?: number;
  maxClicks?: number;
  hasTitle?: boolean;
  searchKeywords?: string[];
  limit?: number;
  offset?: number;
}) {
  const { 
    search, 
    domain, 
    domains,
    startDate, 
    endDate, 
    minClicks,
    maxClicks,
    hasTitle,
    searchKeywords,
    limit = 50, 
    offset = 0 
  } = filters || {};
  
  let whereClause = '';
  const params: any[] = [];
  let paramCount = 1;
  
  const conditions: string[] = [];
  
  if (search) {
    conditions.push(`(title ILIKE $${paramCount} OR original_url ILIKE $${paramCount} OR path ILIKE $${paramCount})`);
    params.push(`%${search}%`);
    paramCount++;
  }
  
  if (domain) {
    conditions.push(`domain = $${paramCount}`);
    params.push(domain);
    paramCount++;
  }
  
  if (domains && domains.length > 0) {
    conditions.push(`domain = ANY($${paramCount})`);
    params.push(domains);
    paramCount++;
  }
  
  if (startDate) {
    conditions.push(`created_at >= $${paramCount}`);
    params.push(startDate);
    paramCount++;
  }
  
  if (endDate) {
    conditions.push(`created_at <= $${paramCount}`);
    params.push(endDate);
    paramCount++;
  }
  
  if (minClicks !== undefined) {
    conditions.push(`clicks >= $${paramCount}`);
    params.push(minClicks);
    paramCount++;
  }
  
  if (maxClicks !== undefined) {
    conditions.push(`clicks <= $${paramCount}`);
    params.push(maxClicks);
    paramCount++;
  }
  
  if (hasTitle !== undefined) {
    if (hasTitle) {
      conditions.push(`title IS NOT NULL AND title != ''`);
    } else {
      conditions.push(`(title IS NULL OR title = '')`);
    }
  }
  
  if (searchKeywords && searchKeywords.length > 0) {
    const keywordConditions = searchKeywords.map(keyword => {
      const condition = `(title ILIKE $${paramCount} OR original_url ILIKE $${paramCount})`;
      params.push(`%${keyword}%`);
      paramCount++;
      return condition;
    });
    conditions.push(`(${keywordConditions.join(' OR ')})`);
  }
  
  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }
  
  const countQuery = `SELECT COUNT(*) FROM short_links ${whereClause}`;
  const countResult = await query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);
  
  const linksQuery = `
    SELECT 
      id,
      short_io_id,
      short_url,
      original_url,
      path,
      title,
      domain,
      clicks,
      created_at,
      updated_at,
      synced_at
    FROM short_links
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;
  
  params.push(limit, offset);
  const linksResult = await query(linksQuery, params);
  
  return {
    links: linksResult.rows,
    total,
    limit,
    offset
  };
}

export async function getStats() {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_links,
      SUM(clicks) as total_clicks,
      COUNT(DISTINCT domain) as total_domains
    FROM short_links
  `;
  
  const result = await query(statsQuery);
  return result.rows[0];
}

export async function getDomains() {
  const domainsQuery = `
    SELECT 
      domain,
      COUNT(*) as link_count
    FROM short_links
    GROUP BY domain
    ORDER BY link_count DESC
  `;
  
  const result = await query(domainsQuery);
  return result.rows;
}

export async function updateLink(id: number, data: { title?: string; original_url?: string }) {
  const updates: string[] = [];
  const params: any[] = [];
  let paramCount = 1;
  
  if (data.title !== undefined) {
    updates.push(`title = $${paramCount}`);
    params.push(data.title);
    paramCount++;
  }
  
  if (data.original_url !== undefined) {
    updates.push(`original_url = $${paramCount}`);
    params.push(data.original_url);
    paramCount++;
  }
  
  updates.push(`updated_at = NOW()`);
  
  params.push(id);
  
  const updateQuery = `
    UPDATE short_links
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await query(updateQuery, params);
  return result.rows[0];
}

export async function bulkDeleteLinks(ids: number[]) {
  const deleteQuery = `
    DELETE FROM short_links
    WHERE id = ANY($1)
    RETURNING *
  `;
  
  const result = await query(deleteQuery, [ids]);
  return result.rows;
}

export async function exportLinksToCSV(filters?: {
  search?: string;
  domain?: string;
  startDate?: string;
  endDate?: string;
  minClicks?: number;
  maxClicks?: number;
  hasTitle?: boolean;
}) {
  const result = await getLinks({
    ...filters,
    limit: 999999,
    offset: 0
  });
  
  return result.links;
}
