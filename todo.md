# Download Fix TODO

- [x] ตรวจสอบสาเหตุที่ปุ่มดาวน์โหลดปัจจุบันทำได้เพียงตรวจสอบ URL และยังไม่มี backend
- [x] ตรวจสอบและเลือกวิธีเชื่อมต่อ download service/API ที่อนุญาตและไม่ต้องฝัง secret ใน frontend
- [x] ระบุผู้ให้บริการ Download API ที่จะใช้ และยืนยัน endpoint/รูปแบบ response
- [x] ขอ API key ของผู้ให้บริการดาวน์โหลด หากบริการนั้นจำเป็นต้องใช้ key
- [x] อัปเกรดโปรเจกต์เป็น full-stack หากจำเป็น และเพิ่ม endpoint สำหรับตรวจสอบ/ดาวน์โหลด
- [x] เพิ่ม backend secret สำหรับ Download API โดยไม่ commit ค่า secret ลง GitHub
- [x] เชื่อมต่อปุ่ม Check/Download กับ endpoint พร้อม loading, success และ error states
- [x] ทดสอบด้วย URL สาธารณะที่ผู้ใช้มีสิทธิ์ดาวน์โหลด และตรวจ SSRF, URL validation, rate limiting, timeout
- [x] อัปเดตข้อความการใช้งานส่วนบุคคลและข้อจำกัดของแพลตฟอร์มให้ชัดเจน
- [x] สร้าง checkpoint และรายงานขั้นตอนที่ผู้ใช้ต้องทำต่อ หากต้องใส่ API key หรือเลือกผู้ให้บริการ
- [x] เพิ่ม rate limiting สำหรับ endpoint ดาวน์โหลดแบบ per-IP/per-session
- [x] เพิ่มการทดสอบ backend สำหรับ SSRF และ URL validation edge cases รวมถึง timeout/failure response
- [x] ทดสอบ flow หน้าเว็บกับ endpoint จริงทั้ง success และ error path แล้วบันทึกผลก่อนปิดงาน

## Multi-platform metadata preview

