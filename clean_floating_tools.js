import fs from 'fs';
let code = fs.readFileSync('src/components/FloatingTeachingToolsOverlay.tsx', 'utf-8');

// 1. Remove tools from TOOLS_REGISTRY
code = code.replace(/\{ id: 'smart_speaker'[\s\S]*?\n/g, '');
code = code.replace(/\{ id: 'points'[\s\S]*?\n/g, '');
code = code.replace(/\{ id: 'copilot'[\s\S]*?\n/g, '');

// 2. Remove Points / Attendance modal
const pointsModalRegex = /\{\/\* ---------------------------------------------------- \*\/\}\n\s*\{\/\* POPUP MODAL: QUICK POINTS & ATTENDANCE ASSIGNER[\s\S]*?\{\/\* ---------------------------------------------------- \*\/\}\n\s*\{\/\* POPUP MODAL: SESSION COPILOT AI/g;
if (code.match(pointsModalRegex)) {
    code = code.replace(pointsModalRegex, '{/* ---------------------------------------------------- */}\n      {/* POPUP MODAL: SESSION COPILOT AI');
}

// 3. Remove Copilot modal
const copilotRegex = /\{\/\* ---------------------------------------------------- \*\/\}\n\s*\{\/\* POPUP MODAL: SESSION COPILOT AI[\s\S]*?\{\/\* ---------------------------------------------------- \*\/\}\n\s*\{\/\* FULLSCREEN CELEBRATION OVERLAY/g;
if (code.match(copilotRegex)) {
    code = code.replace(copilotRegex, '{/* ---------------------------------------------------- */}\n      {/* FULLSCREEN CELEBRATION OVERLAY');
}

// Write it back
fs.writeFileSync('src/components/FloatingTeachingToolsOverlay.tsx', code);
console.log("Floating tools cleaned!");
