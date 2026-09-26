-- TABNAREE EDUCATION PORTFOLIO — ข้อมูลตั้งต้นที่ระบบต้องมี (Core Seed)
-- ระดับผลงาน, 4 คุณลักษณะ, ประเภทงานเริ่มต้น, โปรไฟล์ และค่าตั้งต้นเว็บ

-- 1. ระดับผลงาน (4 ระดับหลัก)
INSERT INTO levels (code, name_th, short_name, icon, color, sort_order) VALUES
('national','ระดับประเทศ','ประเทศ','🌏','#2563EB',1),
('province','ระดับจังหวัด','จังหวัด','🏛️','#16A34A',2),
('agency','ระดับหน่วยงาน','หน่วยงาน','🏢','#EA580C',3),
('other','อื่น ๆ','อื่น ๆ','📌','#64748B',4);

-- 2. คุณลักษณะการปฏิบัติงาน (4 ด้าน)
INSERT INTO attributes (code, name_th, short_name, icon, color, sort_order) VALUES
('self','การครองตน','ครองตน','👤','#16A34A',1),
('people','การครองคน','ครองคน','🤝','#2563EB',2),
('work','การครองงาน','ครองงาน','💼','#EA580C',3),
('ethics','ปฏิบัติตามมาตรฐานทางจริยธรรม','จริยธรรม','⚖️','#9333EA',4);

-- 3. ประเภทงานเริ่มต้น (แอดมินสามารถพิมพ์เพิ่มเองได้ในระบบ)
INSERT INTO work_types (slug, name, sort_order) VALUES
('award','รางวัล / การได้รับการยอมรับ',1),
('certificate','เกียรติบัตร',2),
('project','โครงการ / กิจกรรม',3),
('system','การพัฒนาระบบ',4),
('innovation','นวัตกรรม',5),
('academic','ผลงานวิชาการ',6),
('training','การอบรม',7),
('meeting','การประชุม',8),
('coordination','การประสานงาน',9);

-- 4. ตั้งค่าเว็บพื้นฐาน
INSERT INTO site_settings (key, value) VALUES ('theme', 'royal');

-- 5. โปรไฟล์ของคุณเทพนรี (id = 1 เสมอ)
INSERT INTO profile (
  id, full_name, nickname, position, academic_standing, 
  affiliation, department, motto, philosophy
) VALUES (
  1, 
  'นางสาวเทพนรี เชื้อไทย', 
  '', 
  'นักวิชาการศึกษา', 
  '', 
  'สำนักงานศึกษาธิการจังหวัดอุบลราชธานี', 
  '', 
  'การศึกษา คือ พลังของการพัฒนาชีวิตและสังคม', 
  ''
);
