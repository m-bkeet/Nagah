#!/bin/bash

# Import Button3D at the top
sed -i 's/import { BranchId } from '\'..\/..\/types\/identity\'';/import { BranchId } from '\''..\/..\/types\/identity'\'';\nimport { Button3D } from '\''..\/..\/components\/ui\/Button3D'\'';/' src/features/dashboard/DashboardOverview.tsx

# Replace specific buttons in DashboardOverview.tsx
# "تسجيل متدرب جديد" (Lines ~100)
sed -i 's/<button\n            onClick={() => setShowRegisterModal(true)}\n            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-500\/20 active:scale-95 cursor-pointer"/<Button3D variant="amber" onClick={() => setShowRegisterModal(true)}/g' src/features/dashboard/DashboardOverview.tsx

sed -i 's/<span>تسجيل متدرب جديد<\/span>\n          <\/button>/<span>تسجيل متدرب جديد<\/span>\n          <\/Button3D>/g' src/features/dashboard/DashboardOverview.tsx

# "تحديث البيانات"
sed -i 's/<button\n            onClick={handleRefresh}\n            className="p-2 rounded-xl bg-slate-800\/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700\/80 transition-colors cursor-pointer"\n            title="تحديث البيانات"/<Button3D variant="secondary" onClick={handleRefresh} title="تحديث البيانات" className="!px-3 !py-2.5"/g' src/features/dashboard/DashboardOverview.tsx

sed -i 's/<RotateCw className={`w-4 h-4 ${isRotating ? '\''animate-spin'\'' : '\'''\''}`} \/>\n          <\/button>/<RotateCw className={`w-4 h-4 ${isRotating ? '\''animate-spin'\'' : '\'''\''}`} \/>\n          <\/Button3D>/g' src/features/dashboard/DashboardOverview.tsx

# Modal Student actions
sed -i 's/<button\n                  type="submit"\n                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer shadow-md"\n                >/<Button3D variant="amber" type="submit" fullWidth>/g' src/features/dashboard/DashboardOverview.tsx
sed -i 's/حفظ وتسجيل المتدرب\n                <\/button>/حفظ وتسجيل المتدرب\n                <\/Button3D>/g' src/features/dashboard/DashboardOverview.tsx

sed -i 's/<button\n                  type="button"\n                  onClick={() => setShowRegisterModal(false)}\n                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"\n                >/<Button3D variant="secondary" type="button" onClick={() => setShowRegisterModal(false)}>/g' src/features/dashboard/DashboardOverview.tsx
sed -i 's/إلغاء\n                <\/button>/إلغاء\n                <\/Button3D>/g' src/features/dashboard/DashboardOverview.tsx

# Modal close buttons
sed -i 's/<button\n                onClick={() => setShowRegisterModal(false)}\n                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"\n              >/<Button3D variant="secondary" size="sm" onClick={() => setShowRegisterModal(false)} className="!px-2 !py-2">/g' src/features/dashboard/DashboardOverview.tsx
sed -i 's/<X className="w-4 h-4" \/>\n              <\/button>/<X className="w-4 h-4" \/>\n              <\/Button3D>/g' src/features/dashboard/DashboardOverview.tsx

sed -i 's/<button\n                onClick={() => setShowLabLinkModal(false)}\n                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"\n              >/<Button3D variant="secondary" size="sm" onClick={() => setShowLabLinkModal(false)} className="!px-2 !py-2">/g' src/features/dashboard/DashboardOverview.tsx

# Lab portal modal button
sed -i 's/<button\n                onClick={() => {\n                  setShowLabLinkModal(false);\n                  onNavigateToModule('\''devices'\'');\n                }}\n                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"\n              >/<Button3D variant="indigo" onClick={() => {\n                  setShowLabLinkModal(false);\n                  onNavigateToModule('\''devices'\'');\n                }}>/g' src/features/dashboard/DashboardOverview.tsx
sed -i 's/الانتقال للتحكم في الأجهزة\n              <\/button>/الانتقال للتحكم في الأجهزة\n              <\/Button3D>/g' src/features/dashboard/DashboardOverview.tsx

# Copy lab link button
sed -i 's/<button\n                onClick={handleCopyLabLink}\n                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-sans font-bold flex items-center gap-1 shrink-0 cursor-pointer ml-2"\n              >/<Button3D variant="indigo" size="sm" onClick={handleCopyLabLink} className="ml-2">/g' src/features/dashboard/DashboardOverview.tsx
sed -i 's/<span>{copiedLink ? '\''تم النسخ'\'' : '\''نسخ الرابط'\''}<\/span>\n              <\/button>/<span>{copiedLink ? '\''تم النسخ'\'' : '\''نسخ الرابط'\''}<\/span>\n              <\/Button3D>/g' src/features/dashboard/DashboardOverview.tsx

# Small purple link in card
sed -i 's/<button\n                onClick={(e) => {\n                  e.stopPropagation();\n                  setShowLabLinkModal(true);\n                }}\n                className="px-2.5 py-1 bg-indigo-950\/60 hover:bg-indigo-950 text-indigo-100 hover:text-white border border-indigo-400\/30 rounded-lg text-\[10px\] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"\n              >/<Button3D variant="indigo" size="sm" onClick={(e: any) => {\n                  e.stopPropagation();\n                  setShowLabLinkModal(true);\n                }}>/g' src/features/dashboard/DashboardOverview.tsx
sed -i 's/<Link className="w-3 h-3 text-indigo-300" \/>\n              <\/button>/<Link className="w-3 h-3 text-indigo-300" \/>\n              <\/Button3D>/g' src/features/dashboard/DashboardOverview.tsx

# "عرض الكل" button
sed -i 's/<button className="text-\[10px\] font-bold text-slate-400 hover:text-white transition-colors">\n              عرض الكل\n            <\/button>/<Button3D variant="secondary" size="sm">\n              عرض الكل\n            <\/Button3D>/g' src/features/dashboard/DashboardOverview.tsx

