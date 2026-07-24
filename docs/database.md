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

## Leave

ข้อมูลการลา

Fields:

- leave_id
- teacher_id
- leave_type
- start_date
- end_date
- reason
- status
- approved_by
- created_at

## Substitute

ข้อมูลการสอนแทน

Fields:

- substitute_id
- leave_id
- timetable_id
- substitute_teacher_id
- assigned_by
- status

## Student

ข้อมูลนักเรียน

Fields:

- student_id
- student_code
- first_name
- last_name
- gender
- class_id
- status

## Academic Year

ข้อมูลปีการศึกษา

Fields:

- academic_year_id
- year
- semester
- status

## Enrollment

ข้อมูลการลงทะเบียนเรียน

Fields:

- enrollment_id
- student_id
- subject_id
- teacher_id
- class_id
- academic_year_id

## Grade Score

ข้อมูลคะแนน

Fields:

- score_id
- enrollment_id
- category_id
- score
- created_at

## Notification

ข้อมูลการแจ้งเตือน

Fields:

- notification_id
- user_id
- title
- message
- type
- reference_type
- reference_id
- status
- created_at

## Role

ประเภทผู้ใช้งาน

Fields:

- role_id
- role_name
- description

## Permission

สิทธิ์การใช้งาน

Fields:

- permission_id
- permission_name
- module
- action

## School

ข้อมูลโรงเรียน

Fields:

- school_id
- school_name
- address
- phone
- logo
- academic_year
