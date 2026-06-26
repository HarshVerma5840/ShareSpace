# ShareSpace 🚗🅿️

ShareSpace is a full-stack, modern parking marketplace that connects Drivers (Tourists and Commuters) with Parking Spot Owners (Hosts). 

## 🌟 Key Features

*   **Three-Tier Role System:**
    *   **Tourist:** Search and book spots immediately.
    *   **Commuter:** Submit driving license for verification to permanently unlock a 5% "Verified Commuter" discount.
    *   **Host:** Dedicated dashboard to publish spots, set rates, manage availability, and track earnings.
*   **Smart Parking Discovery:** Google Maps integration to find nearby parking spots, visualize routes, and calculate proximity.
*   **Navigational Landmarks:** Hosts can define step-by-step navigation pins, triggering real-time animated UI alerts when drivers approach them.
*   **Computer Vision Spot Scanner:** Python (FastAPI + OpenCV) microservice that processes parking spot images to calculate bounding boxes, area, and confidence scores.
*   **Built-in Wallet:** Virtual wallet system for instant top-ups, transaction settlements, and platform fee (10%) processing.

## 🛠 Tech Stack

*   **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Google Maps API.
*   **Backend:** Java 21, Spring Boot 3, Spring Data JPA, PostgreSQL.
*   **Microservice (CV):** Python, FastAPI, OpenCV, Uvicorn.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Java 21
*   Python 3.10+
*   PostgreSQL
*   Google Maps API Key

### 1. Frontend Setup
```bash
npm install
npm run dev
# Note: Add VITE_GOOGLE_MAPS_API_KEY to your .env
```

### 2. Backend (Spring Boot) Setup
Update your PostgreSQL credentials in `backend/src/main/resources/application.properties`.
```bash
cd backend
./mvnw spring-boot:run
```

### 3. CV Service Setup
```bash
cd cv-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
