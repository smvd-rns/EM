# MaintenOps Documentation

MaintenOps is a premium, full-stack maintenance management system specifically tailored for the Maintenance Department of **ISKCON NVCC**. It streamlines the process of reporting, tracking, and resolving maintenance issues while managing material procurement and inventory with high efficiency.

---

## 🚀 The Wow Factor

MaintenOps isn't just a maintenance tool; it's a modern, high-performance platform designed with:

- **Premium Aesthetics**: A stunning user interface featuring glassmorphism, smooth transitions, and a curated color palette that makes maintenance management feel like a top-tier administrative experience.
- **Intelligent Dashboards**: Customized views for different roles (User, Admin, SuperAdmin) that prioritize the most critical tasks and provide real-time system health metrics.
- **Streamlined Procurement**: A revolutionary material picking and negotiation system that connects maintenance requests directly to vendor lists and quotation management.
- **Action-Oriented Workflows**: From "Action Queues" to "Timeline Compliance," every screen is designed to minimize friction and maximize productivity.

---

## ❓ The Problem Statement

Before MaintenOps, managing maintenance in a large facility like ISKCON NVCC faced several challenges:
- **Fragmented Communication**: Requests were often lost or delayed due to manual tracking.
- **Material Invisibility**: Tracking material usage and stock levels for specific repairs was difficult.
- **Procurement Bottlenecks**: The gap between identifying a needed part and obtaining approval/quotes led to long repair times.
- **Audit Complexity**: Lack of a centralized timeline made it hard to review past maintenance or compliance.

MaintenOps solves these by providing a **unified source of truth** for all maintenance activities.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0 (for ultra-modern, utility-first design)
- **Routing**: React Router 7
- **State Management**: React Context API
- **Icons & Fonts**: Fontsource (Roboto, Google Sans)

### Backend
- **Core**: Java 21 with Spring Boot (v4.0.2 parent)
- **Security**: Spring Security with JWT (JSON Web Tokens) for stateless authentication.
- **Data**: Spring Data JPA with PostgreSQL.
- **Utilities**: Lombok (for boilerplate reduction), ModelMapper (for DTO mapping), Jackson (for JSON processing).

### Database
- **PostgreSQL**: A robust relational database for handling complex relationships between Users, Requests, Materials, and Vendors.

---

## 👥 Role-Based Access Control (RBAC)

The system is built on a tripartite role structure:

1. **User (Requester)**: 
   - Create maintenance requests.
   - Track live status of their own requests.
   - View their dashboard of pending and completed items.
2. **Admin (Department Head)**:
   - Review and approve/reject requests from their department.
   - Manage material picking for approved requests.
   - Track team performance and compliance timelines.
3. **SuperAdmin (Management/Procurement)**:
   - System-wide overview of all departments.
   - Manage user roles and system admins.
   - High-level procurement management, vendor lists, and quotation approvals.

---

## 📦 Core Modules

- **Request Lifecycle**: Intelligent management of requests from creation to "In Production" and "Ready" states.
- **Material Management**: Inventory tracking, material specifications, and automated rate history.
- **Vendor & Procurement**: Managing vendor relationships and streamlining the quotation/negotiation process.
- **Service Departments**: Organization of maintenance tasks by specific departments (e.g., Electrical, Plumbing, HVAC).

---

## 📁 Project Structure

### Backend (`/maintenops-backend`)
- `src/main/java/com/maintenops/nvcc/entities`: JPA entity models defining the database schema.
- `src/main/java/com/maintenops/nvcc/controllers`: REST API endpoints.
- `src/main/java/com/maintenops/nvcc/services`: Business logic implementation.
- `src/main/java/com/maintenops/nvcc/config`: Security, JWT, and application configuration.
- `src/main/resources/application.yaml`: Centralized configuration for different environments (Dev, Prod).

### Frontend (`/MOps-frontend`)
- `src/pages`: Main application views (Landing, Dashboards, Action Queues).
- `src/components`: Reusable UI components (Modals, Tables, Trackers).
- `src/layouts`: Dashboard layouts and navigation structures.
- `src/context`: Auth and Request state management.
- `src/services`: API client integration with the backend.

---

## ⚙️ Setup & Installation

### Backend Setup
1. Ensure **Java 21** and **PostgreSQL** are installed.
2. Configure your database credentials in `src/main/resources/application.yaml`.
3. Run the application using Maven:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to the `MOps-frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

*MaintenOps - Efficiency meet Excellence.*
