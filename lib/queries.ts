import { cache } from 'react'
import { all, one, scalar } from './db'
import type { Profile, Education, CareerPath, OnePageReport, ReportKind } from './types'

/* ---------------- โปรไฟล์ / ประวัติ ---------------- */

export const getProfile = cache(async (): Promise<Profile | null> => {
  try { return await one<Profile>('SELECT * FROM profile WHERE id = 1') }
  catch { return null }
})

export const getEducations = () =>
  all<Education>('SELECT * FROM educations WHERE deleted_at IS NULL ORDER BY sort_order, year_be DESC')

export const getCareerPaths = () =>
  all<CareerPath>('SELECT * FROM career_paths WHERE deleted_at IS NULL ORDER BY sort_order')

export const getSetting = cache(async (key: string): Promise<string | null> => {
  try { return await scalar<string>('SELECT value FROM site_settings WHERE key = ?', [key]) }
  catch { return null }
})

/* ---------------- อ้างอิง: ระดับ, คุณลักษณะ, ประเภทงาน ---------------- */

export const getLevels = cache(() =>
  all<{ code: string; name_th: string; short_name: string; icon: string; color: string }>(
    'SELECT * FROM levels ORDER BY sort_order'
  ))

export const getAttributes = cache(() =>
  all<{ code: string; name_th: string; short_name: string; icon: string; color: string }>(
    'SELECT * FROM attributes ORDER BY sort_order'
  ))

export const getWorkTypes = cache(() =>
  all<{ id: number; slug: string; name: string }>(
    'SELECT * FROM work_types ORDER BY sort_order, id'
  ))

/* ---------------- ผลงาน / รางวัล (Works) ---------------- */

export interface Work {
  id: number
  slug: string
  title: string
  summary: string
  content: string | null
  level_code: string
  level_name?: string
  level_icon?: string
  awarded_by: string
  awarded_person: string
  cert_no: string
  role: string
  work_date: string | null
  year_be: number | null
  location: string
  cover_source: 'drive' | 'static' | null
  cover_ref: string | null
  video_url: string
  link_url: string
  link_label: string
  view_count: number
  is_featured: number
  status: 'draft' | 'published'
  created_at: string
}

const WORK_BASE_SQL = `
  SELECT w.*, 
         l.name_th AS level_name, 
         l.icon AS level_icon,
         l.color AS level_color,
         (SELECT group_concat(a.code) FROM work_attributes wa JOIN attributes a ON a.code = wa.attribute_code WHERE wa.work_id = w.id) AS attr_codes,
         (SELECT group_concat(a.name_th) FROM work_attributes wa JOIN attributes a ON a.code = wa.attribute_code WHERE wa.work_id = w.id) AS attr_names,
         (SELECT group_concat(t.name) FROM work_type_links wtl JOIN work_types t ON t.id = wtl.work_type_id WHERE wtl.work_id = w.id) AS type_names
  FROM works w
  JOIN levels l ON l.code = w.level_code
`

export interface WorkFilter {
  level?: string
  attr?: string | string[]
  type?: string
  year?: number
  q?: string
  featuredOnly?: boolean
  limit?: number
  offset?: number
}

export async function getWorks(f: WorkFilter = {}): Promise<Work[]> {
  const where: string[] = ["w.deleted_at IS NULL", "w.status = 'published'"]
  const args: (string | number)[] = []

  if (f.level) { where.push('w.level_code = ?'); args.push(f.level) }
  if (f.year) { where.push('w.year_be = ?'); args.push(f.year) }
  if (f.featuredOnly) { where.push('w.is_featured = 1') }
  
  if (f.q) {
    where.push('(w.title LIKE ? OR w.summary LIKE ? OR w.awarded_by LIKE ?)')
    const like = `%${f.q}%`; args.push(like, like, like)
  }

  if (f.type) {
    where.push(`EXISTS (SELECT 1 FROM work_type_links wtl JOIN work_types t ON t.id = wtl.work_type_id WHERE wtl.work_id = w.id AND t.slug = ?)`)
    args.push(f.type)
  }

  const attrs = Array.isArray(f.attr) ? f.attr : f.attr ? [f.attr] : []
  for (const attrCode of attrs) {
    where.push(`EXISTS (SELECT 1 FROM work_attributes wa WHERE wa.work_id = w.id AND wa.attribute_code = ?)`)
    args.push(attrCode)
  }

  let sql = `${WORK_BASE_SQL} WHERE ${where.join(' AND ')} ORDER BY l.sort_order ASC, w.work_date DESC, w.id DESC`
  if (f.limit) { sql += ' LIMIT ?'; args.push(f.limit) }
  if (f.offset) { sql += ' OFFSET ?'; args.push(f.offset) }

  return all<Work>(sql, args)
}

