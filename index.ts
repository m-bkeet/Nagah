/**
 * Nagah Training Center - Real Windows Lab Agent Daemon
 * Runs on laboratory PCs as a background service or standalone process.
 * Communicates securely with Nagah Cloud Run Backend and Supabase PostgreSQL.
 * Uses native Node.js fetch (zero external dependencies required for agent runtime).
 */

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

interface AgentConfig {
  backendUrl: string;
  deviceId: string;
  branchId: string;
  labId: string;
  secretToken: string;
  heartbeatIntervalMs: number;
}

const CONFIG_FILE = path.join(__dirname, 'agent-config.json');

function loadConfig(): AgentConfig {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse config file, using defaults.', e);
    }
  }

  const defaultConfig: AgentConfig = {
    backendUrl: process.env.NAGAH_BACKEND_URL || 'https://ais-dev-2er5trw65huii5w5do2ams-44504194853.europe-west2.run.app',
    deviceId: 'PC-' + os.hostname().toUpperCase(),
    branchId: 'branch_main',
    labId: 'lab_1',
    secretToken: 'ngh_agent_token_' + Math.random().toString(36).substring(2, 10),
    heartbeatIntervalMs: 15000,
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  return defaultConfig;
}

const config = loadConfig();
console.log(`[Nagah Agent] Initializing Windows Lab Agent for device: ${config.deviceId}`);

async function registerDevice() {
  try {
    const res = await fetch(`${config.backendUrl}/api/devices/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: config.deviceId,
        name: os.hostname(),
        branchId: config.branchId,
        labId: config.labId,
        hostname: os.hostname(),
        osPlatform: os.platform(),
        agentVersion: '1.0.0',
      }),
    });
    const data = await res.json();
    console.log('[Nagah Agent] Device registered successfully:', data);
  } catch (err: any) {
    console.error('[Nagah Agent] Registration error (Will retry):', err.message);
  }
}

async function sendHeartbeat() {
  try {
    await fetch(`${config.backendUrl}/api/devices/${config.deviceId}/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'online',
        currentUser: os.userInfo().username,
        uptime: os.uptime(),
        timestamp: new Date().toISOString(),
      }),
    });
    console.log(`[Nagah Agent] Heartbeat sent at ${new Date().toLocaleTimeString()}`);
  } catch (err: any) {
    console.error('[Nagah Agent] Heartbeat failed:', err.message);
  }
}

async function pollCommands() {
  try {
    const res = await fetch(`${config.backendUrl}/api/devices/${config.deviceId}/commands`);
    const json = await res.json() as any;
    const commands = json?.data || [];
    
    for (const cmd of commands) {
      if (cmd.status === 'queued') {
        console.log(`[Nagah Agent] Executing command: ${cmd.command}`);
        executeCommand(cmd);
      }
    }
  } catch (err: any) {
    // Silent fail on polling network drops
  }
}

function executeCommand(cmd: any) {
  const { command, payload } = cmd;

  switch (command) {
    case 'lock':
      if (os.platform() === 'win32') {
        exec('rundll32.exe user32.dll,LockWorkStation');
      }
      break;
    case 'restart':
      if (os.platform() === 'win32') {
        exec('shutdown /r /t 10 /c "Nagah Lab Admin requested restart"');
      }
      break;
    case 'shutdown':
      if (os.platform() === 'win32') {
        exec('shutdown /s /t 10 /c "Nagah Lab Admin requested shutdown"');
      }
      break;
    case 'open_url':
      if (payload?.url) {
        const startCmd = os.platform() === 'win32' ? 'start' : 'xdg-open';
        exec(`${startCmd} ${payload.url}`);
      }
      break;
    default:
      console.log(`[Nagah Agent] Unknown command type: ${command}`);
  }
}

async function startAgent() {
  await registerDevice();
  
  setInterval(async () => {
    await sendHeartbeat();
    await pollCommands();
  }, config.heartbeatIntervalMs);
}

startAgent();
