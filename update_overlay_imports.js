import fs from 'fs';
let code = fs.readFileSync('src/components/FloatingTeachingToolsOverlay.tsx', 'utf-8');

// Add imports
if (!code.includes('FloatingPointsModal')) {
    code = code.replace(/import \{ SmartSpeakerModal \} from '\.\/SmartSpeakerModal';/, "import { SmartSpeakerModal } from './SmartSpeakerModal';\nimport { FloatingPointsModal } from './FloatingPointsModal';\nimport { FloatingCopilotModal } from './FloatingCopilotModal';");
}

// Add state variables
if (!code.includes('isFloatingPointsOpen')) {
    const stateAnchor = "const [isSmartSpeakerOpen, setIsSmartSpeakerOpen] = useState(false);";
    const newStates = `const [isSmartSpeakerOpen, setIsSmartSpeakerOpen] = useState(false);\n  const [isFloatingPointsOpen, setIsFloatingPointsOpen] = useState(false);\n  const [isFloatingCopilotOpen, setIsFloatingCopilotOpen] = useState(false);`;
    code = code.replace(stateAnchor, newStates);
}

// Intercept handleSelectTool
if (!code.includes('case \'points\':')) {
    const toolAnchor = "switch (id) {";
    const newCases = `switch (id) {\n      case 'points':\n        setIsFloatingPointsOpen(true);\n        setIsOpen(false);\n        return;\n      case 'copilot':\n        setIsFloatingCopilotOpen(true);\n        setIsOpen(false);\n        return;`;
    code = code.replace(toolAnchor, newCases);
}

// Add JSX Modals at the bottom before </ConditionalPopoutWrapper>
if (!code.includes('<FloatingPointsModal')) {
    const jsxAnchor = "<SmartSpeakerModal";
    const newJsx = `<FloatingPointsModal isOpen={isFloatingPointsOpen} onClose={() => setIsFloatingPointsOpen(false)} />\n      <FloatingCopilotModal isOpen={isFloatingCopilotOpen} onClose={() => setIsFloatingCopilotOpen(false)} />\n      <SmartSpeakerModal`;
    code = code.replace(jsxAnchor, newJsx);
}

fs.writeFileSync('src/components/FloatingTeachingToolsOverlay.tsx', code);
console.log("FloatingTeachingToolsOverlay updated with Modals!");
