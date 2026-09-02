import fs from 'fs';
let code = fs.readFileSync('src/views/TraineesView.tsx', 'utf-8');

code = code.replace(
/const discVal = Math\.round\(\(formData\.feeAmount \|\| 0\) \* 0\.2\); \/\/ 20% خصم الأخوات\n\s*setFormData\(\(prev: any\) => \(\{\n\s*\.\.\.prev,\n\s*discountAmount: discVal,\n\s*siblingIds: sibs\.map\(\(s\) => s\.id\),\n\s*siblingNames: sibs\.map\(\(s\) => s\.fullName\),\n\s*notes:\n\s*\(prev\.notes \? prev\.notes \+ ' \| ' : ''\) \+\n\s*\`ربط إخوة مع \(\$\{sibs\.map\(\(s\) => \`\$\{s\.fullName\} - \$\{s\.code\}\`\)\.join\('، '\)\}\) - تم تطبيق خصم الأخوات\`\n\s*\}\)\);\n\s*showToast\('تم ربط الأخوات وتطبيق الخصم 20% بنجاح!', 'success'\);/g,
`const isBadr = formData.branchId === 'branch-2' || String(formData.branchId || '').toLowerCase().includes('badr');
                      const discVal = isBadr ? Math.round((formData.feeAmount || 0) * 0.1) : 0;
                      setFormData((prev: any) => ({
                        ...prev,
                        discountAmount: discVal,
                        siblingIds: sibs.map((s) => s.id),
                        siblingNames: sibs.map((s) => s.fullName),
                        notes:
                          (prev.notes ? prev.notes + ' | ' : '') +
                          \`ربط إخوة مع (\${sibs.map((s) => \`\${s.fullName} - \${s.code}\`).join('، ')})\` + (isBadr ? ' - تم تطبيق خصم 10% لفرع بدر' : ' - بدون خصم إضافي لفرع النجاح')
                      }));
                      showToast(isBadr ? 'تم ربط الإخوة وتطبيق خصم 10% (فرع بدر) بنجاح!' : 'تم ربط الإخوة بنجاح (بدون خصم تلقائي لفرع النجاح، يرجى التحديد يدوياً إن لزم)', 'success');`
);

fs.writeFileSync('src/views/TraineesView.tsx', code);
console.log("Siblings logic patched!");