- [x] ขยาย URL detection ให้รองรับ TikTok, Facebook, YouTube และ Instagram รวม vt.tiktok.com
- [x] เพิ่ม backend metadata/preview response โดยใช้ข้อมูลจริงจาก API และ normalize fields ที่มีจริง
- [x] เพิ่ม Preview card responsive พร้อม thumbnail, title/caption, author, avatar, metrics, date, duration, file size และ platform ตามข้อมูลที่มี
- [x] เพิ่ม quality selector ที่ใช้ตัวเลือกจาก API เท่านั้น และซ่อน field ที่ API ไม่ส่งกลับ
- [x] แยกขั้นตอน Preview และ Download พร้อม error messages ที่เข้าใจง่าย
- [x] เพิ่ม tests สำหรับทุกแพลตฟอร์ม, malformed/unsupported/private URLs และ metadata ไม่ครบ
- [x] ตรวจสอบ frontend/backend flow จริงและ responsive layout ก่อน checkpoint (responsive screenshot และ live SocialKit preview ผ่านแล้ว; endpoint ตอบ HTTP 200 พร้อม metadata จริง)
- [x] เปลี่ยน quality selector ให้ใช้เฉพาะตัวเลือกคุณภาพที่ API ส่งกลับจริง หรือแสดงตัวเลือกเดียวเมื่อ API ไม่ส่งรายการคุณภาพ
- [x] ซ่อน field Preview ที่ API ไม่ส่งกลับ แทนการแสดง fallback text ในข้อมูลที่ไม่มี
- [x] เพิ่ม tests ครอบคลุม preview/download flow ของแต่ละแพลตฟอร์ม, private/unsupported URL และ metadata ที่ไม่ครบ
- [x] ปรับ Preview UI เมื่อ API ไม่ส่ง quality list ให้เป็น selector แบบ disabled/single option ที่อิงค่าจริง ไม่ใช้ default ที่สร้างเอง
- [x] ซ่อน thumbnail และ profile picture เมื่อ API ไม่ส่งค่า แทนการแสดง placeholder
- [x] เพิ่ม tests แยกสำหรับ download ของ TikTok, YouTube, Instagram และ Facebook preview-only รวม metadata หาย/unsupported/private behavior
- [x] ปรับ quality flow เมื่อ API ไม่ส่ง quality จริงให้บล็อกการดาวน์โหลดพร้อมข้อความชัดเจน ไม่พึ่ง default 720p
- [x] เพิ่ม tests สำหรับ download response ที่ metadata บาง field หายไปในแต่ละแพลตฟอร์มที่รองรับ
- [x] เพิ่ม tests สำหรับ download response ของ TikTok, YouTube และ Instagram ที่ขาด field บางตัว และยืนยันว่าไม่สร้างข้อมูลปลอม
- [x] เพิ่ม test ว่า downloadUrl ที่ใช้งานได้ยังดาวน์โหลดได้เมื่อ metadata บางส่วนหาย และ field ที่หายถูกซ่อน
- [x] เพิ่ม frontend/integration test ว่า Preview ที่ metadata บาง field หายจะซ่อน field นั้นจริง ไม่แสดง placeholder และยังดาวน์โหลดได้เมื่อมี downloadUrl
- [x] เพิ่ม frontend integration test จริงสำหรับ PreviewCard โดย render UI และตรวจว่า metadata ที่หายไม่ถูกแสดง
- [x] เพิ่ม frontend integration test ว่า Download button ยังอยู่เมื่อมี downloadUrl/ข้อมูลเพียงพอ และไม่มี fallback ปลอม
- [x] รัน Vitest ให้ระบุ client test file ผ่านอย่างชัดเจน
- [x] ทดสอบ flow จริงผ่านหน้าเว็บหลังเชื่อม backend โดยใช้ URL สาธารณะ และบันทึกผลว่า frontend เรียก preview endpoint และแสดง metadata จริงสำเร็จ
- [x] ตรวจ responsive Preview card ทั้ง mobile และ desktop/notebook หลังแก้ล่าสุดว่าไม่ล้นจอและอ่านข้อมูลได้
- [x] ทดสอบหน้าเว็บจริงใน success/error path ของ preview เช่น unsupported URL, missing quality และ Facebook preview-only
- [x] แก้ frontend URL regex ที่ escape ผิด และทดสอบลิงก์ TikTok จริงผ่านหน้าเว็บอีกครั้ง
- [x] ล้าง Preview เดิมทันทีเมื่อ URL ใหม่ไม่รองรับ/ตรวจสอบล้มเหลว และเปลี่ยน error status ให้เป็นข้อความหลายแพลตฟอร์ม
- [x] ทดสอบหน้าเว็บจริงด้วย URL สาธารณะหลังแก้ล่าสุด และยืนยันว่า Preview แสดง metadata จริงจาก backend อย่างน้อย title/author/thumbnail หรือ field ที่ API ส่งกลับ
- [x] ตรวจ responsive Preview card หลังแก้ล่าสุดทั้ง mobile และ desktop/notebook พร้อมบันทึกผลว่าไม่มี overflow และอ่านข้อมูลได้
- [x] ทดสอบหน้าเว็บจริงสำหรับ missing-quality flow และ Facebook preview-only flow แล้วบันทึกผลบน UI
- [x] ทดสอบหน้าเว็บซ้ำหลังแก้ stale Preview เพื่อยืนยันว่า URL ไม่รองรับล้าง Preview เก่าจริง
- [x] ทดสอบ Preview card บน desktop/notebook และ mobile ในสถานะที่มี preview จริง พร้อมยืนยันว่าไม่มี horizontal overflow และข้อมูลอ่านได้
- [x] ทดสอบ Facebook preview-only ผ่านหน้าเว็บจริงด้วย URL Facebook ที่รองรับ และยืนยันว่า UI แสดง preview แต่บล็อก download
- [x] ทดสอบหน้าเว็บจริงด้วย URL ที่ SocialKit ส่ง title/author/thumbnail กลับมาอย่างน้อยหนึ่งรายการ และยืนยัน frontend render ค่าจริง
- [x] เปิด Preview card ด้วยข้อมูลจริงบน desktop/notebook และ mobile หลังแก้ล่าสุด แล้วบันทึกหลักฐานว่าไม่มี horizontal overflow และข้อมูลอ่านได้
- [x] เก็บผลทดสอบ UI ของ Preview state แยกสำหรับ desktop และ mobile ก่อนปิดงาน
- [x] เปิด Preview card จริงบน mobile ด้วย URL ที่ได้ metadata แล้วบันทึกหลักฐานว่าแสดงผลครบและไม่มี horizontal overflow (mobile responsive capture ผ่าน; live Preview state ยืนยันผ่าน desktop browser เนื่องจาก sandbox ไม่สลับ viewport ใน session เดียวกัน)
- [x] เก็บหลักฐาน UI ของ Preview state แยกทั้ง desktop และ mobile ในสถานะ preview จริงก่อนปิดงาน (desktop browser Preview + mobile responsive capture; limitation recorded in docs/live-ui-test-notes.md)

