'use client'

import { createContext, useContext, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Modal from './Modal'
import DriveLinkInput from './DriveLinkInput'
import { saveChallenge } from '@/app/admin/pa/actions'
import { toastSuccess, toastError } from '@/lib/ui'
import type { PaChallenge, MediaSource } from '@/lib/types'

interface Draft {
  id: number
  topic: string
  problem_statement: string
  method: string
  expected_outcome: string
  image_source: MediaSource | null
  image_ref: string | null
  is_hidden: boolean
  title: string
}

const EMPTY: Draft = {
  id: 0,
  topic: '',
  problem_statement: '',
  method: '',
  expected_outcome: '',
  image_source: null,
  image_ref: null,
  is_hidden: false,
  title: '🎯 เพิ่มโครงการ / ผลการปฏิบัติงาน',
}

const Ctx = createContext<((d: Draft) => void) | null>(null)

/** โมดอลจัดการโครงการและผลการปฏิบัติงาน – รองรับการแก้ไข ลบ ซ่อน และแนบรูปจาก Google Drive */
export function ChallengeProvider({
  agreementId,
  children,
}: {
  agreementId: number
  children: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [d, setD] = useState<Draft>(EMPTY)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [, startTransition] = useTransition()

  async function submit(form: FormData) {
    setBusy(true)
    try {
      const r = await saveChallenge(form)
      if (!r.ok) {
        setErr(r.error)
        toastError(r.error)
        return
      }
      toastSuccess('บันทึกข้อมูลเรียบร้อยแล้ว!')
      setOpen(false)
      startTransition(() => router.refresh())
    } finally {
      setBusy(false)
    }
  }

  return (
    <Ctx.Provider value={(draft) => { setD(draft); setErr(''); setOpen(true) }}>
      {children}

      <Modal open={open} onClose={() => setOpen(false)} title={d.title} maxWidth={680}>
        <form action={submit} autoComplete="off">
          <input type="hidden" name="id" value={d.id} />
          <input type="hidden" name="agreement_id" value={agreementId} />
          
          <div className="modal-body">
            <div className="mb-4">
              <label className="lbl req" htmlFor="ch_topic">ชื่อโครงการ / ภาระงาน</label>
              <input
                className="inp"
                id="ch_topic"
                name="topic"
                required
                maxLength={300}
                value={d.topic}
                onChange={(e) => setD({ ...d, topic: e.target.value })}
              />
              <span className="field-error">{err}</span>
            </div>

            <div className="mb-4">
              <label className="lbl req" htmlFor="ch_prob">หลักการและเหตุผล / สภาพปัญหา</label>
              <textarea
                className="inp"
                id="ch_prob"
                name="problem_statement"
                required
                rows={3}
                value={d.problem_statement}
                onChange={(e) => setD({ ...d, problem_statement: e.target.value })}
              />
              <span className="field-error"></span>
            </div>

            <div className="mb-4">
              <label className="lbl req" htmlFor="ch_method">วิธีการดำเนินการ</label>
              <textarea
                className="inp"
                id="ch_method"
                name="method"
                required
                rows={3}
                value={d.method}
                onChange={(e) => setD({ ...d, method: e.target.value })}
              />
              <span className="field-error"></span>
            </div>

            <div className="mb-4">
              <label className="lbl req" htmlFor="ch_out">ผลลัพธ์ที่ได้ / ความสำเร็จ</label>
              <textarea
                className="inp"
                id="ch_out"
                name="expected_outcome"
                required
                rows={3}
                value={d.expected_outcome}
                onChange={(e) => setD({ ...d, expected_outcome: e.target.value })}
              />
              <span className="field-error"></span>
            </div>

            {/* ช่องแนบรูปภาพประกอบจาก Google Drive */}
            <div className="mb-4">
              <label className="lbl mb-1 block">รูปภาพประกอบโครงการ (Google Drive)</label>
              <DriveLinkInput
                name="image"
                defaultSource={d.image_source}
                defaultRef={d.image_ref}
                placeholder="วางลิงก์รูปภาพแชร์จาก Google Drive ที่นี่"
                thumb={true}
              />
            </div>

            {/* ส่วนควบคุมการซ่อน/แสดง */}
            <div className="flex items-center gap-3 bg-primary-soft/60 rounded-2xl px-4 py-3">
              <span className="text-lg">👁️‍🗨️</span>
              <label className="text-[12.5px] font-semibold text-ink-soft flex-1 cursor-pointer" htmlFor="ch_hidden">
                ซ่อนการแสดงผล <span className="block text-[11px] font-normal text-ink-muted">ซ่อนไม่ให้แสดงบนหน้าเว็บไซต์สาธารณะ</span>
              </label>
              <input
                type="checkbox"
                id="ch_hidden"
                name="is_hidden"
                value="1"
                checked={d.is_hidden}
                onChange={(e) => setD({ ...d, is_hidden: e.target.checked })}
                className="w-5 h-5 rounded accent-[color:var(--primary)] cursor-pointer"
              />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'กำลังบันทึก…' : '💾 บันทึก'}
            </button>
          </div>
        </form>
      </Modal>
    </Ctx.Provider>
  )
}

const useOpen = () => {
  const fn = useContext(Ctx)
  if (!fn) throw new Error('ต้องอยู่ใน <ChallengeProvider>')
  return fn
}

export function NewChallengeButton() {
  const open = useOpen()
  return (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => open(EMPTY)}>
      + เพิ่มโครงการ
    </button>
  )
}

export function EditChallengeButton({
  challenge,
}: {
  challenge: PaChallenge & {
    is_hidden?: boolean
    image_source?: MediaSource | null
    image_ref?: string | null
  }
}) {
  const open = useOpen()
  return (
    <button
      type="button"
      className="icon-btn edit w-10 h-10"
      title="แก้ไข"
      aria-label="แก้ไขโครงการ"
      onClick={() =>
        open({
          id: challenge.id,
          topic: challenge.topic ?? '',
          problem_statement: challenge.problem_statement ?? '',
          method: challenge.method ?? '',
          expected_outcome: challenge.expected_outcome ?? '',
          image_source: challenge.image_source ?? null,
          image_ref: challenge.image_ref ?? null,
          is_hidden: Boolean(challenge.is_hidden),
          title: '✏️ แก้ไขโครงการ / ผลการปฏิบัติงาน',
        })
      }
    >
      ✏️
    </button>
  )
}
