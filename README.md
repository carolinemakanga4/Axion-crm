# Axion CRM

Modern Customer Relationship Management system built with React, TypeScript, and Supabase.

🚧 **Project Status: Active Development**

This project is currently under development. Some features and UI components are still being improved as the system evolves.

![React](https://img.shields.io/badge/React-Framework-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Status](https://img.shields.io/badge/Status-Under%20Development-orange)

---

## Overview

Axion CRM is a modern web-based CRM system designed to help small businesses manage customers, invoices, and payments in one centralized platform.

The goal of this project is to build a scalable and clean CRM architecture using modern full-stack technologies.

This repository is part of my software development portfolio and demonstrates real-world application development using React and Supabase.

---

## Features

* Client management
* Invoice creation and management
* Invoice line items
* Payment tracking
* Automatic invoice balance calculation
* Invoice status tracking (Paid / Pending / Overdue)
* Secure database access using Supabase Row Level Security
* Modern responsive UI

---

## Tech Stack

### Frontend

* React
* TypeScript
* TailwindCSS
* Vite

### Backend

* Supabase
* PostgreSQL

### Tools

* Git
* GitHub
* Supabase Auth
* SQL functions and triggers

---

## System Architecture

Axion CRM follows a modern full-stack architecture.

Frontend
React and TypeScript handle the user interface, forms, and client interactions.

Backend
Supabase provides authentication, API services, and database access.

Database
PostgreSQL stores business data including clients, invoices, and payments.

Security
Row Level Security ensures users only access data belonging to their organization.

---

## Database Schema

Main tables used in the system:

clients
Stores customer contact information.

invoices
Stores invoice records including totals, due dates, and status.

invoice_items
Stores individual line items attached to invoices.

payments
Tracks payments made toward invoices.

organizations
Represents companies using the CRM.

users
Authenticated users belonging to organizations.

---

## Screenshots

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Clients Page

![Clients](docs/screenshots/clients.png)

### Invoice Form

![Invoice Form](docs/screenshots/invoice-form.png)

### Payments Panel

![Payments](docs/screenshots/payments.png)

---

## Project Structure

src
├ components
├ features
│ ├ clients
│ └ invoices
├ pages
├ hooks
└ utils

supabase
└ database migrations and schema

docs
└ screenshots

---

## Development Progress

### Completed

* Core database schema
* Client management
* Invoice creation
* Invoice line items
* Payment tracking
* Row Level Security policies

### In Progress

* Invoice PDF generation
* Improved reusable forms
* Dashboard UI improvements

### Planned

* Email invoice sending
* Dashboard analytics
* Subscription billing
* Multi-organization support

---

## Installation

Clone the repository

git clone https://github.com/YOUR_USERNAME/axion-crm.git

Navigate into the project

cd axion-crm

Install dependencies

npm install

Start development server

npm run dev

---

## Environment Variables

Create a `.env` file in the project root and add:

VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

---

## Author

Caroline Makanga

Software Developer | DevOps Enthusiast

GitHub
https://github.com/carolinemakanga4

---

## License

This project is intended for educational and portfolio purposes.
