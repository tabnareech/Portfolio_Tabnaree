'use client'

import { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from './Modal'
import type { DomainGroup } from './PaDetailModal'

const Ctx = createContext<(() => void) | null>(null)

/**
 * โมดอล “เลือกหมวดหมู่ก่อนเพิ่มภาระงาน” – แปลงมาจาก modalPickInd
 * เลือกเสร็จแล้วพาไปหน้าหมวดหมู่นั้นพร้อมเปิดฟอร์มเพิ่มรายการทันที
 */
export function PickIndicatorProvider({
  groups,
  children,
}: {
  groups: DomainGroup[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const first = groups.find((g) => g.indicators.length)?.indicators[0]?.id ?? 0
  const [pick, setPick] = useState(first)

  return (
    <Ctx.Provider value={() => setOpen(true)}>
      {children}

      <Modal open={open} onClose={() => setOpen(false)} title="📁 เพิ่มภาระงานใหม่" maxWidth={560}>
        <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); router.push(`/admin/indicator/${pick}?new=1`) }}>
          <div className="modal-body">
            <p className="rounded-2xl bg-primary-soft text-primary-deep px-3.5 py-2.5 text-[12.5px] mb-4">
              💡 ภาระงานและโครงการทุกชิ้นต้องอยู่ภายใต้หมวดหมู่ภาระงานหลัก กรุณาเลือกหมวดหมู่ที่ต้องการบันทึก
            </p>

            <label className="lbl req" htmlFor="pick_ind">หมวดหมู่ภาระงาน</label>
            <select className="inp" id="pick_ind" required value={pick} onChange={(e) => setPick(Number(e.target.value))}>
              {groups.map((g) => (
                <optgroup key={g.code} label={`ด้านที่ ${g.code} ${g.name}`}>
                  {g.indicators.map((i) => (
                    <option key={i.id} value={i.id}>{i.code} {i.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary">ไปกรอกรายละเอียดงาน →</button>
          </div>
        </form>
      </Modal>
    </Ctx.Provider>
  )
}

/** ปุ่ม “+ เพิ่มผลงานใหม่” ของแดชบอร์ด */
export function PickIndicatorButton({ className, children }: { className: string; children: React.ReactNode }) {
  const open = useContext(Ctx)
  if (!open) throw new Error('ต้องอยู่ใน <PickIndicatorProvider>')
  return <button type="button" className={className} onClick={open}>{children}</button>
}