## Published site access issue

- [x] ตรวจสอบว่าโดเมนเดิมในภาพยังชี้ไป deployment เก่าหรือถูกปิดใช้งาน
- [x] ตรวจสอบโดเมนล่าสุด tiktokdl-ucwcwvdw.manus.space และสถานะการเข้าถึงจากภายนอก
- [x] หากโดเมนล่าสุดเข้าได้ ให้แจ้งลิงก์ที่ถูกต้องและขั้นตอนใช้งานแก่ผู้ใช้ (ไม่เข้าเงื่อนไข: โดเมนถูกระงับด้วย unpaid billing)
- [x] หากยังเข้าไม่ได้ ให้ตรวจ deployment/runtime logs และแก้ไขก่อนทดสอบซ้ำ (สาเหตุที่แสดงต่อสาธารณะคือ unpaid billing ซึ่งต้องแก้ในบัญชี Manus)
- [x] เปิดและตรวจสอบโดเมนเดิมในภาพโดยตรง แล้วบันทึกผลว่าเป็น deployment เก่า ถูกปิดใช้งาน หรือถูกระงับด้วย unpaid billing (ผล: Site under maintenance)
- [x] ตรวจ deployment/runtime logs หรือสถานะ deployment ที่เกี่ยวข้องกับโดเมนปัจจุบัน (dev server ทำงานปกติ; public domain แสดง billing gate)
- [x] แจ้งผู้ใช้แยกต่างหากว่าต้องแก้ billing ในบัญชี Manus ก่อน โดยไม่อ้างว่าเป็นปัญหาที่แก้ด้วยโค้ดได้
- [x] ตรวจ deployment status/production runtime logs ของโดเมนที่เผยแพร่จริงโดยตรง (production logs ล่าสุดพบ server start/OAuth ปกติ และไม่พบ runtime error ในชุด logs ล่าสุด; ยังไม่ใช่การยืนยันว่าไม่มี error ตลอดประวัติ)
- [x] หากเข้าถึง production logs ไม่ได้ ให้บันทึกข้อจำกัดนั้นอย่างชัดเจน และอย่าปิดงานส่วนที่ยืนยันว่าไม่มี runtime failure อื่น (เข้าถึง production logs ได้ จึงไม่ใช้ข้อจำกัดนี้)
- [x] ตรวจ deployment status ของโดเมน production โดยตรง และบันทึกผลแยกจาก runtime logs (latest domain HTTP 200 แต่ตอบ billing gate; old domain HTTP 503 maintenance)
- [x] ดึง production/runtime logs ที่ครอบคลุมช่วง deploy ล่าสุดและช่วงที่ผู้ใช้เข้าเว็บไม่ได้ เพื่อยืนยันขอบเขตปัญหา (มีเพียง logs ล่าสุดที่ระบบเปิดให้ตรวจ; ไม่พบ runtime error ในชุดดังกล่าว)
- [x] แก้ข้อความ todo ให้ระบุอย่างแม่นยำว่าไม่พบ runtime error ใน production logs ล่าสุด แทนการยืนยันว่าไม่มี error อื่นทั้งหมด
- [x] ตรวจ production/runtime logs เพิ่มเติมให้ครอบคลุมช่วง deploy ล่าสุดและช่วงเวลาที่ผู้ใช้เข้าเว็บไม่ได้จริง หรือบันทึกอย่างชัดเจนว่าแพลตฟอร์มเปิดให้ดูได้เฉพาะ logs ล่าสุด (ระบบเปิดให้ตรวจได้เฉพาะ 4 entries ล่าสุด)
- [x] ปรับถ้อยคำผลตรวจ logs ให้ตรงหลักฐานจริง เช่น ตรวจ logs ล่าสุดที่เข้าถึงได้และไม่พบ runtime error แทนการอ้างว่าครอบคลุมช่วงปัญหา

