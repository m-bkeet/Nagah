import { ExamQuestion } from '../types';

export interface ICTCurriculumPackage {
  id: string;
  grade: string;
  subjectName: string;
  language: 'ar' | 'en';
  topics: string[];
  questions: Omit<ExamQuestion, 'examId'>[];
}

export const ICT_CURRICULUM_DATA: ICTCurriculumPackage[] = [
  // ----------------------------------------------------
  // الصف السادس الابتدائي - عربي (منهج وزارة التربية والتعليم المصرية)
  // ----------------------------------------------------
  {
    id: 'ict-primary-6-ar',
    grade: 'الصف السادس الابتدائي',
    subjectName: 'تكنولوجيا المعلومات والاتصالات (ICT)',
    language: 'ar',
    topics: ['أجهزة الشبكات والاتصال', 'الذكاء الاصطناعي والتكنولوجيا المستقبلية', 'الأمن السيبراني والمصادقة', 'تصميم الويب بلغة HTML', 'جداول البيانات Excel'],
    questions: [
      {
        id: 'p6-q1',
        questionType: 'mcq',
        questionText: 'أي من أجهزة الشبكة التالية يقوم بإرسال البيانات إلى جهاز محدد فقط داخل الشبكة لتقليل الازدحام؟',
        options: ['المحول (Switch)', 'المودم (Modem)', 'الموجّه (Router)', 'كابل الإيثرنت (Ethernet)'],
        correctAnswer: 'المحول (Switch)',
        marks: 10,
        explanation: 'المحوّل (Switch) جهاز ذكي يرسل البيانات إلى الجهاز المحدد فقط بناءً على عنوانه، بخلاف الأجهزة التقليدية.'
      },
      {
        id: 'p6-q2',
        questionType: 'mcq',
        questionText: 'يربط جهاز ........... شبكة الكمبيوتر المحلية (LAN) بشبكة الإنترنت العالمية عبر مزود الخدمة (ISP).',
        options: ['المودم (Modem)', 'الشاشة (Monitor)', 'الطابعة (Printer)', 'الماسح الضوئي (Scanner)'],
        correctAnswer: 'المودم (Modem)',
        marks: 10,
        explanation: 'المودم يحول الإشارات من مزود خدمة الإنترنت إلى بيانات رقمية تفهمها أجهزة الكمبيوتر.'
      },
      {
        id: 'p6-q3',
        questionType: 'true_false',
        questionText: 'تتطلب المصادقة متعددة العوامل (MFA) طريقتين على الأقل لتأكيد هوية المستخدم وحماية حسابه من الاختراق.',
        options: ['صح', 'خطأ'],
        correctAnswer: 'صح',
        marks: 10,
        explanation: 'المصادقة متعددة العوامل (MFA) تجمع بين كلمة المرور ورمز يرسل للهاتف أو البصمة لتعزيز الأمان.'
      },
      {
        id: 'p6-q4',
        questionType: 'mcq',
        questionText: 'في لغة ترميز النص التشعبي (HTML)، ما هو الوسم المستخدم لإنشاء أكبر عنوان رئيسي في الصفحة؟',
        options: ['<h1>', '<p>', '<h6>', '<title>'],
        correctAnswer: '<h1>',
        marks: 10,
        explanation: 'الوسم <h1> يمثل العنوان الأكبر والأهم في صفحة الويب، بينما <h6> هو الأصغر.'
      },
      {
        id: 'p6-q5',
        questionType: 'mcq',
        questionText: 'في برنامج جداول البيانات Microsoft Excel، يجب أن تبدأ أي صيغة حسابية أو دالة بعلامة:',
        options: ['=', '+', '*', '#'],
        correctAnswer: '=',
        marks: 10,
        explanation: 'علامة يساوي (=) تخبر البرنامج بأن المدخل التالي هو معادلة حسابية وليس مجرد نص أو رقم عادي.'
      },
      {
        id: 'p6-q6',
        questionType: 'mcq',
        questionText: 'تقنية تُسقط مجسمات ومعلومات افتراضية على العالم الحقيقي الذي نراه أمامنا تسمى:',
        options: ['الواقع المعزز (AR)', 'الواقع الافتراضي (VR)', 'الذكاء الاصطناعي (AI)', 'الحوسبة السحابية'],
        correctAnswer: 'الواقع المعزز (AR)',
        marks: 10,
        explanation: 'الواقع المعزز (Augmented Reality) يدمج العالم الحقيقي مع العناصر الرقمية مثل كاميرا الهاتف.'
      },
      {
        id: 'p6-q7',
        questionType: 'true_false',
        questionText: 'تتيح الحوسبة السحابية (Cloud Computing) تخزين الملفات ومشاركتها والوصول إليها من أي مكان عبر الإنترنت.',
        options: ['صح', 'خطأ'],
        correctAnswer: 'صح',
        marks: 10,
        explanation: 'خدمات التخزين السحابي مثل OneDrive وGoogle Drive تتيح الوصول الآمن للملفات عبر أي جهاز.'
      },
      {
        id: 'p6-q8',
        questionType: 'short_answer',
        questionText: 'ما هو الوسم (Tag) المستخدم في لغة HTML لكتابة فقرة نصية عادية؟',
        options: [],
        correctAnswer: '<p>',
        marks: 10,
        explanation: 'وسم الفقرة النصية في HTML هو <p> اختصاراً لكلمة Paragraph.'
      },
      {
        id: 'p6-q9',
        questionType: 'mcq',
        questionText: 'لحماية حسابك وبياناتك الشخصية، يجب أن تتكون كلمة المرور القوية من:',
        options: ['8 خانات على الأقل تشمل حروفاً كبيرة وصغيرة وأرقاماً ورموزاً', 'اسمك وسنة ميلادك فقط', 'أرقام متسلسلة مثل 12345678', 'رقم الهاتف المحمول'],
        correctAnswer: '8 خانات على الأقل تشمل حروفاً كبيرة وصغيرة وأرقاماً ورموزاً',
        marks: 10,
        explanation: 'كلمات المرور المعقدة المتنوعة تصعّب من تخمينها أو اختراقها عبر برامج التخمين الآلي.'
      },
      {
        id: 'p6-q10',
        questionType: 'mcq',
        questionText: 'في برنامج Excel، تُستخدم الدالة SUM لحساب:',
        options: ['مجموع القيم في نطاق محدد', 'المتوسط الحسابي للقيم', 'أعلى قيمة في الجدول', 'عدد الخلايا الفارغة'],
        correctAnswer: 'مجموع القيم في نطاق محدد',
        marks: 10,
        explanation: 'دالة SUM هي الدالة القياسية لجمع الأرقام في مجموعة من الخلايا المحددة.'
      }
    ]
  },

  // ----------------------------------------------------
  // الصف السادس الابتدائي - لغات (ICT Grade 6 - Language Schools)
  // ----------------------------------------------------
  {
    id: 'ict-primary-6-en',
    grade: 'الصف السادس الابتدائي (لغات)',
    subjectName: 'ICT Grade 6 - Languages',
    language: 'en',
    topics: ['Networking Devices', 'Artificial Intelligence & Future Tech', 'Cybersecurity & MFA', 'Web Design with HTML', 'Excel Formulas'],
    questions: [
      {
        id: 'p6-en-q1',
        questionType: 'mcq',
        questionText: 'Which network device connects a Local Area Network (LAN) to the Internet via an ISP?',
        options: ['Modem', 'Switch', 'Printer', 'Scanner'],
        correctAnswer: 'Modem',
        marks: 10,
        explanation: 'A modem converts signals from an Internet Service Provider (ISP) into digital data that computers understand.'
      },
      {
        id: 'p6-en-q2',
        questionType: 'mcq',
        questionText: 'A device that sends data only to a specific designated destination device on the network is called a:',
        options: ['Switch', 'Hub', 'Modem', 'Power Cable'],
        correctAnswer: 'Switch',
        marks: 10,
        explanation: 'A switch is an intelligent device that delivers network data directly to the intended destination device.'
      },
      {
        id: 'p6-en-q3',
        questionType: 'true_false',
        questionText: 'Multi-Factor Authentication (MFA) requires at least two ways to verify user identity.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        marks: 10,
        explanation: 'MFA strengthens account security by combining a password with a second verification step such as an OTP or fingerprint.'
      },
      {
        id: 'p6-en-q4',
        questionType: 'mcq',
        questionText: 'In HTML coding, which tag is used to create the largest and most prominent heading?',
        options: ['<h1>', '<p>', '<h6>', '<header>'],
        correctAnswer: '<h1>',
        marks: 10,
        explanation: 'The <h1> element represents the highest level heading on an HTML webpage.'
      },
      {
        id: 'p6-en-q5',
        questionType: 'mcq',
        questionText: 'In Microsoft Excel, all mathematical formulas and functions MUST begin with which symbol?',
        options: ['=', '+', '*', '%'],
        correctAnswer: '=',
        marks: 10,
        explanation: 'The equal sign (=) instructs Excel to calculate the expression rather than treating it as plain text.'
      },
      {
        id: 'p6-en-q6',
        questionType: 'mcq',
        questionText: 'Which technology overlays digital 3D models and information onto the real world via mobile camera?',
        options: ['Augmented Reality (AR)', 'Virtual Reality (VR)', 'Artificial Intelligence (AI)', 'Cloud Computing'],
        correctAnswer: 'Augmented Reality (AR)',
        marks: 10,
        explanation: 'Augmented Reality (AR) superimposes virtual objects onto real-world surroundings.'
      },
      {
        id: 'p6-en-q7',
        questionType: 'mcq',
        questionText: 'In HTML, which tag is used to define a regular paragraph of text?',
        options: ['<p>', '<para>', '<text>', '<br>'],
        correctAnswer: '<p>',
        marks: 10,
        explanation: 'The <p> tag defines a paragraph in HTML documents.'
      },
      {
        id: 'p6-en-q8',
        questionType: 'true_false',
        questionText: 'Cloud computing allows users to store, backup, and access files from anywhere via the Internet.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        marks: 10,
        explanation: 'Cloud storage platforms like OneDrive and Google Drive provide ubiquitous access to your files.'
      },
      {
        id: 'p6-en-q9',
        questionType: 'mcq',
        questionText: 'A strong, secure password should contain at least:',
        options: ['8 characters including upper/lower case letters, numbers, and symbols', 'Only your name and birthday', 'Sequential numbers like 12345678', 'Your phone number'],
        correctAnswer: '8 characters including upper/lower case letters, numbers, and symbols',
        marks: 10,
        explanation: 'Complex combinations of characters prevent brute-force attacks and unauthorized access.'
      },
      {
        id: 'p6-en-q10',
        questionType: 'mcq',
        questionText: 'In Microsoft Excel, which function is used to calculate the sum of values across a range of cells?',
        options: ['SUM', 'AVERAGE', 'MAX', 'COUNT'],
        correctAnswer: 'SUM',
        marks: 10,
        explanation: 'The SUM function totals all numbers specified in cell arguments.'
      }
    ]
  },

  // ----------------------------------------------------
  // الصف الرابع والخامس الابتدائي - تكنولوجيا المعلومات والاتصالات
  // ----------------------------------------------------
  {
    id: 'ict-primary-4-5-ar',
    grade: 'الصف الرابع والخامس الابتدائي',
    subjectName: 'تكنولوجيا المعلومات والاتصالات - المبادئ والأساسيات',
    language: 'ar',
    topics: ['مكونات الكمبيوتر', 'وحدات الإدخال والإخراج', 'المستكشف النشط', 'العروض التقديمية PowerPoint', 'الأمان الرقمي والتنمر الإلكتروني'],
    questions: [
      {
        id: 'p45-q1',
        questionType: 'mcq',
        questionText: 'أي من الأجهزة التالية يُعد من وحدات إدخال البيانات إلى جهاز الكمبيوتر؟',
        options: ['لوحة المفاتيح (Keyboard)', 'الشاشة (Monitor)', 'الطابعة (Printer)', 'السماعات (Speakers)'],
        correctAnswer: 'لوحة المفاتيح (Keyboard)',
        marks: 10,
        explanation: 'لوحة المفاتيح تُستخدم لإدخال الحروف والأرقام والأوامر إلى جهاز الكمبيوتر.'
      },
      {
        id: 'p45-q2',
        questionType: 'mcq',
        questionText: 'الوحدة المسؤولة عن إخراج نتائج معالجة البيانات على الورق هي:',
        options: ['الطابعة (Printer)', 'الماسح الضوئي (Scanner)', 'الفأرة (Mouse)', 'الميكروفون (Microphone)'],
        correctAnswer: 'الطابعة (Printer)',
        marks: 10,
        explanation: 'الطابعة هي وحدة إخراج تقوم بطباعة النصوص والصور على الورق.'
      },
      {
        id: 'p45-q3',
        questionType: 'true_false',
        questionText: 'يُعتبر بنك المعرفة المصري (EKB) من المصادر الرقمية الموثوقة والآمنة للبحث عن المعلومات العلمية.',
        options: ['صح', 'خطأ'],
        correctAnswer: 'صح',
        marks: 10,
        explanation: 'بنك المعرفة المصري مكتبة رقمية وطنية موثوقة تقدم مراجع علمية معتمدة لجميع الطلاب والباحثين.'
      },
      {
        id: 'p45-q4',
        questionType: 'mcq',
        questionText: 'البرنامج المخصص لتصميم وإنشاء العروض التقديمية والشرائح التفاعلية هو:',
        options: ['Microsoft PowerPoint', 'Microsoft Excel', 'Notepad', 'Google Chrome'],
        correctAnswer: 'Microsoft PowerPoint',
        marks: 10,
        explanation: 'برنامج PowerPoint يُستخدم لإنشاء عروض تقديمية تتضمن نصوصاً وصوراً ومؤثرات حركية.'
      },
      {
        id: 'p45-q5',
        questionType: 'mcq',
        questionText: 'إذا تعرضت للتنمر أو المضايقة عبر الإنترنت، فإن التصرف الصحيح هو:',
        options: ['إخبار ولي الأمر أو المعلم وحظر الشخص المتنمر', 'الرد عليه بنفس الأسلوب', 'مشاركة بياناتك الشخصية معه', 'التزام الصمت وعدم إخبار أحد'],
        correctAnswer: 'إخبار ولي الأمر أو المعلم وحظر الشخص المتنمر',
        marks: 10,
        explanation: 'يجب دائماً استشارة الكبار الموثوقين وحظر الحساب المتنمر لحماية سلامتك النفسية والرقمية.'
      }
    ]
  },

  // ----------------------------------------------------
  // المرحلة الإعدادية - تكنولوجيا المعلومات والاتصالات
  // ----------------------------------------------------
  {
    id: 'ict-prep-ar',
    grade: 'المرحلة الإعدادية',
    subjectName: 'تكنولوجيا المعلومات والاتصالات - المفاهيم وقواعد البيانات',
    language: 'ar',
    topics: ['البرمجيات وقواعد البيانات', 'حل المشكلات وخرائط التدفق', 'الأمن السيبراني والجرائم الإلكترونية'],
    questions: [
      {
        id: 'prep-q1',
        questionType: 'mcq',
        questionText: 'التمثيل التخطيطي الذي يعتمد على أشكال هندسية قياسية لتوضيح خطوات حل مسألة محددة يُسمى:',
        options: ['خريطة التدفق (Flowchart)', 'قاعدة البيانات (Database)', 'الجدول الحسابي', 'الشفرة المصدرية'],
        correctAnswer: 'خريطة التدفق (Flowchart)',
        marks: 10,
        explanation: 'خرائط التدفق تمثل خطوات الخوارزمية بيانياً باستخدام أشكال هندسية متعارف عليها دولياً.'
      },
      {
        id: 'prep-q2',
        questionType: 'true_false',
        questionText: 'في خرائط التدفق، يُستخدم الشكل البيضاوي (Oval) للتعبير عن نقطة البداية أو النهاية (Start / End).',
        options: ['صح', 'خطأ'],
        correctAnswer: 'صح',
        marks: 10,
        explanation: 'الشكل البيضاوي يُعرف بالرمز الطرفي (Terminal) ويعبر عن بداية أو نهاية الخريطة.'
      },
      {
        id: 'prep-q3',
        questionType: 'mcq',
        questionText: 'أي البرمجيات التالية يُستخدم لإدارة وتنظيم قواعد البيانات العلائقية الضخمة؟',
        options: ['Microsoft Access / SQL', 'Paint الرسام', 'Calculator الآلة الحاسبة', 'VLC Media Player'],
        correctAnswer: 'Microsoft Access / SQL',
        marks: 10,
        explanation: 'أنظمة إدارة قواعد البيانات (DBMS) مثل Access و SQL متخصصة في حفظ واستعلام كميات ضخمة من البيانات المنظمة.'
      }
    ]
  }
];

export function getCurriculumExamQuestions(grade?: string, language: 'ar' | 'en' = 'ar', examId: string = 'exam-demo'): ExamQuestion[] {
  let targetPkg = ICT_CURRICULUM_DATA.find(pkg => {
    if (language === 'en') return pkg.language === 'en';
    if (grade && grade.includes('سادس')) return pkg.id === 'ict-primary-6-ar';
    if (grade && (grade.includes('رابع') || grade.includes('خامس'))) return pkg.id === 'ict-primary-4-5-ar';
    if (grade && grade.includes('إعدادي')) return pkg.id === 'ict-prep-ar';
    return pkg.id === 'ict-primary-6-ar';
  });

  if (!targetPkg) {
    targetPkg = ICT_CURRICULUM_DATA[0];
  }

  return targetPkg.questions.map((q, idx) => ({
    ...q,
    id: `q-${examId}-${idx + 1}`,
    examId
  }));
}
