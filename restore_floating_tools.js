import fs from 'fs';
let code = fs.readFileSync('src/components/FloatingTeachingToolsOverlay.tsx', 'utf-8');

const replacementRegistry = `const TOOLS_REGISTRY = [
    { id: 'copilot', label: 'مساعد 🤖', category: 'ذكاء اصطناعي', shortcut: 'Alt+C', icon: Bot, textColor: 'text-fuchsia-400 group-hover:text-fuchsia-300' },
    { id: 'points', label: 'نقاط ⭐️', category: 'تفاعل', shortcut: 'Alt+A', icon: Star, textColor: 'text-amber-400 group-hover:text-amber-300' },
    { id: 'smart_speaker', label: 'صوت 📢', category: 'أدوات', shortcut: 'Alt+S', icon: Volume2, textColor: 'text-emerald-400 group-hover:text-emerald-300' },
    { id: 'pen', label: 'قلم 🖊️', category: 'رسم', shortcut: 'Alt+P', icon: PenTool, textColor: 'text-red-400 group-hover:text-red-300' },`;

code = code.replace(/const TOOLS_REGISTRY = \[\n\s*\{ id: 'pen', label: 'قلم 🖊️', category: 'رسم', shortcut: 'Alt\+P', icon: PenTool, textColor: 'text-red-400 group-hover:text-red-300' \},/, replacementRegistry);

// We need to make sure Bot, Star, Volume2 are imported from lucide-react!
if (!code.includes('Bot,') && !code.includes('Bot ')) {
   code = code.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, "import { Bot, Star, Volume2, $1 } from 'lucide-react';");
}

fs.writeFileSync('src/components/FloatingTeachingToolsOverlay.tsx', code);
console.log("Registry restored.");
