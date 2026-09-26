import Link from 'next/link'
import { getProfile, getEducations, getCareerPaths } from '@/lib/queries'
import { imageUrl, IMG } from '@/lib/media'

export const metadata = { title: 'เกี่ยวกับฉัน' }

/**
 * หน้าประวัติส่วนตัวของคุณ (นักวิชาการศึกษา)
 */
export default async function AboutPage() {
  const [profile, educs, careers] = await Promise.all([
    getProfile(),
    getEducations(),
    getCareerPaths(),
  ])

  /* ช่องทางติดต่อบน hero (chips) */
  const contacts: [string, string, string | null, string][] = []
  if (profile?.email) contacts.push(['📧', profile.email, `mailto:${profile.email}`, 'bg-coral-soft'])
  if (profile?.phone) contacts.push(['📱', profile.phone, `tel:${profile.phone.replace(/\D/g, '')}`, 'bg-mint-soft'])
  if (profile?.facebook) contacts.push(['🌐', profile.facebook, null, 'bg-sky-soft'])
  if (profile?.line_id) contacts.push(['💬', `Line: ${profile.line_id}`, null, 'bg-sunny-soft'])

  const bio = profile?.bio ?? ''
  const bioHtml = bio.includes('<') ? bio : `<p>${bio}</p>`

  // แยกชื่อ-สกุล
  const nameParts = (profile?.full_name ?? '').trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ')

  return (
    <main>
      {/* =============================== HERO โปรไฟล์ =============================== */}
      <section className="relative overflow-hidden mesh">
        <div className="absolute inset-0 blob blob-1 w-[320px] h-[320px] -right-20 -top-10" />
        <div className="absolute inset-0 blob blob-3 w-[220px] h-[220px] -left-16 bottom-0 hidden md:block" />

        <div className="relative max-w-[1240px] mx-auto px-4 md:px-10 pt-10 md:pt-14 pb-12
          grid lg:grid-cols-[380px_1fr] gap-10 lg:gap-14 items-center">

          {/* รูปโปรไฟล์ */}
          <div className="relative min-w-0 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[340px]">
              <div className="absolute -inset-3 rounded-[2.8rem] grad-bg opacity-30 blur-2xl" />
              <div className="relative rounded-[2.6rem] p-[5px] grad-bg shadow-lift">
                <div className="rounded-[2.3rem] overflow-hidden aspect-[4/5] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl({ source: profile?.avatar_source ?? null, ref: profile?.avatar_ref ?? null }, IMG.avatar)}
                    alt={`รูปโปรไฟล์ ${profile?.full_name ?? ''}`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ข้อความ */}
          <div className="min-w-0 text-center lg:text-left">
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              <span className="chip chip-glass">👩‍💻 เกี่ยวกับฉัน</span>
              {profile?.nickname && <span className="chip chip-ink">{profile.nickname}</span>}
            </div>

            <h1 className="mt-5 text-[34px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight">
              {firstName} <span className="grad-text">{lastName}</span>
            </h1>

            <div className="mt-4 flex flex-col gap-1">
              <p className="text-[16px] md:text-[18px] font-semibold text-ink">
                {profile?.position || 'นักวิชาการศึกษา'}
              </p>
              {profile?.affiliation && (
                <p className="text-[14px] md:text-sm text-ink-muted">
                  🏢 {profile.affiliation}
                </p>
              )}
            </div>

            {profile?.motto && (
              <div className="mt-5 inline-flex items-start gap-3 glass rounded-2xl px-5 py-3.5 shadow-soft text-left max-w-[560px]">
                <span className="w-9 h-9 rounded-full grad-bg grid place-items-center text-white text-base shrink-0">💡</span>
                <span>
                  <span className="block text-[11px] font-extrabold text-primary-deep tracking-wide">คติประจำใจ</span>
                  <span className="block italic text-[14px] text-ink-soft font-medium">&ldquo;{profile.motto}&rdquo;</span>
                </span>
              </div>
            )}

            {contacts.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2.5">
                {contacts.map(([ico, label, href, bg]) => {
                  const cls = 'glass rounded-full pl-1.5 pr-4 py-1.5 inline-flex items-center gap-2.5 min-h-[44px] shadow-soft text-[13px]'
                  const inner = (
                    <>
                      <span className={`w-8 h-8 rounded-full ${bg} grid place-items-center text-base shrink-0`}>{ico}</span>
                      <span className="break-all">{label}</span>
                    </>
                  )
                  return href
                    ? <a key={label} href={href} className={cls}>{inner}</a>
                    : <span key={label} className={cls}>{inner}</span>
                })}
              </div>
            )}

            <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3">
              <Link href="/development" className="btn btn-primary text-[15px] px-7 !min-h-[50px]">ดูผลงานทั้งหมด →</Link>
              <Link href="/contact" className="btn btn-white text-[15px] px-6 !min-h-[50px]">📫 ติดต่อ</Link>
            </div>
          </div>

        </div>
      </section>

      {/* =============================== แนะนำตัว =============================== */}
      {bio && (
        <section className="max-w-[1240px] mx-auto px-4 md:px-10 pt-4">
          <div className="card-soft rounded-[2rem] p-6 md:p-9 grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-10">
            <div>
              <span className="chip chip-primary">แนะนำตัว</span>
              <h2 className="mt-3 text-[26px] md:text-[34px] font-extrabold leading-tight">
                รู้จัก <span className="grad-text">{firstName}</span>
              </h2>
              <p className="mt-1 text-[13.5px] text-ink-muted">ประวัติการทำงานและแนวคิดในการปฏิบัติงาน</p>
            </div>
            <div className="rich min-w-0" dangerouslySetInnerHTML={{ __html: bioHtml }} />
          </div>
        </section>
      )}

      {/* =============================== วุฒิการศึกษา + เส้นทางรับราชการ =============================== */}
      {(educs.length > 0 || careers.length > 0) && (
        <section className="max-w-[1240px] mx-auto px-4 md:px-10 pt-14 pb-14">
          <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-6 items-start">

            {educs.length > 0 && (
              <div className="card-soft rounded-[2rem] p-6 md:p-8">
                <span className="chip chip-3">🎓 การศึกษา</span>
                <h2 className="mt-3 text-[26px] md:text-[30px] font-extrabold leading-tight">วุฒิ<span className="grad-text">การศึกษา</span></h2>

                <ol className="mt-6 relative">
                  <span className="absolute left-[9px] top-3 bottom-3 w-0.5 rounded-full"
                    style={{ background: 'linear-gradient(to bottom,var(--primary),var(--primary-2),var(--primary-line))' }} />
                  {educs.map((ed, i) => (
                    <li key={ed.id} className={`relative pl-10 ${i === educs.length - 1 ? '' : 'pb-6'}`}>
                      <span className="absolute left-0 top-1 w-5 h-5 rounded-full grad-bg ring-4 ring-white" />
                      <span className="chip chip-primary !text-[11px]">พ.ศ. {ed.year_th}</span>
                      <p className="text-[15px] font-bold mt-1.5 leading-snug">{ed.degree}</p>
                      <p className="text-[12.5px] text-ink-muted mt-0.5">{ed.institute}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {careers.length > 0 && (
              <div className="card-soft rounded-[2rem] p-6 md:p-8">
                <span className="chip chip-2">🧭 เส้นทาง</span>
                <h2 className="mt-3 text-[26px] md:text-[30px] font-extrabold leading-tight">เส้นทาง<span className="grad-text">การทำงาน</span></h2>

                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  {careers.map((c) => (
                    c.is_current === 1 ? (
                      <div key={c.id} className="relative overflow-hidden rounded-[1.6rem] p-5 text-white grad-bg lift">
                        <div className="absolute inset-0 dots opacity-20" />
                        <div className="absolute -right-3 -top-4 text-[80px] leading-none text-white/15 select-none">📌</div>
                        <div className="relative">
                          <span className="chip chip-glass !text-ink !text-[11px]">ปัจจุบัน · {c.period}</span>
                          <p className="text-[15px] font-bold mt-3 leading-snug">{c.position}</p>
                          <p className="text-[12.5px] text-white/85 mt-0.5">{c.school}</p>
                        </div>
                      </div>
                    ) : (
                      <div key={c.id} className="card-pop rounded-[1.6rem] p-5">
                        <span className="chip chip-primary !text-[11px]">{c.period}</span>
                        <p className="text-[15px] font-bold mt-3 leading-snug">{c.position}</p>
                        <p className="text-[12.5px] text-ink-muted mt-0.5">{c.school}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      )}
    </main>
  )
}
