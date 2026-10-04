# School-OS Online API

ไฟล์นี้ใช้ Google Apps Script เป็นตัวกลางอ่านฐานข้อมูลจาก Google Sheet ของโรงเรียน

Spreadsheet:
School-OS Database 2569

## Deploy ครั้งแรก
1. เปิด https://script.google.com/
2. New project
3. ลบโค้ดเดิมใน Code.gs แล้ววางเนื้อหาจากไฟล์ Code.gs นี้
4. Deploy > New deployment
5. Type: Web app
6. Execute as: Me
7. Who has access: Anyone (สำหรับ V1 แบบอ่านอย่างเดียว)
8. Deploy และคัดลอก URL ที่ลงท้าย /exec
9. นำ URL มาใส่ใน config.js หรือส่งให้ ChatGPT แก้ให้

V1 นี้เป็น Read-only สำหรับข้อมูลกลาง เพื่อลดความเสี่ยงคนภายนอกแก้ฐานข้อมูล
