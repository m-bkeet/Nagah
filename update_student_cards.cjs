const fs = require('fs');

let content = fs.readFileSync('src/features/students/StudentDomainView.tsx', 'utf8');

// Replace the avatar div in cards view
const oldAvatarRegex = /<div className=\{\`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0 shadow-lg \$\{\s*st\.gender === 'FEMALE' \? 'bg-amber-500 text-slate-900' : 'bg-amber-500 text-slate-900'\s*\}\`\}>\s*\{st\.avatarChar\}\s*<\/div>/s;

const newAvatar = `<div className="relative shrink-0">
                    <img 
                      src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${st.id}&backgroundColor=0b1120&clothing=blazerAndShirt\`}
                      alt={st.name}
                      className="w-14 h-14 rounded-2xl border border-slate-700 bg-slate-900 shadow-lg"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#131b2f] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-[#131b2f] stroke-[4]" />
                    </span>
                  </div>`;

content = content.replace(oldAvatarRegex, newAvatar);
fs.writeFileSync('src/features/students/StudentDomainView.tsx', content);

