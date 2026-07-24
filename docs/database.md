# Database Design

## User

ระบบผู้ใช้งาน

Fields:

- user_id
- username
- password
- email
- role
- status

## Teacher

ข้อมูลครู

Fields:

- teacher_id
- user_id
- first_name
- last_name
- department_id
- position

## Department

กลุ่มสาระ

Fields:

- department_id
- department_name

## Subject

ข้อมูลรายวิชา

Fields:

- subject_id
- subject_code
- subject_name
- department_id
- credit
- level

## Classroom

ข้อมูลห้องเรียน

Fields:

- classroom_id
- classroom_name
- building
- floor
- capacity

## Class

ข้อมูลชั้นเรียน

Fields:

- class_id
- grade_level
- class_name
- academic_year

## Period

ช่วงเวลาเรียน

Fields:

- period_id
- period_name
- start_time
- end_time

## Timetable

ข้อมูลตารางสอน

Fields:

- timetable_id
- teacher_id
- subject_id
- class_id
- classroom_id
- period_id
- day_of_week
- academic_year
