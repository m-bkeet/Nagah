const fs = require('fs');

let content = fs.readFileSync('src/features/students/StudentDomainView.tsx', 'utf8');

const oldFooterRegex = /<button className="w-7 h-7 rounded-lg bg-rose-950\/40 border border-rose-900\/50 hover:bg-rose-900 flex items-center justify-center text-rose-500 transition-colors cursor-pointer" title="حذف">\s*<Trash2 className="w-3\.5 h-3\.5" \/>\s*<\/button>\s*<button className="w-7 h-7 rounded-lg bg-blue-950\/40 border border-blue-900\/50 hover:bg-blue-900 flex items-center justify-center text-blue-400 transition-colors cursor-pointer" title="تعديل">\s*<Edit className="w-3\.5 h-3\.5" \/>\s*<\/button>/;

const newFooter = `<button onClick={() => handleDeleteSingle(st.id, st.name)} className="w-7 h-7 rounded-lg bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900 flex items-center justify-center text-rose-500 transition-colors cursor-pointer" title="حذف">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => alert(\`تعديل بيانات: \${st.name}\`)} className="w-7 h-7 rounded-lg bg-blue-950/40 border border-blue-900/50 hover:bg-blue-900 flex items-center justify-center text-blue-400 transition-colors cursor-pointer" title="تعديل">
                    <Edit className="w-3.5 h-3.5" />
                  </button>`;

content = content.replace(oldFooterRegex, newFooter);
fs.writeFileSync('src/features/students/StudentDomainView.tsx', content);