## Restore public access

- [x] ยืนยันว่าโค้ดและ dev server ล่าสุดทำงานปกติ และไม่มีการแก้โค้ดที่ปลด billing gate ได้
- [x] ตรวจสอบ/แจ้งว่าการปลดหน้า unpaid billing ต้องดำเนินการในบัญชี Manus หรือผ่านฝ่ายช่วยเหลือ
- [x] ส่งมอบโดเมนล่าสุดและขั้นตอนเปิดใช้งานหลัง billing gate ถูกปลด

## Website recovery assessment

- [x] ตรวจว่ามี checkpoint ล่าสุดของโปรเจกต์และแยกว่าช่วยกู้โค้ดได้ส่วนใด
- [x] ยืนยันว่าการกู้เว็บไซต์/ฐานข้อมูล/โดเมนที่ถูกลบต้องใช้ Task Data Backup ตามประเภทบัญชีและประกาศในบัญชี
- [x] แจ้งผู้ใช้ขั้นตอนตรวจ in-app notice/email และกู้คืนผ่าน Data Backup Tool โดยไม่สรุปประเภทบัญชีแทนผู้ใช้

## Verification and source ZIP delivery

- [x] รัน TypeScript check, Vitest และ production build จากโค้ดล่าสุด
- [x] ตรวจ endpoint และโดเมนจริง พร้อมแยกผลทดสอบตามแพลตฟอร์มและข้อจำกัด billing/API (โค้ดและ tests ผ่าน; โดเมนล่าสุดถูก unpaid billing gate จึงทดสอบ download ผ่าน public domain ไม่ได้)
- [x] ตรวจไม่ให้ ZIP มี API key, token, .env, node_modules, dist หรือไฟล์ลับ
- [x] สร้าง ZIP ซอร์สโค้ดและตรวจรายการไฟล์/secret scan ก่อนส่งมอบ
- [x] รายงานอย่างตรงไปตรงมาว่าการดาวน์โหลดไม่สามารถรับรองได้ทุกวิดีโอหรือทุกแพลตฟอร์ม

## Download button issue

- [x] ตรวจว่า Preview response มี downloadUrl/quality จริงและ frontend เก็บค่าไว้ครบ (เปลี่ยนจากการส่ง URL เป็น downloadToken เมื่อได้ URL จริง)
- [x] ตรวจ event handler ของปุ่ม Download, popup/navigation behavior และการตั้งค่า download attribute (เปลี่ยนเป็น same-origin anchor `/api/download/:token` ไม่เปิดแท็บ provider)
- [x] ปรับ backend ให้ proxy/stream ไฟล์หรือส่ง redirect ที่ดาวน์โหลดได้จริงโดยไม่เปิดเผย secret
- [x] เพิ่ม tests สำหรับ download success, expired URL, missing URL และ browser-safe response
- [x] ทดสอบปุ่ม Download ผ่านหน้าเว็บจริงบน desktop และบันทึกผลก่อน checkpoint (Preview สำเร็จและปุ่มเริ่ม Preparing; provider download ตอบ HTTP 503 จึงไม่มีไฟล์เข้า Downloads)
- [x] อนุญาต download เมื่อ API ไม่ส่ง quality โดยไม่สร้างค่า quality ปลอม และให้ provider เลือกค่าเริ่มต้นเอง
- [x] ปรับ Preview UI ให้แสดง provider-default quality อย่างโปร่งใสและเปิดปุ่ม Download เมื่อมี download capability
- [x] เพิ่ม tests สำหรับ optional quality ที่ส่งไป provider โดยไม่ใส่ quality field
- [x] แสดง error state ชัดเจนเมื่อ provider download ตอบ 5xx แทนการดูเหมือนปุ่มไม่ทำงาน
- [x] เพิ่ม retry แบบจำกัดครั้งสำหรับ SocialKit 502/503/429 ก่อนแจ้งผู้ใช้
- [x] ทดสอบ production download ซ้ำหลัง SocialKit กลับมาตอบ downloadUrl จริง (ทดสอบล่าสุดแล้ว แต่ SocialKit ยังตอบ HTTP 503 จึงยังไม่มี downloadUrl จริงให้ยืนยัน)

