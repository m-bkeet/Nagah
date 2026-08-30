# Nagah Windows Lab Agent — Installation & Deployment Guide

## Overview
The Nagah Windows Lab Agent runs as a background service on student laboratory PCs, handling secure device registration, periodic heartbeats, command execution (Lock, Restart, Shutdown, Open URL), and student session binding.

---

## Prerequisites
1. Node.js (v18 or higher) installed on the Windows Lab PC.
2. Network connectivity to the Nagah Cloud Run Backend URL.

---

## Build Instructions (For Administrators)

1. Navigate to the agent directory on a development machine or target PC:
   ```bash
   cd windows-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile TypeScript into standalone JavaScript:
   ```bash
   npm run build
   ```

---

## Configuration (`agent-config.json`)
Before running the agent, verify or edit `agent-config.json`:
```json
{
  "backendUrl": "https://ais-dev-2er5trw65huii5w5do2ams-44504194853.europe-west2.run.app",
  "deviceId": "PC-LAB1-01",
  "branchId": "branch_main",
  "labId": "lab_1",
  "secretToken": "ngh_secure_device_token",
  "heartbeatIntervalMs": 15000
}
```

---

## Running as a Background Service on Windows
To ensure the agent starts automatically upon Windows boot and restarts on failure, you can use **NSSM (Non-Sucking Service Manager)** or **PM2**:

```bash
npm install -g pm2
pm2 start index.js --name "NagahLabAgent"
pm2 startup
pm2 save
```
