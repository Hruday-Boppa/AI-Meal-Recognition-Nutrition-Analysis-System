# Cal-AI: AI-Powered Vision Nutrition Tracker

An intelligent health platform that transforms food photography into actionable nutritional data using local LLMs. Built with a modern full-stack architecture featuring **Java 21/Spring Boot** and **Angular**.

## 🚀 Core Features

- **Vision-Based Food Analysis:** Integrated the Qwen2.5-VL vision model to automatically identify meals from images and extract nutritional data (calories and macros) in structured JSON format.
- **Asynchronous Processing:** Implemented multi-threaded background analysis using Spring Boot’s `@Async` task executor, allowing for non-blocking meal scanning.
- **Secure API Architecture:** Developed a backend featuring JWT authentication and custom rate limiting (Bucket4j) to manage traffic and protect sensitive data.
- **Reactive Frontend:** Built a responsive Angular service layer using RxJS for real-time status updates and non-blocking API communication.

## 🛠️ Technology Stack

- **Backend:** Java 21, Spring Boot 3.4, Spring Security (JWT)
- **Frontend:** Angular, RxJS, Chart.js
- **Database:** PostgreSQL
- **AI/ML:** Ollama (Qwen2.5-VL:7B)
- **Tools:** Maven, npm, Git

## 📋 Prerequisites

- **Java 21+**
- **Node.js**
- **PostgreSQL**
- **Ollama** (running `qwen2.5-vl:7b`)

## ⚙️ Setup & Installation

### Backend (Spring Boot)
1. Navigate to `/api-server`
2. Update `src/main/resources/application.yml` with your database credentials.
3. Run using: `./mvnw spring-boot:run`

### Frontend (Angular)
1. Navigate to `/cal-ai`
2. Install dependencies: `npm install`
3. Run using: `npm start`

---

*Developed by [Your Name]*