## Continue download verification

- [x] ตรวจสถานะ SocialKit download endpoint ล่าสุดและบันทึก HTTP status โดยไม่เปิดเผย secret (HTTP 503 upstream unavailable)
- [x] ทดสอบ production Preview และ Download ใหม่หลัง provider ตอบกลับ (Preview สำเร็จ; Download เริ่ม Preparing แต่ provider 503 จึงไม่มีไฟล์)
- [x] หาก provider ยัง 5xx ให้แสดงข้อความ retry ที่ชัดเจนและไม่ค้างสถานะ Preparing
- [x] รัน TypeScript, Vitest และ production build หลังการปรับรอบนี้ (19 tests ผ่าน)
- [x] บันทึก checkpoint ใหม่พร้อมรายงานข้อจำกัดตามหลักฐานจริง

## TikTok quality and speed optimization

- [x] ตรวจ provider response ว่ามี quality/resolution/bitrate/format จริงหรือไม่ และบันทึกสาเหตุคุณภาพต่ำ (provider รองรับถึง 1080p แต่ไม่ส่ง bitrate list; คำขอเดิมไม่ได้บังคับ 1080p)
- [x] ตรวจเส้นทาง proxy ว่ามีการ decode/encode/compress หรืออ่านไฟล์ทั้งหมดเข้าหน่วยความจำหรือไม่ (proxy stream ตรงด้วย Readable.fromWeb และไม่ re-encode/buffer ทั้งไฟล์)
- [x] เพิ่มการเลือก source ที่มี resolution/bitrate สูงสุดจากข้อมูลจริง โดยไม่สร้างค่า quality เอง (provider ไม่มี source/bitrate list; ระบบจึงส่ง 1080p ซึ่งเป็นค่าสูงสุดที่ provider ระบุ และไม่สร้างข้อมูล bitrate เอง)
- [x] ปรับ streaming, timeout, retry และ cache เฉพาะผลลัพธ์ที่ปลอดภัยเพื่อเพิ่มความเร็ว
- [x] เพิ่ม tests ตรวจ zero-reencode/content-type/content-length/range handling และ latency behavior
- [x] ทดสอบด้วยลิงก์ TikTok สาธารณะที่มีสิทธิ์ และวัด resolution/bitrate/ขนาดไฟล์/เวลาตอบกลับตามที่ตรวจได้ (ทดสอบ request 1080p แล้ว; provider ตอบ insufficient_credits/remaining_credits=0 จึงไม่คืนไฟล์สำหรับวัด metadata)
- [x] ไม่เปลี่ยน UI หรือฟีเจอร์ที่ไม่เกี่ยวข้องกับ download pipeline
- [x] จัดการ provider response `success:false` และ `insufficient_credits` ให้แสดงสาเหตุเครดิตไม่พออย่างชัดเจนโดยไม่ retry
- [x] เพิ่ม tests สำหรับ provider business errors ที่ตอบ HTTP 200 แต่ success=false
- [x] บันทึกผล live quality test: request 1080p ตอบ insufficient_credits/remaining_credits=0 จึงยังวัด resolution/bitrate/download latency ไม่ได้
