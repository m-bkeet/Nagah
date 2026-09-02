const fs = require('fs');
const file = 'src/components/FloatingTeachingToolsOverlay.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove isDesktopToolsOpen state if present
content = content.replace(/  const \[isDesktopToolsOpen, setIsDesktopToolsOpen\] = useState\(false\);\n?/g, '');

// 2. Update handleSelectTool to trigger ZoomIt protocols automatically for pen, highlighter, focus, lens, laser
const oldToolSelectionLogic = `    const nextTool = activeTool === toolId ? 'none' : toolId;
    setActiveTool(nextTool);`;

const newToolSelectionLogic = `    const nextTool = activeTool === toolId ? 'none' : toolId;
    setActiveTool(nextTool);

    // Intelligent Desktop & ZoomIt Integration (Unified Experience)
    if (nextTool !== 'none') {
      if (toolId === 'pen' || toolId === 'highlighter') {
        try {
          window.location.href = 'nagah-zoomit://draw';
        } catch (e) {}
        showToast('تم تفعيل القلم المتكامل (المنصة + سطح المكتب 🖊️)', 'success');
      } else if (toolId === 'focus' || toolId === 'lens') {
        try {
          window.location.href = 'nagah-zoomit://zoom';
        } catch (e) {}
        showToast('تم تفعيل زر التركيز الذكي وتكبير الشاشة 🎯🔍', 'success');
      } else if (toolId === 'laser') {
        try {
          window.location.href = 'nagah-zoomit://live';
        } catch (e) {}
        showToast('تم تفعيل مؤشر الليزر التفاعلي 🔴', 'success');
      }
    }`;

content = content.replace(oldToolSelectionLogic, newToolSelectionLogic);

// 3. Remove desktop_tools item from TOOLS_REGISTRY
content = content.replace(/    \{ id: 'desktop_tools',(.|\n)*?\},?\n/g, '');

// 4. Remove DesktopToolsModal markup if present
const modalRegex = /\s*\{\/\* ---------------------------------------------------- \*\}\s*\{\/\* DESKTOP TOOLS UNIFIED MODAL[\s\S]*?\}\s*\)\}\s*/;
content = content.replace(modalRegex, '');

fs.writeFileSync(file, content);
console.log('Successfully updated FloatingTeachingToolsOverlay.tsx with unified intelligence.');
