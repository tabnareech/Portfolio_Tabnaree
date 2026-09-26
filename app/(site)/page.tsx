import Link from 'next/link'
import { getProfile, getHomeStats, getNewsList } from '@/lib/queries'
import { imageUrl, IMG } from '@/lib/media'
import CountUp from '@/components/CountUp'

export const metadata = { title: 'หน้าแรก' }

export default async function HomePage() {
  const [profile, stats, newsList] = await Promise.all([
    getProfile(),
    getHomeStats(),
    getNewsList(4, 0),
  ])

  // แยกชื่อ-นามสกุล
  const nameParts = (profile?.full_name ?? '').trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ')

  return (
    <main>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden grad-hero text-white">
        <div className="absolute inset-0 dots opacity-[.12]" />
        <div className="blob blob-2 w-[360px] h-[360px] -right-24 -top-16 !opacity-25" />

        <div className="relative max-w-[1240px] mx-auto px-4 md:px-10 pt-8 md:pt-12 pb-10 md:pb-14
                        grid lg:grid-cols-[1.15fr_.85fr] gap-8 lg:gap-12 items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="chip bg-white/10 text-white border border-white/25">
                {profile?.affiliation}
              </span>
              <span className="chip chip-grad">{profile?.position}</span>
            </div>

            <p className="mt-5 text-[13.5px] text-white/80">แฟ้มสะสมผลงานอิเล็กทรอนิกส์ (e-Portfolio)</p>
            <h1 className="hero-title mt-4 md:mt-5 font-extrabold leading-[1.3] tracking-tight">
              {firstName} <span className="text-[color:var(--gold)]">{lastName}</span>
            </h1>

            <div className="mt-5 flex flex-col gap-1">
              <p className="hero-sub font-bold text-[color:var(--gold-line)]">
                {profile?.position} {profile?.academic_standing}
              </p>
              <p className="text-[13.5px] md:text-[14px] text-white/70">{profile?.department}</p>
            </div>

            {profile?.motto && (
              <p className="mt-4 inline-flex items-center gap-2.5 border-l-[3px] border-[color:var(--gold)] pl-3.5 py-1 italic text-[14px] text-white/90">
                “{profile.motto}”
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href="/development" className="btn btn-gold">ดูผลงานทั้งหมด →</Link>
            </div>

            {/* สถิติหน้าแรก */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                [stats.total_works, 'ผลงาน / รางวัล'],
                [stats.total_news, 'ข่าวประชาสัมพันธ์'],
                [stats.works_by_level.get('national') ?? 0, 'ระดับประเทศ'],
              ].map(([num, label]) => (
                <div key={label} className="rounded-xl bg-white/10 border border-white/20 px-3.5 py-3">
                  <div className="text-[22px] md:text-[24px] font-bold leading-none text-[color:var(--gold)]">
                    <CountUp to={num} />
                  </div>
                  <div className="text-[11px] text-white/75 mt-1.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* รูปโปรไฟล์ */}
          <div className="relative min-w-0 flex justify-center lg:justify-end order-first lg:order-none mt-2 lg:mt-0">
            <div className="relative w-full max-w-[320px]">
              <div className="relative rounded-2xl p-[3px] bg-[color:var(--gold)] shadow-lg">
                <div className="rounded-[13px] overflow-hidden aspect-[4/5] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl({ source: profile?.avatar_source ?? null, ref: profile?.avatar_ref ?? null }, IMG.avatar)}
                    alt={`รูปโปรไฟล์ ${profile?.full_name ?? ''}`}
                    className="w-full h-full object-cover object-top" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ข่าวประชาสัมพันธ์ล่าสุด ================= */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-10 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
          <div>
            <span className="chip chip-primary">อัปเดตกิจกรรม</span>
            <h2 className="mt-3 text-[26px] md:text-[34px] font-extrabold leading-tight">ข่าวประชาสัมพันธ์<span className="grad-text">ล่าสุด</span></h2>
          </div>
        </div>

        {newsList.length === 0 ? (
          <p className="text-ink-muted">ยังไม่มีข่าวประชาสัมพันธ์ในระบบ</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newsList.map((news) => (
              <div key={news.id} className="card rounded-2xl overflow-hidden flex flex-col">
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-xs text-primary font-semibold mb-2">{news.activity_type || 'ทั่วไป'}</div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{news.title}</h3>
                  <p className="text-ink-muted text-sm line-clamp-3 mb-4 flex-1">{news.excerpt}</p>
                  <div className="text-xs text-ink-muted pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span>{news.event_date || news.created_at.slice(0, 10)}</span>
                    <span className="font-medium text-primary">อ่านเพิ่มเติม →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
