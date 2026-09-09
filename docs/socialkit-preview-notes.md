# SocialKit preview integration notes

เอกสาร SocialKit ที่ตรวจสอบเมื่อ 25 สิงหาคม 2026 ระบุว่า TikTok Download API (`/tiktok/download`), YouTube Download API (`/youtube/download`) และ Instagram Download API (`/instagram/download`) รับ `access_key`, `url`, `format` และ `quality` ผ่าน POST และส่งข้อมูลจริงใน `data` เช่น `title`, `duration`, `durationSeconds`, `thumbnail`, `downloadUrl`, `fileSize`, `fileSizeMB`, `format`, `quality` และ `expiresIn` [1][2][3]

TikTok Stats API (`/tiktok/stats`) เป็น endpoint แยกสำหรับ metadata และ engagement โดยเอกสารระบุ field `channelName`, `likes`, `comments`, `shares`, `collects`, `views`, `description`, `duration`, `thumbnailUrl` และ `publishedAt` [4] ดังนั้นตัวเลข engagement ต้องแสดงเฉพาะเมื่อ endpoint stats ส่งกลับมา ห้ามสร้างค่า fallback เป็นตัวเลขเอง

ข้อจำกัดที่ยืนยันจากเอกสารคือ TikTok และ Instagram รองรับ short links/public URLs ตามรูปแบบที่ระบุ และ Instagram private accounts/posts ไม่รองรับ [1][3] YouTube มี download endpoint แยกและรองรับหลายคุณภาพ [2] ส่วน Facebook ยังไม่มี download endpoint ที่ยืนยันได้จากเอกสารชุดนี้ จึงต้องแสดง unavailable/unsupported อย่างตรงไปตรงมาจนกว่าจะมี endpoint และ access contract ที่ตรวจสอบได้

References:

[1] [SocialKit TikTok Video Download API](https://docs.socialkit.dev/api-reference/tiktok-download-api)
[2] [SocialKit YouTube Video Download API](https://docs.socialkit.dev/api-reference/youtube-download-api)
[3] [SocialKit Instagram Video Download API](https://docs.socialkit.dev/api-reference/instagram-download-api)
[4] [SocialKit TikTok Stats API](https://docs.socialkit.dev/api-reference/tiktok-stats-api)
