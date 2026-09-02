const fs = require('fs');
const file = 'src/components/FloatingTeachingToolsOverlay.tsx';
let content = fs.readFileSync(file, 'utf8');

const insertion = `
    if (toolId.startsWith('zoomit_')) {
      if (toolId === 'zoomit_bridge') {
        const batContent = \`@echo off\\necho ===================================================\\necho Nagah Platform - ZoomIt Bridge Installer\\necho ===================================================\\necho Requesting Administrative Privileges...\\nnet session >nul 2>&1\\nif %errorLevel% == 0 (\\n    echo Success: Administrative rights confirmed.\\n) else (\\n    echo ERROR: Please right-click this file and select "Run as administrator"\\n    pause\\n    exit\\n)\\n\\necho Registering Custom Protocol (nagah-zoomit://)...\\nreg add "HKCR\\\\nagah-zoomit" /ve /t REG_SZ /d "URL:Nagah ZoomIt Protocol" /f >nul\\nreg add "HKCR\\\\nagah-zoomit" /v "URL Protocol" /t REG_SZ /d "" /f >nul\\n\\nset CMD=powershell.exe -WindowStyle Hidden -Command "$u='%%1'; $s=New-Object -ComObject WScript.Shell; if($u -match 'draw'){$s.SendKeys('^{2}')} elseif($u -match 'zoom'){$s.SendKeys('^{1}')} elseif($u -match 'live'){$s.SendKeys('^{4}')} elseif($u -match 'break'){$s.SendKeys('^{3}')}"\\nreg add "HKCR\\\\nagah-zoomit\\\\shell\\\\open\\\\command" /ve /t REG_SZ /d "%CMD%" /f >nul\\n\\necho Integration Successful! You can now use ZoomIt tools directly from the Nagah Platform.\\npause\`;
        const blob = new Blob([batContent], { type: 'application/bat' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nagah_zoomit_bridge.bat';
        a.click();
        showToast('تم تحميل ملف التفعيل. يرجى تشغيله كمسؤول (Run as administrator).', 'success');
      } else {
        const action = toolId.replace('zoomit_', '');
        window.location.href = \`nagah-zoomit://\${action}\`;
      }
      if (!isPinned) setIsIsOpen(false);
      return;
    }
`;

content = content.replace("if (toolId === 'clear') {", insertion + "    if (toolId === 'clear') {");
fs.writeFileSync(file, content);
