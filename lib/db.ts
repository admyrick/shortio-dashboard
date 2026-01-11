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
