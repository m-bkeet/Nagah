import fs from 'fs';
let code = fs.readFileSync('src/views/TraineesView.tsx', 'utf-8');

const regex = /if \(res && res\.code\) \{[\s\S]*?setCodeRegenNotice\(`تم تحديث كود الطالب تلقائياً ليتوافق مع \$\{selGrade\}: \(\$\{res\.code\}\)`\);\n\s*\} else \{/;

const replacement = `if (res && res.prefix && res.code) {
        setFormData(prev => {
          const currentCode = prev.code || '';
          const currentPrefix = currentCode.replace(/[0-9]/g, '').toUpperCase().trim();
          
          if (currentPrefix === res.prefix && currentCode.length > res.prefix.length) {
            // Prefix is already correct, do NOT change the number
            setCodeRegenNotice(\`بادئة الكود الحالية (\${currentPrefix}) متوافقة بالفعل مع الصف، لم يتم تغيير التسلسل.\`);
            return {
              ...prev,
              grade: selGrade,
              courseId: matchedCourse ? matchedCourse.id : prev.courseId,
              feeAmount: matchedCourse ? matchedCourse.feeAmount : prev.feeAmount
            };
          } else {
            setCodeRegenNotice(\`تم تحديث كود الطالب تلقائياً ليتوافق مع \${selGrade}: (\${res.code})\`);
            return {
              ...prev,
              grade: selGrade,
              code: res.code,
              courseId: matchedCourse ? matchedCourse.id : prev.courseId,
              feeAmount: matchedCourse ? matchedCourse.feeAmount : prev.feeAmount
            };
          }
        });
      } else if (res && res.code) {
        setFormData(prev => ({
          ...prev,
          grade: selGrade,
          code: res.code,
          courseId: matchedCourse ? matchedCourse.id : prev.courseId,
          feeAmount: matchedCourse ? matchedCourse.feeAmount : prev.feeAmount
        }));
        setCodeRegenNotice(\`تم تحديث كود الطالب تلقائياً ليتوافق مع \${selGrade}: (\${res.code})\`);
      } else {`;

if (!regex.test(code)) {
    console.log("REGEX MATCH FAILED!");
}

code = code.replace(regex, replacement);
fs.writeFileSync('src/views/TraineesView.tsx', code);
console.log("Patched successfully!");