export const getWorkBySlug = (slug: string) =>
  one<Work>(`${WORK_BASE_SQL} WHERE w.slug = ? AND w.deleted_at IS NULL`, [slug])

export const getWorkImages = (workId: number) =>
  all<{ id: number; source: string; ref: string; caption: string; sort_order: number }>(
    'SELECT * FROM work_images WHERE work_id = ? ORDER BY sort_order, id', [workId]
  )

export const getWorkFiles = (workId: number) =>
  all<{ id: number; source: string; ref: string; original_name: string; mime_type: string; size_bytes: number }>(
    'SELECT * FROM work_files WHERE work_id = ? ORDER BY sort_order, id', [workId]
  )

export const getWorkYears = async () =>
  (await all<{ y: number }>(
    `SELECT DISTINCT year_be AS y FROM works WHERE deleted_at IS NULL AND status = 'published' AND year_be IS NOT NULL ORDER BY y DESC`
  )).map((r) => Number(r.y))


/* ---------------- ข่าวประชาสัมพันธ์ (News) ---------------- */

export interface NewsItem {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string | null
  activity_type: string
  event_date: string | null
  year_be: number | null
  location: string
  cover_source: 'drive' | 'static' | null
  cover_ref: string | null
  view_count: number
  is_pinned: number
  status: 'draft' | 'published'
  created_at: string
}

export async function getNewsList(limit = 10, offset = 0) {
  return all<NewsItem>(
    `SELECT n.*, 
            (SELECT group_concat(a.name_th) FROM news_attributes na JOIN attributes a ON a.code = na.attribute_code WHERE na.news_id = n.id) AS attr_names
     FROM news n 
     WHERE n.deleted_at IS NULL AND n.status = 'published' 
     ORDER BY n.is_pinned DESC, n.event_date DESC, n.id DESC 
     LIMIT ? OFFSET ?`, [limit, offset]
  )
}

export const getNewsBySlug = (slug: string) =>
  one<NewsItem>('SELECT * FROM news WHERE slug = ? AND deleted_at IS NULL', [slug])

export const getNewsImages = (newsId: number) =>
  all<{ id: number; source: string; ref: string; caption: string }>(
    'SELECT * FROM news_images WHERE news_id = ? ORDER BY sort_order, id', [newsId]
  )


/* ---------------- สถิติหน้าแรก (Home Stats) ---------------- */

export const getHomeStats = cache(async () => {
  const [levelCounts, attrCounts, totals] = await Promise.all([
    all<{ code: string; total: number }>(`
      SELECT l.code, COUNT(w.id) AS total 
      FROM levels l 
      LEFT JOIN works w ON w.level_code = l.code AND w.status = 'published' AND w.deleted_at IS NULL
      GROUP BY l.code
    `),
    all<{ code: string; total: number }>(`
      SELECT a.code, COUNT(wa.work_id) AS total 
      FROM attributes a 
      LEFT JOIN work_attributes wa ON wa.attribute_code = a.code
      LEFT JOIN works w ON w.id = wa.work_id AND w.status = 'published' AND w.deleted_at IS NULL
      GROUP BY a.code
    `),
    one<{ works: number; news: number }>(`
      SELECT 
        (SELECT COUNT(*) FROM works WHERE deleted_at IS NULL AND status='published') AS works,
        (SELECT COUNT(*) FROM news WHERE deleted_at IS NULL AND status='published') AS news
    `)
  ])

  return {
    total_works: Number(totals?.works ?? 0),
    total_news: Number(totals?.news ?? 0),
    works_by_level: new Map(levelCounts.map(r => [r.code, Number(r.total)])),
    works_by_attr: new Map(attrCounts.map(r => [r.code, Number(r.total)]))
  }
})
