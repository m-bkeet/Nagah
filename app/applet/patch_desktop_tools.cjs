const fs = require('fs');
const file = 'src/components/FloatingTeachingToolsOverlay.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Monitor import if not present
if (!content.includes('Monitor')) {
  content = content.replace('Move, Video, Link2,', 'Move, Video, Link2, Monitor,');
}

// 2. Add isDesktopToolsOpen state after isSmartSpeakerOpen
if (!content.includes('isDesktopToolsOpen')) {
  content = content.replace(
    'const [isSmartSpeakerOpen, setIsSmartSpeakerOpen] = useState(false);',
    'const [isSmartSpeakerOpen, setIsSmartSpeakerOpen] = useState(false);\n  const [isDesktopToolsOpen, setIsDesktopToolsOpen] = useState(false);'
  );
}

// 3. Update handleSelectTool for desktop_tools
const oldZoomitHandler = `    if (toolId.startsWith('zoomit_')) {
      if (toolId === 'zoomit_bridge') {
        const batContent = \`@echo off\\r\\necho ===================================================\\r\\necho Nagah Platform - ZoomIt Bridge Installer\\r\\necho ===================================================\\r\\necho Requesting Administrative Privileges...\\r\\nnet session >nul 2>&1\\r\\nif %errorLevel% == 0 (\\r\\n    echo Success: Administrative rights confirmed.\\r\\n) else (\\r\\n    echo ERROR: Please right-click this file and select "Run as administrator"\\r\\n    pause\\r\\n    exit\\n)\\r\\n\\r\\necho Registering Custom Protocol (nagah-zoomit://)...\\r\\nreg add "HKCR\\\\nagah-zoomit" /ve /t REG_SZ /d "URL:Nagah ZoomIt Protocol" /f >nul\\r\\nreg add "HKCR\\\\nagah-zoomit" /v "URL Protocol" /t REG_SZ /d "" /f >nul\\r\\n\\r\\nset CMD=powershell.exe -WindowStyle Hidden -Command "$u='%%1'; $s=New-Object -ComObject WScript.Shell; if($u -match 'draw'){$s.SendKeys('^{2}')} elseif($u -match 'zoom'){$s.SendKeys('^{1}')} elseif($u -match 'live'){$s.SendKeys('^{4}')} elseif($u -match 'break'){$s.SendKeys('^{3}')}"\\r\\nreg add "HKCR\\\\nagah-zoomit\\\\shell\\\\open\\\\command" /ve /t REG_SZ /d "%CMD%" /f >nul\\r\\n\\r\\necho Integration Successful! You can now use ZoomIt tools directly from the Nagah Platform.\\r\\npause\`;
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
    }`;

const newDesktopHandler = `    if (toolId === 'desktop_tools') {
      setIsDesktopToolsOpen(true);
      audioService.playChime([600, 800]);
      showToast('جاري فتح لوحة أدوات سطح المكتب والتشغيل السريع 🖥️', 'info');
      if (!isPinned) setIsIsOpen(false);
      return;
    }`;

if (content.includes('toolId.startsWith(\'zoomit_\')')) {
  content = content.replace(oldZoomitHandler, newDesktopHandler);
}

// 4. Update TOOLS_REGISTRY to replace zoomit_* with desktop_tools
const oldRegistryBlock = `    { id: 'zoomit_draw', label: 'رسم (ZoomIt) 🖍️', category: 'سطح المكتب', shortcut: 'Ctrl+2', icon: PenTool, textColor: 'text-amber-500 group-hover:text-amber-400' },
    { id: 'zoomit_zoom', label: 'تكبير (ZoomIt) 🔍', category: 'سطح المكتب', shortcut: 'Ctrl+1', icon: Search, textColor: 'text-emerald-500 group-hover:text-emerald-400' },
    { id: 'zoomit_live', label: 'تكبير حي (ZoomIt) 🎥', category: 'سطح المكتب', shortcut: 'Ctrl+4', icon: Video, textColor: 'text-blue-500 group-hover:text-blue-400' },
    { id: 'zoomit_break', label: 'استراحة (ZoomIt) ⏱️', category: 'سطح المكتب', shortcut: 'Ctrl+3', icon: Clock, textColor: 'text-purple-500 group-hover:text-purple-400' },
    { id: 'zoomit_bridge', label: 'تفعيل ربط (ZoomIt) 🔗', category: 'سطح المكتب', shortcut: '', icon: Link2, textColor: 'text-slate-400 group-hover:text-white' },`;

const newRegistryItem = `    { id: 'desktop_tools', label: 'سطح المكتب 🖥️', category: 'أدوات', shortcut: 'Alt+D', icon: Monitor, textColor: 'text-amber-400 group-hover:text-amber-300' },`;

if (content.includes('zoomit_draw')) {
  content = content.replace(oldRegistryBlock, newRegistryItem);
}

