CREATE DATABASE school_os;

USE school_os;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','teacher','student') NOT NULL
);


CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    department VARCHAR(100)
);


CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20),
    subject_name VARCHAR(100),
    credit INT
);


CREATE TABLE classrooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_name VARCHAR(50),
    capacity INT
);


CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,

    teacher_id INT,
    subject_id INT,
    classroom_id INT,

    day VARCHAR(20),
    period INT,

    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);
