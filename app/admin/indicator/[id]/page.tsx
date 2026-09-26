import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import {
  getIndicator, getIndicators, getDomains, getIndicatorNeighbors,
  getAcademicYears,
} from '@/lib/queries'
import { domainTheme, currentAcademicYear } from '@/lib/theme'
import PageHead from '@/components/admin/PageHead'
import { WorkModalProvider, NewWorkButton } from '@/components/admin/WorkModal'
import AdminWorkTable from '@/components/admin/AdminWorkTable'

/** จัดการ “ผลงาน” ของตัวชี้วัด 1 ตัว — แปลงจาก admin/indicator.php */
export default async function IndicatorAdmin({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string; new?: string }>
}) {
  await requireAdmin() // ต้องตรวจในทุกหน้า ไม่ใช่แค่ layout

  const { id: idRaw } = await params
  const sp = await searchParams
  const id = Number(idRaw) || 0

  const ind = await getIndicator(id)
  if (!ind) notFound()

  const dc = Number(ind.domain_code)
  const theme = domainTheme(dc)

  const [indicators, domains, neighbors, years] = await Promise.all([
    getIndicators(),
    getDomains(),
    getIndicatorNeighbors(id),
    getAcademicYears(),
  ])

  const groups = domains.map((d) => ({
    code: Number(d.code),
    name: d.name,
    indicators: indicators
      .filter((i) => Number(i.domain_code) === Number(d.code))
      .map((i) => ({ id: Number(i.id), code: i.code, name: i.name })),
  }))

  const yearList = years.length ? years : [currentAcademicYear()]

  return (
    <WorkModalProvider
      indicatorId={id}
      indicatorLabel={`${ind.code} ${ind.name}`}
      groups={groups}
      openNew={sp.new === '1'}
      openEdit={Number(sp.edit) || undefined}
    >
      <PageHead
        title={`ตัวชี้วัด ${ind.code} · ${ind.name}`}
        sub={`ด้านที่ ${dc} ${ind.domain_name} — จัดการผลงานและหลักฐานของตัวชี้วัดนี้`}
        actions={
          <NewWorkButton className="btn btn-primary text-[12.5px]">
            + เพิ่มผลงานใหม่
          </NewWorkButton>
        }
      />

      {/* แถบนำทางกลับ + ตัวชี้วัดก่อนหน้า/ถัดไป */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <a
          href={`/indicator/${id}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-white btn-sm"
        >
          ดูหน้าเว็บของตัวชี้วัดนี้
        </a>

        <span className="ml-auto flex gap-2">
          {neighbors.prev && (
            <Link
              href={`/admin/indicator/${neighbors.prev.id}`}
              className="btn btn-white btn-sm"
              title={neighbors.prev.name}
            >
              ← {neighbors.prev.code}
            </Link>
          )}
          {neighbors.next && (
            <Link
              href={`/admin/indicator/${neighbors.next.id}`}
              className="btn btn-white btn-sm"
              title={neighbors.next.name}
            >
              {neighbors.next.code} →
            </Link>
          )}
        </span>
      </div>

      {/* หัวตัวชี้วัด */}
      <section
        className="mt-4 relative overflow-hidden rounded-[1.9rem] text-white shadow-lift"
        style={{ background: theme.grad }}
      >
        <div className="absolute inset-0 dots opacity-25 pointer-events-none" />
        <div className="absolute -right-10 -top-14 w-[220px] h-[220px] rounded-full bg-white/15 blur-2xl pointer-events-none" />

        <div className="relative p-5 md:p-7">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip chip-glass !text-[11px]">
                  ด้านที่ {dc} · {ind.domain_name}
                </span>
                <span
                  className="chip bg-white text-[11px] font-extrabold"
                  style={{ color: theme.deep }}
                >
                  {ind.code}
                </span>
              </div>
              <h2 className="mt-2 text-[20px] md:text-[26px] font-extrabold leading-tight">
                {ind.name}
              </h2>
            </div>
          </div>
        </div>
      </section>

      <AdminWorkTable indicatorId={id} years={yearList} />
    </WorkModalProvider>
  )
}
