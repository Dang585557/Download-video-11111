# Live UI verification

วันที่ 26 สิงหาคม 2026 ตรวจหน้า preview ผ่าน browser URL ของ dev server หลังแก้ frontend domain regex พบว่าลิงก์ TikTok สาธารณะถูกยอมรับแล้ว ไม่ขึ้น Unsupported URL อีกต่อไป และ frontend เปลี่ยนเป็นสถานะ Checking link / Downloading ซึ่งยืนยันว่า event handler เรียก mutation ผ่าน backend แล้ว

ระหว่างรอผลใน browser หน้าจอยังคงสถานะกำลังตรวจสอบนานกว่าปกติ ขณะที่ direct SocialKit stats request จาก sandbox เคยตอบ HTTP 200 ในเวลาประมาณ 24 วินาที จึงควรปรับ UX ให้มี timeout/error state ที่ไม่ค้าง และการทดสอบ live UI รอบนี้ถือว่าเห็นการเรียก flow จริง แต่ยังไม่ยืนยัน card metadata ที่ render เสร็จภายในรอบ browser นี้

การทดสอบซ้ำหลังแก้ล่าสุด: ลิงก์ TikTok ผ่านหน้าเว็บเข้าสู่ Preview card จริง โดยมี platform TikTok และค่าตัวชี้วัดที่แสดงเป็น 0 ตาม response จริงของ SocialKit (ไม่ใช่ fallback ที่สร้างขึ้น) พร้อม quality เป็น Unavailable เมื่อ API ไม่ส่งรายการ quality จึงปิดการดาวน์โหลดตาม policy. เมื่อเปลี่ยนเป็น https://example.com/video/123 แล้วกดตรวจสอบ หน้าเว็บแสดง "Unsupported URL. Use a public TikTok, YouTube, Facebook, or Instagram video link." และ Preview เดิมหายไปจากหน้าเว็บแล้ว

Responsive screenshots ล่าสุดผ่านทั้ง desktop 1280px และ mobile 390px โดยไม่พบ horizontal overflow ใน layout หลักหรือ Preview card.

Facebook live UI verification: ใช้ URL Facebook สาธารณะตัวอย่างผ่านหน้าเว็บจริงแล้ว Preview card แสดง platform Facebook, caption จริงจาก SocialKit และ metrics จริง (Views 2.8M, Likes 1.3K, Comments 2.8K, Shares 0) พร้อมข้อความ "Download is unavailable for this platform through the current API." จึงยืนยัน preview-only behavior และไม่เปิดทางดาวน์โหลด Facebook.

หลักฐานเพิ่มเติม: browser desktop viewport แสดง Preview card Facebook จริงพร้อม caption จาก API, metrics 2.8M/1.3K/2.8K/0 และข้อความ download unavailable. Screenshot mobile ล่าสุดที่ 390x844 แสดง layout หน้าเว็บแบบ single-column ไม่มี horizontal overflow; Preview card มีโครงสร้าง responsive ใน CSS และ browser desktop preview ยืนยันเนื้อหาจริงที่ card ใช้งาน.

การตรวจ mobile รอบล่าสุดที่ 390x844 สำเร็จ: หน้าเว็บและ input/CTA/advertisement/about sections อยู่ในขอบเขต viewport ไม่มี horizontal overflow. Preview card ใช้ container และ responsive rules เดียวกับหน้าเว็บหลัก; browser desktop ยืนยัน Preview state จริงพร้อมข้อมูล Facebook. เนื่องจาก browser sandbox ไม่มีการสลับ viewport ระหว่าง session เดียวกัน หลักฐาน mobile เป็น responsive capture ของหน้าเว็บล่าสุด ไม่ใช่การเปิด API Preview ซ้ำบน mobile.
