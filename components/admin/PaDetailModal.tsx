'use client'

import { createContext, useContext, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Modal from './Modal'
import DriveLinkInput from './DriveLinkInput'
import { saveDetail } from '@/app/admin/pa/actions'
import { toastSuccess, toastError } from '@/lib/ui'
import type { PaDetail, MediaSource } from '@/lib/types'

export interface IndicatorOpt { id: number; code: string; name: string }
export interface DomainGroup { code: number; name: string; indicators: IndicatorOpt[] }

interface Draft {
  id: number
  indicator_id: number | ''
  task_description: string
  expected_quantity: string
  expected_quality: string
  image_source: MediaSource | null
  image_ref: string | null
  is_hidden: boolean
  title: string
}

const EMPTY: Draft = {
  id: 0,
  indicator_id: '',
  task_description: '',
  expected_quantity: '',
  expected_quality: '',
  image_source: null,
  image_ref: null,
  is_hidden: false,
  title: '➕ เพิ่มภาระงาน / โครงการ',
}

const Ctx = createContext<((d: Draft) => void) | null>(null)

/** โมดอลจัดการภาระงานและโครงการ – รองรับการซ่อนและแนบรูปภาพ Google Drive */
export function PaDetailProvider({
  agreementId,
  fiscalYear,
  groups,
  children,
}: {
  agreementId: number
  fiscalYear: number
  groups: DomainGroup[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [d, setD] = useState<Draft>(EMPTY)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [, startTransition] = useTransition()

  const openwith = (draft: Draft) => { setD(draft); setErr(''); setOpen(true) }

  async function submit(f: FormData) {
    setBusy(true)
    try {
      const r = await saveDetail(f)
      if (!r.ok) { setErr(r.error); toastError(r.error); return }
      toastSuccess('บันทึกข้อมูลสำเร็จ!')
      setOpen(false)
      startTransition(() => router.refresh())
    } finally {
      setBusy(false)
    }
  }

  return (
    <Ctx.Provider value={openwith}>
      {children}

      <Modal open={open} onClose={() => setOpen(false)} title={d.title} maxWidth={680}>
        <form action={submit} autoComplete="off">
          <input type="hidden" name="id" value={d.id} />
          <input type="hidden" name="agreement_id" value={agreementId} />
          
          <div className="modal-body">
            <p className="text-[12px] text-ink-soft bg-sunny-soft/60 border border-sunny/40 rounded-xl px-3.5 py-2.5 mb-4">
              🔒 รายการนี้จะถูกบันทึกในปีงบประมาณ <b className="text-ink">{fiscalYear}</b> เท่านั้น
            </p>

            <div className="mb-4">
              <label className="lbl req" htmlFor="d_ind">หมวดหมู่ภาระงาน</label>
              <select className="inp" id="d_ind" name="indicator_id" required
                value={d.indicator_id} onChange={(e) => setD({ ...d, indicator_id: Number(e.target.value) || '' })}>
                <option value="">- เลือกหมวดหมู่งาน -</option>
                {groups.map((g) => (
                  <optgroup key={g.code} label={`ด้านที่ ${g.code} ${g.name}`}>
                    {g.indicators.map((i) => (
                      <option key={i.id} value={i.id}>{i.code} {i.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="field-error">{err}</span>
            </div>

            <div className="mb-4">
              <label className="lbl req" htmlFor="d_task">รายละเอียดงาน / โครงการ</label>
              <textarea className="inp" id="d_task" name="task_description" required rows={3}
                value={d.task_description} onChange={(e) => setD({ ...d, task_description: e.target.value })} />
              <span className="field-error"></span>
            </div>

            <div className="mb-4">
              <label className="lbl" htmlFor="d_qty">เปิงประสงค์เชิงปริมาณ</label>
              <textarea className="inp" id="d_qty" name="expected_quantity" rows={2} maxLength={400}
                placeholder="เช่น จัดโครงการอบรม จำนวน 2 ครั้ง/ปี"
                value={d.expected_quantity} onChange={(e) => setD({ ...d, expected_quantity: e.target.value })} />
              <span className="field-error"></span>
            </div>

            <div className="mb-4">
              <label className="lbl" htmlFor="d_qual">เป้าหมายเชิงคุณภาพ</label>
              <textarea className="inp" id="d_qual" name="expected_quality" rows={2} maxLength={400}
                placeholder="เช่น ผู้เข้าร่วมมีความพึงพอใจ ไม่น้อยกว่าร้อยละ 85"
                value={d.expected_quality} onChange={(e) => setD({ ...d, expected_quality: e.target.value })} />
              <span className="field-error"></span>
            </div>

            {/* ช่องแนบรูปภาพจาก Google Drive */}
            <div className="mb-4">
              <label className="lbl mb-1 block">รูปภาพประกอบภาระงาน (Google Drive)</label>
              <DriveLinkInput
                name="image"
                defaultSource={d.image_source}
                defaultRef={d.image_ref}
                placeholder="วางลิงก์รูปภาพแชร์จาก Google Drive ที่นี่"
                thumb={true}
              />
            </div>

            {/* ปุ่มซ่อนการแสดงผล */}
            <div className="flex items-center gap-3 bg-primary-soft/60 rounded-2xl px-4 py-3">
              <span className="text-lg">👁️‍🗨️</span>
              <label className="text-[12.5px] font-semibold text-ink-soft flex-1 cursor-pointer" htmlFor="d_hidden">
                ซ่อนการแสดงผล <span className="block text-[11px] font-normal text-ink-muted">ซ่อนไม่ให้แสดงบนหน้าเว็บไซต์สาธารณะ</span>
              </label>
              <input type="checkbox" id="d_hidden" name="is_hidden" value="1"
                checked={d.is_hidden} onChange={(e) => setD({ ...d, is_hidden: e.target.checked })}
                className="w-5 h-5 rounded accent-[color:var(--primary)] cursor-pointer" />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'กำลังบันทึก…' : '💾 บันทึก'}</button>
          </div>
        </form>
      </Modal>
    </Ctx.Provider>
  )
}

const useOpen = () => {
  const fn = useContext(Ctx)
  if (!fn) throw new Error('ต้องอยู่ใน <PaDetailProvider>')
  return fn
}

export function AddDetailButton({ indicatorId, code }: { indicatorId: number; code: string }) {
  const open = useOpen()
  return (
    <button type="button" className="btn btn-primary btn-sm whitespace-nowrap"
      onClick={() => open({ ...EMPTY, indicator_id: indicatorId, title: `➕ เพิ่มงานในหมวด ${code}` })}>
      + เพิ่มรายการ
    </button>
  )
}

export function EditDetailButton({
  detail,
  code,
}: {
  detail: PaDetail & { is_hidden?: boolean; image_source?: MediaSource | null; image_ref?: string | null }
  code: string
}) {
  const open = useOpen()
  return (
    <button type="button" className="icon-btn edit w-10 h-10" title="แก้ไขรายการนี้" aria-label="แก้ไขงาน"
      onClick={() => open({
        id: detail.id,
        indicator_id: detail.indicator_id,
        task_description: detail.task_description ?? '',
        expected_quantity: detail.expected_quantity ?? '',
        expected_quality: detail.expected_quality ?? '',
        image_source: detail.image_source ?? null,
        image_ref: detail.image_ref ?? null,
        is_hidden: Boolean(detail.is_hidden),
        title: `✏️ แก้ไขรายการหมวด ${code}`,
      })}>
      ✏️
    </button>
  )
}
