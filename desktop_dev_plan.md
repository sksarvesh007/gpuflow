# GPUFlow Desktop Application Development Plan

## Overview
Building a cross-platform desktop application (Windows, Mac, Linux) for GPUFlow providers. The app will allow users to register their machines, auto-detect hardware specifications, and connect to the GPUFlow network.

## Tech Stack
- **Framework**: Electron (for cross-platform desktop capabilities)
- **Frontend**: React (for UI)
- **Language**: TypeScript
- **Build Tool**: Vite (via `electron-vite` or similar)
- **State Management**: Zustand or React Context
- **Styling**: TailwindCSS

## Step-by-Step Implementation

### Phase 1: Project Initialization
- [ ] Initialize Electron + React + TypeScript project in `gpuflow-desktop/desktop`.
- [ ] Configure `electron-builder` for cross-platform builds.
- [ ] Set up TailwindCSS for styling.
- [ ] specific main process and renderer process structure.

### Phase 2: Authentication & Navigation
- [ ] Create `Login` screen (Email/Password).
- [ ] Create `Signup` screen (if API supports it, otherwise direct to web).
- [ ] Implement JWT storage (securely using `electron-store` or keytar).
- [ ] Create a protected route layout.

### Phase 3: Hardware Detection (System Information)
- [ ] Implement a utility service in the **Main Process** to query system hardware.
    - **Windows**: Use `wmic` or `dxdiag`.
    - **Linux**: Use `nvidia-smi`, `lshw`, or `/proc/meminfo`.
    - **Mac**: Use `system_profiler SPDisplaysDataType`.
- [ ] Detect:
    - GPU Name
    - VRAM Size
    - Total System RAM

### Phase 4: Machine Registration Flow
- [ ] **Check**: On startup, check if a `machine_auth_token` exists locally.
- [ ] **If NOT Registered**:
    - Show "Register Machine" screen.
    - Auto-fill detected specs.
    - Form for "Machine Name" and "Description".
    - **API Call**: POST `/api/v1/machines/` with details.
    - **Save**: Store the returned `auth_token` and `machine_id` locally.
- [ ] **If Registered**:
    - Validate token with API.
    - Redirect to Dashboard.

### Phase 5: Dashboard & Connectivity
- [ ] Display Machine Status (Online/Offline).
- [ ] Display Current Specs.
- [ ] Implement WebSocket connection to `gpuflow-api` (for receiving jobs).
- [ ] Add "Connect/Disconnect" toggle.

### Phase 6: Job Execution (Future)
- [ ] Listen for job events.
- [ ] Execute Docker containers or scripts (placeholder for now).

## API Integration Reference
- **Base URL**: `http://localhost:8000` (configurable)
- **Login**: `POST /api/v1/login/access-token` -> returns `{ access_token }`
- **Register Machine**: `POST /api/v1/machines/` (requires User Auth Header)
    - Body: `{ name, description }`
    - Returns: `{ id, auth_token, ... }`
- **Get Machines**: `GET /api/v1/machines/`
