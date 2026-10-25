# School-OS · รุ่น Firebase

เว็บปัจจุบัน: https://drivekup01.github.io/School-OS/

ใช้ Google login และ school_users ร่วมกับ School-Portal, School-Attendance และ School-Budget
ฐานตารางสอนอยู่บน Firebase school-budget-3e69d แยกชุดข้อมูล timetable_* จากงบประมาณ
Functions ใช้ codebase school-timetable; กฎรวมดูแลจาก repo School-Budget จุดเดียว
รายละเอียดสิทธิ์ การย้ายข้อมูล และการรับประวัติลา: [docs/firebase-migration.md](docs/firebase-migration.md)

ฝ่ายวิชาการแก้ข้อมูล/ตารางสอน/สอนแทนได้ ผู้เข้าใช้ทั่วไปดูตารางครูรายวัน รายครู และรายชั้นเรียนได้อย่างเดียว
ข้อมูลนักเรียนและการเชื่อมการเช็คชื่อเป็นส่วนของ School-Attendance

---
เอกสารโครงทดลองเดิมด้านล่างเป็นข้อมูลก่อนย้ายมา Firebase ไม่ใช่ขั้นตอนรันเว็บปัจจุบัน
# School-OS

ระบบบริหารจัดการโรงเรียน

## Description

School-OS เป็นระบบที่ช่วยจัดการข้อมูลภายในโรงเรียน
เช่น ตารางสอน ครู นักเรียน วิชา ห้องเรียน และข้อมูลพื้นฐานต่างๆ

## Features

- จัดการข้อมูลครู
- จัดการข้อมูลนักเรียน
- จัดการรายวิชา
- จัดการห้องเรียน
- สร้างและจัดการตารางสอน

## Technology

Frontend:
- React

Backend:
- Node.js
- Express

Database:
- MySQL

## Project Structure

