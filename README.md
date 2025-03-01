# API Documentation

## Overview
This document provides an overview of the API endpoints available in the hospital backend system. It includes details on user management, patient-doctor assignments, doctor note submissions, and actionable steps scheduling.

## Base URL
The base URL for all endpoints is: `http://localhost:3000/api`

## Endpoints

### User Management

#### Signup
- **Endpoint:** `POST /auth/signup`
- **Request Body:**
  - `name`: string (required)
  - `email`: string (required, unique)
  - `password`: string (required)
  - `role`: string (required, either "Patient" or "Doctor")
- **Response:**
  - `201 Created`: User successfully registered.
  - `400 Bad Request`: Validation errors.

#### Login
- **Endpoint:** `POST /auth/login`
- **Request Body:**
  - `email`: string (required)
  - `password`: string (required)
- **Response:**
  - `200 OK`: Authentication successful, returns user token.
  - `401 Unauthorized`: Invalid credentials.

### Patient-Doctor Assignment

#### Select Doctor
- **Endpoint:** `POST /patient/select-doctor`
- **Request Body:**
  - `patientId`: string (required)
  - `doctorId`: string (required)
- **Response:**
  - `200 OK`: Doctor successfully assigned to patient.
  - `404 Not Found`: Patient or doctor not found.

#### Get Assigned Patients
- **Endpoint:** `GET /doctor/patients`
- **Headers:**
  - `Authorization`: Bearer token
- **Response:**
  - `200 OK`: Returns list of patients assigned to the doctor.

### Doctor Notes & Actionable Steps

#### Submit Note
- **Endpoint:** `POST /notes/submit`
- **Request Body:**
  - `doctorId`: string (required)
  - `patientId`: string (required)
  - `note`: string (required)
- **Response:**
  - `201 Created`: Note submitted and actionable steps created.
  - `400 Bad Request`: Validation errors.

#### Get Actionable Steps
- **Endpoint:** `GET /notes/actionable-steps`
- **Headers:**
  - `Authorization`: Bearer token
- **Response:**
  - `200 OK`: Returns checklist and plan for the patient.

### Reminders

#### Schedule Reminder
- **Endpoint:** `POST /reminders/schedule`
- **Request Body:**
  - `patientId`: string (required)
  - `action`: string (required)
  - `schedule`: object (required)
- **Response:**
  - `201 Created`: Reminder scheduled successfully.
  - `400 Bad Request`: Validation errors.

#### Get Reminders
- **Endpoint:** `GET /reminders`
- **Headers:**
  - `Authorization`: Bearer token
- **Response:**
  - `200 OK`: Returns list of reminders for the patient.

## Security
All endpoints require authentication via Bearer tokens. Sensitive data, including patient notes, is encrypted using end-to-end encryption.

## Conclusion
This API documentation outlines the key functionalities of the hospital backend system. For further details on request and response formats, please refer to the individual endpoint descriptions.