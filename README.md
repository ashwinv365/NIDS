#  Intelligent Network Intrusion Detection System (NIDS) with Explainable AI

![Python](https://img.shields.io/badge/Python-3.x-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Scikit-Learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=flat&logo=scikit-learn&logoColor=white)
![Status](https://img.shields.io/badge/Status-Phase%202%20Completed-success)

## 📌 Project Overview
This project is an enterprise-grade, full-stack **Network Intrusion Detection System (NIDS)**. It leverages a highly optimized Random Forest machine learning model trained on the CIC-IDS-2017 dataset to analyze network traffic behavior in real-time, detecting cyber threats such as DDoS, PortScans, and Web Attacks. 

Beyond standard detection, this system integrates **Explainable AI (XAI)** using SHAP (SHapley Additive exPlanations) to provide security analysts with transparent, visual evidence of *why* specific network packets were flagged as malicious.

---

## ✨ Core Features
* **Decoupled Microservice Architecture:** A completely independent Python/FastAPI backend and a React frontend, mirroring enterprise cloud environments.
* **Behavioral Threat Detection:** Drops spoofable metadata (like IP addresses) and relies entirely on packet physics (e.g., flow duration, byte variance) using an optimized 150-tree Random Forest.
* **Explainable AI (XAI):** Generates SHAP visualizations for detected anomalies, shifting the paradigm from a "black box" AI to a transparent security tool.
* **Live Tunneling:** Utilizes `ngrok` to securely expose the local high-performance machine learning backend to the frontend dashboard.

---

## 🏗️ Architecture & Tech Stack

### Backend (The ML Engine)
* **Framework:** FastAPI & Uvicorn (Fully asynchronous microservice API)
* **Data Engineering:** Pandas & NumPy (Parquet data ingestion & sanitization)
* **Machine Learning:** Scikit-Learn (Random Forest Classifier, Data Balancing via Imblearn)
* **Explainability:** SHAP (TreeExplainer)
* **Tunneling:** Ngrok

### Frontend (The Dashboard)
* **Framework:** React / Node.js
* **Functionality:** Real-time polling via `fetch` to the ngrok-exposed FastAPI endpoint.
* **Visuals:** Recharts & Lucide React for dynamic threat monitoring.

---

## 🚀 How to Run the Project Locally

This project operates on a decoupled architecture, meaning you need to run the backend engine, the network tunnel, and the frontend dashboard simultaneously.

### Step 1: Start the ML Backend (FastAPI)
Open your terminal, navigate to the `backend` directory, and start the Uvicorn server:
\`\`\`bash
cd backend
uvicorn api:app --reload --host 0.0.0.0 --port 8000
\`\`\`

### Step 2: Establish the Secure Tunnel (Ngrok)
Open a **new, separate terminal** (run as Administrator if on Windows), navigate to where Ngrok is installed, and expose the backend port to the internet:
\`\`\`bash
./ngrok http 8000
\`\`\`
*(Note: Copy the `https://...ngrok-free.app` URL generated here. You will need to provide this to your frontend so it knows where to send network data).*

### Step 3: Start the Frontend UI
Open a **third terminal**, navigate to the `frontend` directory, install dependencies, and start the development server:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

---

## 📂 Repository Structure
\`\`\`text
📦 NIDS-Project
 ┣ 📂 backend
 ┃ ┣ 📜 api.py                  # FastAPI application routing
 ┃ ┣ 📜 nids_label_encoder.pkl  # Serialized label encoder
 ┃ ┣ 📜 nids_features_list.pkl  # Top 30 selected features
 ┃ ┗ 📜 nids_rf_model_v2.pkl    # Serialized Random Forest model (Tracked via Git LFS / Ignored)
 ┣ 📂 frontend
 ┃ ┣ 📂 src                     # React components and dashboard UI
 ┃ ┣ 📜 package.json            # Node dependencies
 ┃ ┗ 📜 tailwind.config.js      # UI Styling
 ┣ 📜 .gitignore                # Protects node_modules, __pycache__, and large .pkl models
 ┗ 📜 README.md                 # Project documentation
\`\`\`
*(Note: Large `.pkl` files over 100MB are excluded from this repository via `.gitignore` to comply with GitHub file size limits).*

---

## 🔮 Future Roadmap (Phase 3)
* **Live Network Sniffing:** Replacing static `.parquet` upload ingestion with a live `CICFlowMeter` edge-sensor to sniff live `.pcap` traffic.
* **Database Integration:** Implementing SQLite/PostgreSQL to log historical threat data.
* **Concept Drift Handling:** Building an MLOps pipeline to retrain the model continuously as network behaviors evolve.