// 5. Add DesktopToolsModal at the end before </ConditionalPopoutWrapper>
const modalMarkup = `
      {/* ---------------------------------------------------- */}
      {/* DESKTOP TOOLS UNIFIED MODAL (ZOOMIT & SCREEN TOOLS) */}
      {/* ---------------------------------------------------- */}
      {isDesktopToolsOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-300">أدوات سطح المكتب والتحكم السريع</h3>
                  <p className="text-xs text-slate-400">تحكم ببرامج العرض والـ ZoomIt مباشرة من مكان واحد</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDesktopToolsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  window.location.href = 'nagah-zoomit://draw';
                  showToast('تم تفعيل أداة الرسم الحر (ZoomIt Ctrl+2)', 'success');
                }}
                className="p-3.5 bg-slate-800/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PenTool className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-white block">رسم الشاشة الحر</span>
                  <span className="text-[10px] text-amber-400 font-mono">Ctrl+2</span>
                </div>
              </button>

              <button
                onClick={() => {
                  window.location.href = 'nagah-zoomit://zoom';
                  showToast('تم تفعيل عدسة التكبير (ZoomIt Ctrl+1)', 'success');
                }}
                className="p-3.5 bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-white block">تكبير الشاشة</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Ctrl+1</span>
                </div>
              </button>

              <button
                onClick={() => {
                  window.location.href = 'nagah-zoomit://live';
                  showToast('تم تفعيل التكبير الحي (ZoomIt Ctrl+4)', 'success');
                }}
                className="p-3.5 bg-slate-800/90 hover:bg-slate-800 border border-blue-500/30 hover:border-blue-500/60 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-white block">تكبير حي</span>
                  <span className="text-[10px] text-blue-400 font-mono">Ctrl+4</span>
                </div>
              </button>

              <button
                onClick={() => {
                  window.location.href = 'nagah-zoomit://break';
                  showToast('تم تفعيل مؤقت الاستراحة (ZoomIt Ctrl+3)', 'success');
                }}
                className="p-3.5 bg-slate-800/90 hover:bg-slate-800 border border-purple-500/30 hover:border-purple-500/60 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-white block">استراحة العرض</span>
                  <span className="text-[10px] text-purple-400 font-mono">Ctrl+3</span>
                </div>
              </button>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">هل تود تفعيل الربط التلقائي لأول مرة؟</span>
                <span className="text-[10px] text-slate-400">ينشئ ملف ربط سري لربط المنصة ببرنامج ZoomIt</span>
              </div>
              <button
                onClick={() => {
                  const batContent = \`@echo off\\r\\necho ===================================================\\r\\necho Nagah Platform - ZoomIt Bridge Installer\\r\\necho ===================================================\\r\\necho Requesting Administrative Privileges...\\r\\nnet session >nul 2>&1\\r\\nif %errorLevel% == 0 (\\r\\n    echo Success: Administrative rights confirmed.\\r\\n) else (\\r\\n    echo ERROR: Please right-click this file and select "Run as administrator"\\r\\n    pause\\r\\n    exit\\n)\\r\\n\\r\\necho Registering Custom Protocol (nagah-zoomit://)...\\r\\nreg add "HKCR\\\\nagah-zoomit" /ve /t REG_SZ /d "URL:Nagah ZoomIt Protocol" /f >nul\\r\\nreg add "HKCR\\\\nagah-zoomit" /v "URL Protocol" /t REG_SZ /d "" /f >nul\\r\\n\\r\\nset CMD=powershell.exe -WindowStyle Hidden -Command "$u='%%1'; $s=New-Object -ComObject WScript.Shell; if($u -match 'draw'){$s.SendKeys('^{2}')} elseif($u -match 'zoom'){$s.SendKeys('^{1}')} elseif($u -match 'live'){$s.SendKeys('^{4}')} elseif($u -match 'break'){$s.SendKeys('^{3}')}"\\r\\nreg add "HKCR\\\\nagah-zoomit\\\\shell\\\\open\\\\command" /ve /t REG_SZ /d "%CMD%" /f >nul\\r\\n\\r\\necho Integration Successful! You can now use ZoomIt tools directly from the Nagah Platform.\\r\\npause\`;
                  const blob = new Blob([batContent], { type: 'application/bat' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'nagah_zoomit_bridge.bat';
                  a.click();
                  showToast('تم تحميل ملف التفعيل. قم بتشغيله كمسؤول لمرة واحدة فقط.', 'success');
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>تثبيت الربط 🔗</span>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setIsDesktopToolsOpen(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                إغلاق اللوحة
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (!content.includes('isDesktopToolsOpen')) {
  content = content.replace('</ConditionalPopoutWrapper>', modalMarkup + '\n      </ConditionalPopoutWrapper>');
}

fs.writeFileSync(file, content);
console.log('Successfully updated FloatingTeachingToolsOverlay.tsx');
