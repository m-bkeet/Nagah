/**
 * NAGAH MS - Official Ministry of Education (MOE) Curricula Registry
 * Updated for Academic Years 2025/2026/2027
 * Covers ICT, Computer Science & AI for Primary (4, 5, 6), Preparatory (1, 2, 3) and Secondary (1)
 */

export interface LessonItem {
  id: string;
  lessonNumber: number;
  titleAr: string;
  titleEn: string;
  conceptAr?: string;
  unitNumber: number;
  unitTitleAr: string;
  unitTitleEn: string;
  term: 1 | 2;
}

export interface UnitItem {
  unitNumber: number;
  unitTitleAr: string;
  unitTitleEn: string;
  term: 1 | 2;
  lessons: LessonItem[];
}

export interface GradeCurriculum {
  gradeKey: 'grade4' | 'grade5' | 'grade6' | 'prep1' | 'prep2' | 'prep3' | 'sec1';
  gradeCodePrefix: string; // 'A', 'B', 'C', 'D', 'E', 'F', 'G'
  gradeNameAr: string;
  gradeNameEn: string;
  stageAr: string;
  subjectNameAr: string;
  subjectNameEn: string;
  terms: {
    term1: {
      units: UnitItem[];
    };
    term2: {
      units: UnitItem[];
    };
  };
}

export const MOE_CURRICULA: Record<string, GradeCurriculum> = {
  // -------------------------------------------------------------
  // GRADE 4 - الصف الرابع الابتدائي (رمز الكود A)
  // -------------------------------------------------------------
  grade4: {
    gradeKey: 'grade4',
    gradeCodePrefix: 'A',
    gradeNameAr: 'الصف الرابع الابتدائي',
    gradeNameEn: 'Grade 4 (Primary 4)',
    stageAr: 'المرحلة الابتدائية',
    subjectNameAr: 'تكنولوجيا المعلومات والاتصالات (ICT)',
    subjectNameEn: 'Information and Communications Technology (ICT)',
    terms: {
      term1: {
        units: [
          {
            unitNumber: 1,
            unitTitleAr: 'الوحدة الأولى: دور تكنولوجيا المعلومات في حياتنا',
            unitTitleEn: 'Unit 1: The Role of ICT in Our Lives',
            term: 1,
            lessons: [
              { id: 'g4_t1_u1_l1', lessonNumber: 1, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 1: المستكشف النشط (ألبرت لين)', titleEn: 'Lesson 1: Explorer in Action (Albert Lin)' },
              { id: 'g4_t1_u1_l2', lessonNumber: 2, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 2: التكنولوجيا وتطورها التاريخي', titleEn: 'Lesson 2: Technology & Historical Evolution' },
              { id: 'g4_t1_u1_l3', lessonNumber: 3, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 3: مكونات جهاز الكمبيوتر', titleEn: 'Lesson 3: Computer Components' },
              { id: 'g4_t1_u1_l4', lessonNumber: 4, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 4: البرمجيات وأنظمة التشغيل', titleEn: 'Lesson 4: Software & Operating Systems' },
              { id: 'g4_t1_u1_l5', lessonNumber: 5, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 5: جمع البيانات وتحليلها والتعبير عنها برسم بياني', titleEn: 'Lesson 5: Collecting, Analyzing Data & Graphs' },
              { id: 'g4_t1_u1_l6', lessonNumber: 6, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 6: مشكلات شائعة لتكنولوجيا المعلومات والحلول', titleEn: 'Lesson 6: Common ICT Problems & Solutions' },
              { id: 'g4_t1_u1_l7', lessonNumber: 7, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 7: تكنولوجيا المعلومات والاتصالات وخطة جمع البيانات', titleEn: 'Lesson 7: ICT Data Collection Plans' },
              { id: 'g4_t1_u1_l8', lessonNumber: 8, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 8: إعداد التقارير لنتائج الأبحاث', titleEn: 'Lesson 8: Reporting Research Findings' }
            ]
          },
          {
            unitNumber: 2,
            unitTitleAr: 'الوحدة الثانية: احتياطات السلامة الرقمية وحماية البيانات',
            unitTitleEn: 'Unit 2: Digital Safety & Security',
            term: 1,
            lessons: [
              { id: 'g4_t1_u2_l1', lessonNumber: 1, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 1: المستكشف النشط (أنيكا إيه)', titleEn: 'Lesson 1: Explorer in Action (Anika Ih)' },
              { id: 'g4_t1_u2_l2', lessonNumber: 2, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 2: المخاطر المرتبطة بشبكة الإنترنت ووسائل الأمان', titleEn: 'Lesson 2: Internet Risks & Safe Communication' },
              { id: 'g4_t1_u2_l3', lessonNumber: 3, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 3: استخدام أدوات تكنولوجيا المعلومات بطريقة صحيحة وأخلاقية', titleEn: 'Lesson 3: Using ICT Tools Ethically' },
              { id: 'g4_t1_u2_l4', lessonNumber: 4, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 4: كيفية البحث على شبكة الإنترنت وتدقيق المعلومات', titleEn: 'Lesson 4: Effective Internet Search' },
              { id: 'g4_t1_u2_l5', lessonNumber: 5, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 5: كيفية التأكد من صدق وصحة المعلومات', titleEn: 'Lesson 5: Verifying Online Information' },
              { id: 'g4_t1_u2_l6', lessonNumber: 6, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 6: أصحاب الحسابات على الإنترنت وتجنب الاحتيال', titleEn: 'Lesson 6: Online Identity & Phishing' },
              { id: 'g4_t1_u2_l7', lessonNumber: 7, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 7: خطة شخصية للأمان الرقمي', titleEn: 'Lesson 7: Personal Digital Security Plan' },
              { id: 'g4_t1_u2_l8', lessonNumber: 8, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 8: تطبيق عملي: مشروع العرض التقديمي النهائي', titleEn: 'Lesson 8: Final Presentation Project' }
            ]
          }
        ]
      },
      term2: {
        units: [
          {
            unitNumber: 3,
            unitTitleAr: 'الوحدة الثالثة: المواطنة الرقمية والاتصال عبر الإنترنت',
            unitTitleEn: 'Unit 3: Digital Citizenship & Online Communication',
            term: 2,
            lessons: [
              { id: 'g4_t2_u3_l1', lessonNumber: 1, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 1: المستكشف النشط (وليام تاينر)', titleEn: 'Lesson 1: Explorer in Action (William Tyner)' },
              { id: 'g4_t2_u3_l2', lessonNumber: 2, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 2: المواطنة الرقمية وحقوق وواجبات المواطن الرقمي', titleEn: 'Lesson 2: Digital Citizenship Rights & Duties' },
              { id: 'g4_t2_u3_l3', lessonNumber: 3, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 3: الآثار الإيجابية لتكنولوجيا المعلومات في حياتنا', titleEn: 'Lesson 3: Positive Impacts of ICT' },
              { id: 'g4_t2_u3_l4', lessonNumber: 4, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 4: أدوات التواصل المتزامن وغير المتزامن', titleEn: 'Lesson 4: Synchronous vs Asynchronous Communication' },
              { id: 'g4_t2_u3_l5', lessonNumber: 5, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 5: استخدام بيئات التعلم الرقمية وبنك المعرفة المصري EKB', titleEn: 'Lesson 5: Digital Learning Environments & EKB' },
              { id: 'g4_t2_u3_l6', lessonNumber: 6, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 6: التخطيط لبحث رقمي موثوق', titleEn: 'Lesson 6: Planning Digital Research' }
            ]
          },
          {
            unitNumber: 4,
            unitTitleAr: 'الوحدة الرابعة: مشروعات برمجية وتطبيقات رقمية',
            unitTitleEn: 'Unit 4: Digital Software & Projects',
            term: 2,
            lessons: [
              { id: 'g4_t2_u4_l1', lessonNumber: 1, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 1: المستكشف النشط (غوتام شاه)', titleEn: 'Lesson 1: Explorer in Action (Gautam Shah)' },
              { id: 'g4_t2_u4_l2', lessonNumber: 2, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 2: مهارات حل المشكلات والتفكير الخوارزمي', titleEn: 'Lesson 2: Problem Solving & Algorithmic Thinking' },
              { id: 'g4_t2_u4_l3', lessonNumber: 3, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 3: تقديم وتنسيق المعلومات بطريقة جذابة', titleEn: 'Lesson 3: Presenting Information Graphically' },
              { id: 'g4_t2_u4_l4', lessonNumber: 4, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 4: مقدمة إلى البرمجة والأوامر الرقمية (Scratch / Code.org)', titleEn: 'Lesson 4: Introduction to Coding Blocks' },
              { id: 'g4_t2_u4_l5', lessonNumber: 5, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 5: تصميم ملصق إعلاني وعرض تقديمي تفاعلي', titleEn: 'Lesson 5: Designing Digital Posters & Slides' },
              { id: 'g4_t2_u4_l6', lessonNumber: 6, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 6: المشروع النهائي التكاملي', titleEn: 'Lesson 6: Final Integrated Capstone Project' }
            ]
          }
        ]
      }
    }
  },

  // -------------------------------------------------------------
  // GRADE 5 - الصف الخامس الابتدائي (رمز الكود B)
  // -------------------------------------------------------------
  grade5: {
    gradeKey: 'grade5',
    gradeCodePrefix: 'B',
    gradeNameAr: 'الصف الخامس الابتدائي',
    gradeNameEn: 'Grade 5 (Primary 5)',
    stageAr: 'المرحلة الابتدائية',
    subjectNameAr: 'تكنولوجيا المعلومات والاتصالات (ICT)',
    subjectNameEn: 'Information and Communications Technology (ICT)',
    terms: {
      term1: {
        units: [
          {
            unitNumber: 1,
            unitTitleAr: 'الوحدة الأولى: دور تكنولوجيا المعلومات في حياتنا اليومية',
            unitTitleEn: 'Unit 1: ICT in Daily Life',
            term: 1,
            lessons: [
              { id: 'g5_t1_u1_l1', lessonNumber: 1, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 1: المستكشف النشط (فريد هيبرت)', titleEn: 'Lesson 1: Explorer in Action (Fred Hiebert)' },
              { id: 'g5_t1_u1_l2', lessonNumber: 2, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 2: الأدوات والملحقات الرقمية (الأقراص الصلبة، الفلاشة، كابل الإيثرنت)', titleEn: 'Lesson 2: Digital Devices & Accessories' },
              { id: 'g5_t1_u1_l3', lessonNumber: 3, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 3: الشبكات ومفاهيم الإنترنت والإنترانت (Internet & Intranet)', titleEn: 'Lesson 3: Computer Networks & Intranet' },
              { id: 'g5_t1_u1_l4', lessonNumber: 4, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 4: أدوات التواصل الرقمي والعمل الجماعي', titleEn: 'Lesson 4: Digital Collaboration Tools' },
              { id: 'g5_t1_u1_l5', lessonNumber: 5, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 5: إدارة الملفات والمجلدات وتنظيم البيانات', titleEn: 'Lesson 5: Digital File Management' },
              { id: 'g5_t1_u1_l6', lessonNumber: 6, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 6: استراتيجيات البحث عن المعلومات وحل المشكلات', titleEn: 'Lesson 6: Information Search Strategies' },
              { id: 'g5_t1_u1_l7', lessonNumber: 7, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 7: تجميع وتنظيم البيانات باستخدام جداول Excel', titleEn: 'Lesson 7: Data Organization with Excel' },
              { id: 'g5_t1_u1_l8', lessonNumber: 8, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 8: إعداد ومشاركة التقارير الرقمية', titleEn: 'Lesson 8: Sharing Digital Reports' }
            ]
          },
          {
            unitNumber: 2,
            unitTitleAr: 'الوحدة الثانية: احتياطات الأمن الرقمي والسلامة السيبرانية',
            unitTitleEn: 'Unit 2: Digital Security & Cybersecurity',
            term: 1,
            lessons: [
              { id: 'g5_t1_u2_l1', lessonNumber: 1, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 1: المستكشف النشط (جينجر روجرز)', titleEn: 'Lesson 1: Explorer in Action (Ginger Rogers)' },
              { id: 'g5_t1_u2_l2', lessonNumber: 2, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 2: حماية أنفسنا ومعلوماتنا وكلمات المرور القوية', titleEn: 'Lesson 2: Protecting Personal Data & Passwords' },
              { id: 'g5_t1_u2_l3', lessonNumber: 3, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 3: سرقة الهوية ومحاولات التصيد الاحتيالي (Phishing & Smishing)', titleEn: 'Lesson 3: Identity Theft & Phishing' },
              { id: 'g5_t1_u2_l4', lessonNumber: 4, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 4: كيفية التعامل مع المواقع والمصادر الإلكترونية المشبوهة', titleEn: 'Lesson 4: Dealing with Scam Websites' },
              { id: 'g5_t1_u2_l5', lessonNumber: 5, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 5: حقوق الملكية الفكرية وقوانين النشر الرقمي', titleEn: 'Lesson 5: Intellectual Property & Copyright' },
              { id: 'g5_t1_u2_l6', lessonNumber: 6, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 6: استخدام المصادر الرقمية والتوثيق الأكاديمي', titleEn: 'Lesson 6: Using Digital Sources & Documentation' },
              { id: 'g5_t1_u2_l7', lessonNumber: 7, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 7: عمليات البحث المتقدمة وتصفية النتائج', titleEn: 'Lesson 7: Advanced Online Search' },
              { id: 'g5_t1_u2_l8', lessonNumber: 8, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 8: توثيق المعلومات وعرض نتائج البحث', titleEn: 'Lesson 8: Documenting & Presenting Research' }
            ]
          }
        ]
      },
      term2: {
        units: [
          {
            unitNumber: 3,
            unitTitleAr: 'الوحدة الثالثة: المواطنة الرقمية والتجارة الإلكترونية',
            unitTitleEn: 'Unit 3: Digital Citizenship & E-Commerce',
            term: 2,
            lessons: [
              { id: 'g5_t2_u3_l1', lessonNumber: 1, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 1: المستكشف النشط (بيكن هيدجز)', titleEn: 'Lesson 1: Explorer in Action (Beckin Hedges)' },
              { id: 'g5_t2_u3_l2', lessonNumber: 2, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 2: المواطنة الرقمية والمسؤولية الاجتماعية', titleEn: 'Lesson 2: Digital Citizenship & Social Responsibility' },
              { id: 'g5_t2_u3_l3', lessonNumber: 3, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 3: التواصل الفعال عبر الإنترنت وآداب الحوار الرقمي', titleEn: 'Lesson 3: Effective Online Communication' },
              { id: 'g5_t2_u3_l4', lessonNumber: 4, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 4: المواقع التجارية وغير التجارية والمراجعات الرقمية', titleEn: 'Lesson 4: Commercial vs Non-Commercial Sites' },
              { id: 'g5_t2_u3_l5', lessonNumber: 5, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 5: خدمات وحماية المستهلك الرقمي', titleEn: 'Lesson 5: Digital Consumer Rights' },
              { id: 'g5_t2_u3_l6', lessonNumber: 6, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 6: إنشاء صفحة ويب بسيطة باستخدام لغة HTML', titleEn: 'Lesson 6: Simple Webpage with HTML' }
            ]
          },
          {
            unitNumber: 4,
            unitTitleAr: 'الوحدة الرابعة: مشروعات برمجية وخوارزميات تفاعلية',
            unitTitleEn: 'Unit 4: Coding & Algorithmic Projects',
            term: 2,
            lessons: [
              { id: 'g5_t2_u4_l1', lessonNumber: 1, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 1: المستكشف النشط (د. دييغو بونس)', titleEn: 'Lesson 1: Explorer in Action (Dr. Diego Ponce)' },
              { id: 'g5_t2_u4_l2', lessonNumber: 2, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 2: جمع البيانات وتنسيقها وعرضها برمجياً', titleEn: 'Lesson 2: Data Collection & Algorithmic Formatting' },
              { id: 'g5_t2_u4_l3', lessonNumber: 3, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 3: مقدمة إلى الخوارزميات والمنطق البرمجي', titleEn: 'Lesson 3: Introduction to Algorithms' },
              { id: 'g5_t2_u4_l4', lessonNumber: 4, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 4: برمجة الألعاب والمشاريع ببرنامج Scratch', titleEn: 'Lesson 4: Game Programming with Scratch' },
              { id: 'g5_t2_u4_l5', lessonNumber: 5, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 5: أدوات معالجة النصوص المتقدمة والعروض التفاعلية', titleEn: 'Lesson 5: Advanced Presentation Tools' },
              { id: 'g5_t2_u4_l6', lessonNumber: 6, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 6: المشروع التعاوني البرمجي النهائي', titleEn: 'Lesson 6: Final Collaborative Coding Project' }
            ]
          }
        ]
      }
    }
  },

  // -------------------------------------------------------------
  // GRADE 6 - الصف السادس الابتدائي (رمز الكود C)
  // -------------------------------------------------------------
  grade6: {
    gradeKey: 'grade6',
    gradeCodePrefix: 'C',
    gradeNameAr: 'الصف السادس الابتدائي',
    gradeNameEn: 'Grade 6 (Primary 6)',
    stageAr: 'المرحلة الابتدائية',
    subjectNameAr: 'تكنولوجيا المعلومات والاتصالات (ICT)',
    subjectNameEn: 'Information and Communications Technology (ICT)',
    terms: {
      term1: {
        units: [
          {
            unitNumber: 1,
            unitTitleAr: 'الوحدة الأولى: شبكات الحاسوب وأدوات الذكاء الاصطناعي',
            unitTitleEn: 'Unit 1: Computer Networks & AI Tools',
            term: 1,
            lessons: [
              { id: 'g6_t1_u1_l1', lessonNumber: 1, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 1: المستكشف النشط (كارتيك ساو هني)', titleEn: 'Lesson 1: Explorer in Action (Kartik Sawhney)' },
              { id: 'g6_t1_u1_l2', lessonNumber: 2, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 2: تصميم وتوصيل شبكات الحاسوب (Modem, Switch, Router, Hub)', titleEn: 'Lesson 2: Computer Network Devices & Setup' },
              { id: 'g6_t1_u1_l3', lessonNumber: 3, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 3: التكنولوجيا المساعدة والتقنيات الحديثة لدمج ذوي الهمم', titleEn: 'Lesson 3: Assistive Technologies & Innovation' },
              { id: 'g6_t1_u1_l4', lessonNumber: 4, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 4: تطبيقات الذكاء الاصطناعي (AI) والواقع الافتراضي (VR) والمعزز (AR)', titleEn: 'Lesson 4: AI, Virtual Reality & Augmented Reality' },
              { id: 'g6_t1_u1_l5', lessonNumber: 5, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 5: مهارات البحث المتقدمة وتدقيق المحتوى الرقمي', titleEn: 'Lesson 5: Advanced Search & Fact-Checking' },
              { id: 'g6_t1_u1_l6', lessonNumber: 6, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 6: الأجهزة المحمولة وأنظمة التشغيل الذكية (Android, iOS)', titleEn: 'Lesson 6: Mobile Devices & Mobile Operating Systems' },
              { id: 'g6_t1_u1_l7', lessonNumber: 7, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 7: أنظمة التشغيل للحواسيب (Windows, macOS, Linux)', titleEn: 'Lesson 7: Desktop Operating Systems' },
              { id: 'g6_t1_u1_l8', lessonNumber: 8, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 8: تصميم وبرمجة صفحات الويب بلغة HTML', titleEn: 'Lesson 8: Designing Webpages with HTML' }
            ]
          },
          {
            unitNumber: 2,
            unitTitleAr: 'الوحدة الثانية: احتياطات الأمان السيبراني والأمن الرقمي',
            unitTitleEn: 'Unit 2: Cybersecurity & Digital Safety',
            term: 1,
            lessons: [
              { id: 'g6_t1_u2_l1', lessonNumber: 1, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 1: المستكشف النشط (ميريديث هويت)', titleEn: 'Lesson 1: Explorer in Action (Meredith Hoyt)' },
              { id: 'g6_t1_u2_l2', lessonNumber: 2, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 2: التهديدات السيبرانية وأنواع الفيروسات والبرمجيات الخبيثة (Malware)', titleEn: 'Lesson 2: Cyber Threats & Malware Types' },
              { id: 'g6_t1_u2_l3', lessonNumber: 3, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 3: أمن البيانات وطرق المصادقة متعددة العوامل (MFA / 2FA)', titleEn: 'Lesson 3: Multi-Factor Authentication & Data Protection' },
              { id: 'g6_t1_u2_l4', lessonNumber: 4, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 4: الأمن السيبراني وحماية الأجهزة الشخصية وشبكات الواي فاي', titleEn: 'Lesson 4: Device & Wi-Fi Cybersecurity' },
              { id: 'g6_t1_u2_l5', lessonNumber: 5, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 5: حقوق النشر الرقمية ورخص المشاع الإبداعي (Creative Commons)', titleEn: 'Lesson 5: Digital Copyright & Creative Commons' },
              { id: 'g6_t1_u2_l6', lessonNumber: 6, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 6: أدوات حماية الخصوصية الرقمية وإدارة الهوية', titleEn: 'Lesson 6: Privacy Protection & Digital Identity' },
              { id: 'g6_t1_u2_l7', lessonNumber: 7, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 7: البحث الأكاديمي الموثوق وقواعد البيانات الرقمية', titleEn: 'Lesson 7: Academic Databases & Trusted Search' },
              { id: 'g6_t1_u2_l8', lessonNumber: 8, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 8: العرض التقديمي النهائي وإدارة المشاريع الرقمية', titleEn: 'Lesson 8: Final Project Presentation & Management' }
            ]
          }
        ]
      },
      term2: {
        units: [
          {
            unitNumber: 3,
            unitTitleAr: 'الوحدة الثالثة: البرمجة والتطوير الرقمي والذكاء الاصطناعي التوليدي',
            unitTitleEn: 'Unit 3: Coding & Generative AI',
            term: 2,
            lessons: [
              { id: 'g6_t2_u3_l1', lessonNumber: 1, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 1: المستكشف النشط (كيني كوان)', titleEn: 'Lesson 1: Explorer in Action (Kenny Kwan)' },
              { id: 'g6_t2_u3_l2', lessonNumber: 2, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 2: لغات البرمجة وبناء وتنسيق المواقع (HTML & CSS)', titleEn: 'Lesson 2: Web Programming with HTML & CSS' },
              { id: 'g6_t2_u3_l3', lessonNumber: 3, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 3: البرمجة الخوارزمية وحل المشكلات المعقدة', titleEn: 'Lesson 3: Algorithmic Coding & Problem Solving' },
              { id: 'g6_t2_u3_l4', lessonNumber: 4, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 4: الذكاء الاصطناعي التوليدي وتطبيقاته التعليمية', titleEn: 'Lesson 4: Generative AI in Learning & Ethics' },
              { id: 'g6_t2_u3_l5', lessonNumber: 5, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 5: إنتاج الوسائط المتعددة والمحتوى الرقمي التفاعلي', titleEn: 'Lesson 5: Interactive Multimedia Production' },
              { id: 'g6_t2_u3_l6', lessonNumber: 6, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 6: أمن البيانات السحابية والتخزين السحابي (Cloud Storage)', titleEn: 'Lesson 6: Cloud Storage & Cloud Security' }
            ]
          },
          {
            unitNumber: 4,
            unitTitleAr: 'الوحدة الرابعة: تكنولوجيا المستقبل وإنترنت الأشياء والمدن الذكية',
            unitTitleEn: 'Unit 4: Future Technologies & IoT',
            term: 2,
            lessons: [
              { id: 'g6_t2_u4_l1', lessonNumber: 1, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 1: المستكشف النشط (د. مريم مطر)', titleEn: 'Lesson 1: Explorer in Action (Dr. Maryam Matar)' },
              { id: 'g6_t2_u4_l2', lessonNumber: 2, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 2: أجهزة إنترنت الأشياء (IoT) والمدن الذكية والمستشعرات', titleEn: 'Lesson 2: Internet of Things (IoT) & Smart Sensors' },
              { id: 'g6_t2_u4_l3', lessonNumber: 3, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 3: مفاهيم البيانات الضخمة (Big Data) ومعالجتها', titleEn: 'Lesson 3: Big Data Fundamentals' },
              { id: 'g6_t2_u4_l4', lessonNumber: 4, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 4: الروبوتات والتحكم الآلي والأنظمة المدمجة', titleEn: 'Lesson 4: Robotics & Automated Systems' },
              { id: 'g6_t2_u4_l5', lessonNumber: 5, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 5: ريادة الأعمال الرقمية والتسويق الإلكتروني', titleEn: 'Lesson 5: Digital Entrepreneurship' },
              { id: 'g6_t2_u4_l6', lessonNumber: 6, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 6: معرض الابتكار والمشروع الرقمي الشامل', titleEn: 'Lesson 6: Comprehensive Innovation Showcase' }
            ]
          }
        ]
      }
    }
  },

  // -------------------------------------------------------------
  // PREP 1 (GRADE 7) - الصف الأول الإعدادي (رمز الكود D - مثل طالبة دارين D015)
  // المنهج المعتمد رسمياً والمطور من وزارة التربية والتعليم للعام الدراسي 2024 / 2025 / 2026
  // -------------------------------------------------------------
  prep1: {
    gradeKey: 'prep1',
    gradeCodePrefix: 'D',
    gradeNameAr: 'الصف الأول الإعدادي',
    gradeNameEn: '1st Preparatory (Grade 7)',
    stageAr: 'المرحلة الإعدادية',
    subjectNameAr: 'تكنولوجيا المعلومات والاتصالات والحاسب الآلي والذكاء الاصطناعي',
    subjectNameEn: 'Computer Science, ICT & AI (Prep 1)',
    terms: {
      term1: {
        units: [
          {
            unitNumber: 1,
            unitTitleAr: 'المحور الأول: التكنولوجيا الخضراء والتحول الرقمي وأنظمة التشغيل',
            unitTitleEn: 'Unit 1: Green Tech, Digital Transformation & OS',
            term: 1,
            lessons: [
              { id: 'p1_t1_u1_l1', lessonNumber: 1, unitNumber: 1, term: 1, unitTitleAr: 'المحور الأول', unitTitleEn: 'Unit 1', titleAr: 'الدرس 1: التكنولوجيا الخضراء (Green Technology) ومفهومها وأهميتها في الاستدامة', titleEn: 'Lesson 1: Green Technology & Environmental Sustainability' },
              { id: 'p1_t1_u1_l2', lessonNumber: 2, unitNumber: 1, term: 1, unitTitleAr: 'المحور الأول', unitTitleEn: 'Unit 1', titleAr: 'الدرس 2: التحول الرقمي (Digital Transformation) وتطبيقاته في المجتمع', titleEn: 'Lesson 2: Digital Transformation & Applications' },
              { id: 'p1_t1_u1_l3', lessonNumber: 3, unitNumber: 1, term: 1, unitTitleAr: 'المحور الأول', unitTitleEn: 'Unit 1', titleAr: 'الدرس 3: أنظمة التشغيل (Operating Systems: Windows, Android, Linux, iOS) وإدارتها', titleEn: 'Lesson 3: Operating Systems Types & Functions' },
              { id: 'p1_t1_u1_l4', lessonNumber: 4, unitNumber: 1, term: 1, unitTitleAr: 'المحور الأول', unitTitleEn: 'Unit 1', titleAr: 'الدرس 4: تثبيت وإلغاء تثبيت البرامج وإدارة الأجهزة والملحقات الرقمية', titleEn: 'Lesson 4: Software & Hardware Devices Management' },
              { id: 'p1_t1_u1_l5', lessonNumber: 5, unitNumber: 1, term: 1, unitTitleAr: 'المحور الأول', unitTitleEn: 'Unit 1', titleAr: 'الدرس 5: البريد الإلكتروني (Email) والحساب المدرسي الموحد واستخدامه باحترافية', titleEn: 'Lesson 5: Professional Email & Unified Accounts' }
            ]
          },
          {
            unitNumber: 2,
            unitTitleAr: 'المحور الثاني: الحوسبة السحابية وقواعد البيانات والمشروعات الرقمية',
            unitTitleEn: 'Unit 2: Cloud Computing, Databases & Digital Projects',
            term: 1,
            lessons: [
              { id: 'p1_t1_u2_l1', lessonNumber: 6, unitNumber: 2, term: 1, unitTitleAr: 'المحور الثاني', unitTitleEn: 'Unit 2', titleAr: 'الدرس 6: الحوسبة السحابية (Cloud Computing) وخدمات التخزين السحابي (Google Drive, OneDrive)', titleEn: 'Lesson 6: Cloud Computing & Cloud Storage' },
              { id: 'p1_t1_u2_l2', lessonNumber: 7, unitNumber: 2, term: 1, unitTitleAr: 'المحور الثاني', unitTitleEn: 'Unit 2', titleAr: 'الدرس 7: الاجتماعات الافتراضية بـ Google Meet وإدارة المشروعات الرقمية', titleEn: 'Lesson 7: Google Meet & Digital Project Management' },
              { id: 'p1_t1_u2_l3', lessonNumber: 8, unitNumber: 2, term: 1, unitTitleAr: 'المحور الثاني', unitTitleEn: 'Unit 2', titleAr: 'الدرس 8: تصميم قواعد البيانات (Database Design: الجداول، النماذج، الاستعلامات، التقارير)', titleEn: 'Lesson 8: Database Design (Tables, Forms, Queries & Reports)' },
              { id: 'p1_t1_u2_l4', lessonNumber: 9, unitNumber: 2, term: 1, unitTitleAr: 'المحور الثاني', unitTitleEn: 'Unit 2', titleAr: 'الدرس 9: المشروع الرقمي للفصل الدراسي الأول وتطبيقه العملي', titleEn: 'Lesson 9: Term 1 Capstone Digital Project' }
            ]
          }
        ]
      },
      term2: {
        units: [
          {
            unitNumber: 3,
            unitTitleAr: 'المحور الثالث: الذكاء الاصطناعي والروبوتات والأنظمة الذكية',
            unitTitleEn: 'Unit 3: AI Applications, Sensors & Robotics',
            term: 2,
            lessons: [
              { id: 'p1_t2_u3_l1', lessonNumber: 1, unitNumber: 3, term: 2, unitTitleAr: 'المحور الثالث', unitTitleEn: 'Unit 3', titleAr: 'الدرس 1: تطبيقات الذكاء الاصطناعي الحديثة (Artificial Intelligence Applications)', titleEn: 'Lesson 1: Modern AI Applications' },
              { id: 'p1_t2_u3_l2', lessonNumber: 2, unitNumber: 3, term: 2, unitTitleAr: 'المحور الثالث', unitTitleEn: 'Unit 3', titleAr: 'الدرس 2: أجهزة الاستشعار والحساسات (Sensors) في النظم التفاعلية الذكية', titleEn: 'Lesson 2: Sensors & Smart Automation' },
              { id: 'p1_t2_u3_l3', lessonNumber: 3, unitNumber: 3, term: 2, unitTitleAr: 'المحور الثالث', unitTitleEn: 'Unit 3', titleAr: 'الدرس 3: الروبوتات والأنظمة الآلية والتحكم (Robotics & Automation)', titleEn: 'Lesson 3: Robotics & Automated Control' }
            ]
          },
          {
            unitNumber: 4,
            unitTitleAr: 'المحور الرابع: البرمجة بلغة سكراتش ومبادئ لغة بايثون (Scratch to Python)',
            unitTitleEn: 'Unit 4: Programming from Scratch to Python',
            term: 2,
            lessons: [
              { id: 'p1_t2_u4_l1', lessonNumber: 4, unitNumber: 4, term: 2, unitTitleAr: 'المحور الرابع', unitTitleEn: 'Unit 4', titleAr: 'الدرس 4: منطقة الكائنات (Sprites) والمظاهر والأحداث ببرنامج سكراتش', titleEn: 'Lesson 4: Scratch Sprites, Costumes & Events' },
              { id: 'p1_t2_u4_l2', lessonNumber: 5, unitNumber: 4, term: 2, unitTitleAr: 'المحور الرابع', unitTitleEn: 'Unit 4', titleAr: 'الدرس 5: مبادئ وأساسيات لغة البرمجة "البايثون" (Python Programming Basics)', titleEn: 'Lesson 5: Introduction to Python Programming' },
              { id: 'p1_t2_u4_l3', lessonNumber: 6, unitNumber: 4, term: 2, unitTitleAr: 'المحور الرابع', unitTitleEn: 'Unit 4', titleAr: 'الدرس 6: المتغيرات وأنواع البيانات في لغة بايثون (Variables & Data Types in Python)', titleEn: 'Lesson 6: Variables & Data Types in Python' },
              { id: 'p1_t2_u4_l4', lessonNumber: 7, unitNumber: 4, term: 2, unitTitleAr: 'المحور الرابع', unitTitleEn: 'Unit 4', titleAr: 'الدرس 7: العمليات الحسابية والمنطقية وجمل الإدخال والإخراج في بايثون', titleEn: 'Lesson 7: Python Operators, Input/Output Functions' },
              { id: 'p1_t2_u4_l5', lessonNumber: 8, unitNumber: 4, term: 2, unitTitleAr: 'المحور الرابع', unitTitleEn: 'Unit 4', titleAr: 'الدرس 8: المشروع البرمجي النهائي والاختبار العملي لمادة الحاسب', titleEn: 'Lesson 8: Final Practical Programming Project' }
            ]
          }
        ]
      }
    }
  },

  // -------------------------------------------------------------
  // PREP 2 (GRADE 8) - الصف الثاني الإعدادي (رمز الكود E)
  // المنهج المطوّر - تصميم وتطوير مواقع الويب HTML / CSS / JavaScript
  // -------------------------------------------------------------
  prep2: {
    gradeKey: 'prep2',
    gradeCodePrefix: 'E',
    gradeNameAr: 'الصف الثاني الإعدادي',
    gradeNameEn: '2nd Preparatory (Grade 8)',
    stageAr: 'المرحلة الإعدادية',
    subjectNameAr: 'تكنولوجيا المعلومات وتصميم وتطوير مواقع الويب',
    subjectNameEn: 'Web Design & Development (Prep 2)',
    terms: {
      term1: {
        units: [
          {
            unitNumber: 1,
            unitTitleAr: 'الوحدة الأولى: أساسيات مواقع الويب وتصميم الصفحات الثابتة (HTML5)',
            unitTitleEn: 'Unit 1: Web Fundamentals & Static Pages (HTML5)',
            term: 1,
            lessons: [
              { id: 'p2_t1_u1_l1', lessonNumber: 1, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 1: مفاهيم مواقع الويب والصفحة الرئيسية والصفحات الثابتة والتفاعلية', titleEn: 'Lesson 1: Web Concepts & Static vs Dynamic Pages' },
              { id: 'p2_t1_u1_l2', lessonNumber: 2, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 2: مراحل تصميم وإنشاء موقع الويب (التخطيط، التصميم، الإعداد، التنفيذ)', titleEn: 'Lesson 2: Web Development Life Cycle' },
              { id: 'p2_t1_u1_l3', lessonNumber: 3, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 3: الهيكل الأساسي لصفحة الويب بلغة HTML والوسوم الرئيسية', titleEn: 'Lesson 3: HTML Structure & Core Tags' },
              { id: 'p2_t1_u1_l4', lessonNumber: 4, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 4: تنسيق النصوص والفقرات والعناوين والخطوط في HTML', titleEn: 'Lesson 4: Text Formatting & Typography' },
              { id: 'p2_t1_u1_l5', lessonNumber: 5, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 5: إدراج الصور والوسائط والصوت والفيديو وخلفيات الصفحات', titleEn: 'Lesson 5: Media, Images, Audio & Video Embedding' },
              { id: 'p2_t1_u1_l6', lessonNumber: 6, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 6: إنشاء الارتباطات التشعبية والقوائم والجداول (Links & Tables)', titleEn: 'Lesson 6: Hyperlinks, Lists & Tables in HTML' }
            ]
          },
          {
            unitNumber: 2,
            unitTitleAr: 'الوحدة الثانية: لغة تنسيق صفحات الويب (CSS) وتصميم الواجهات المتجاوبة',
            unitTitleEn: 'Unit 2: Styling Webpages with CSS',
            term: 1,
            lessons: [
              { id: 'p2_t1_u2_l1', lessonNumber: 1, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 1: مقدمة إلى لغة CSS وقواعد كتابة الأنماط والمحددات (Selectors)', titleEn: 'Lesson 1: CSS Syntax & Selectors' },
              { id: 'p2_t1_u2_l2', lessonNumber: 2, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 2: الألوان والخلفيات والحدود والتأثيرات البصرية', titleEn: 'Lesson 2: Colors, Backgrounds & Borders' },
              { id: 'p2_t1_u2_l3', lessonNumber: 3, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 3: نموذج الصندوق (CSS Box Model: Margin, Padding, Border)', titleEn: 'Lesson 3: The CSS Box Model' },
              { id: 'p2_t1_u2_l4', lessonNumber: 4, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 4: تنسيق أشرطة التنقل وقوائم الروابط والأزرار التفاعلية', titleEn: 'Lesson 4: Navigation Bars & Button Styling' },
              { id: 'p2_t1_u2_l5', lessonNumber: 5, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 5: التصميم المتجاوب للهواتف والشاشات الذكية (Responsive Web Design)', titleEn: 'Lesson 5: Responsive Web Design Basics' },
              { id: 'p2_t1_u2_l6', lessonNumber: 6, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 6: مشروع بناء موقع متكامل للمدرسة أو المركز التدريبي', titleEn: 'Lesson 6: Complete School/Center Website Project' }
            ]
          }
        ]
      },
      term2: {
        units: [
          {
            unitNumber: 3,
            unitTitleAr: 'الوحدة الثالثة: لغة جافاسكريبت والصفحات التفاعلية (JavaScript Basics)',
            unitTitleEn: 'Unit 3: Interactive Web with JavaScript',
            term: 2,
            lessons: [
              { id: 'p2_t2_u3_l1', lessonNumber: 1, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 1: مقدمة إلى لغة JavaScript والفرق بين الصفحات الثابتة والتفاعلية', titleEn: 'Lesson 1: Introduction to JavaScript' },
              { id: 'p2_t2_u3_l2', lessonNumber: 2, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 2: جمل الإخراج والتفاعل مع المستخدم (alert, confirm, prompt, console)', titleEn: 'Lesson 2: Output Methods & Popups' },
              { id: 'p2_t2_u3_l3', lessonNumber: 3, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 3: المتغيرات وأنواع البيانات والعمليات الحسابية والمنطقية', titleEn: 'Lesson 3: Variables, Data Types & Operators' },
              { id: 'p2_t2_u3_l4', lessonNumber: 4, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 4: الشروط واتخاذ القرار (if, else if, switch)', titleEn: 'Lesson 4: Conditional Statements & Logic' },
              { id: 'p2_t2_u3_l5', lessonNumber: 5, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 5: الدوال (Functions) والأحداث (Events) والتفاعل مع الأزرار', titleEn: 'Lesson 5: Functions & DOM Event Handling' },
              { id: 'p2_t2_u3_l6', lessonNumber: 6, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 6: التحقق من صحة البيانات في نماذج الويب (Form Validation)', titleEn: 'Lesson 6: HTML Form Data Validation' }
            ]
          },
          {
            unitNumber: 4,
            unitTitleAr: 'الوحدة الرابعة: أمان المعلومات والجرائم السيبرانية ونشر المواقع',
            unitTitleEn: 'Unit 4: Information Security & Web Hosting',
            term: 2,
            lessons: [
              { id: 'p2_t2_u4_l1', lessonNumber: 1, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 1: مفاهيم أمن المعلومات وسرية وتكامل البيانات', titleEn: 'Lesson 1: Information Security & Confidentiality' },
              { id: 'p2_t2_u4_l2', lessonNumber: 2, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 2: التهديدات الإلكترونية والبرمجيات الخبيثة وهجمات حجب الخدمة', titleEn: 'Lesson 2: Cyber Threats & Malware Protection' },
              { id: 'p2_t2_u4_l3', lessonNumber: 3, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 3: الأمان في المعاملات الإلكترونية والتجارة الرقمية', titleEn: 'Lesson 3: E-Commerce Security' },
              { id: 'p2_t2_u4_l4', lessonNumber: 4, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 4: الاستخدام الآمن والأخلاقي للذكاء الاصطناعي في تطوير الويب', titleEn: 'Lesson 4: AI Tools & Safe Web Practices' },
              { id: 'p2_t2_u4_l5', lessonNumber: 5, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 5: نشر واستضافة الموقع على خوادم سحابية مجانية (Hosting)', titleEn: 'Lesson 5: Web Hosting & Domain Basics' },
              { id: 'p2_t2_u4_l6', lessonNumber: 6, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 6: المشروع التطبيقي الختامي: موقع ويب تفاعلي مؤمن وشامل', titleEn: 'Lesson 6: Secure Interactive Web Project' }
            ]
          }
        ]
      }
    }
  },

  // -------------------------------------------------------------
  // PREP 3 (GRADE 9) - الصف الثالث الإعدادي (رمز الكود F)
  // المنهج المطوّر - حل المشكلات والبرمجة الشيئية VB.NET
  // -------------------------------------------------------------
  prep3: {
    gradeKey: 'prep3',
    gradeCodePrefix: 'F',
    gradeNameAr: 'الصف الثالث الإعدادي',
    gradeNameEn: '3rd Preparatory (Grade 9)',
    stageAr: 'المرحلة الإعدادية',
    subjectNameAr: 'الحاسب الآلي والبرمجة الشيئية وحل المشكلات',
    subjectNameEn: 'Computer Science & Object-Oriented Programming',
    terms: {
      term1: {
        units: [
          {
            unitNumber: 1,
            unitTitleAr: 'الوحدة الأولى: حل المشكلات وخرائط التدفق (Flowcharts & Problem Solving)',
            unitTitleEn: 'Unit 1: Problem Solving & Flowcharts',
            term: 1,
            lessons: [
              { id: 'p3_t1_u1_l1', lessonNumber: 1, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 1: مفهوم المشكلة وخطوات حل المشكلات والخوارزميات', titleEn: 'Lesson 1: Problem Solving Steps & Algorithms' },
              { id: 'p3_t1_u1_l2', lessonNumber: 2, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 2: خرائط التدفق البسيطة والرموز الاصطلاحية (Simple Flowcharts)', titleEn: 'Lesson 2: Simple Flowchart Design' },
              { id: 'p3_t1_u1_l3', lessonNumber: 3, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 3: التفرع واتخاذ القرار في خرائط التدفق (Branching / Decision)', titleEn: 'Lesson 3: Branching & Decision Flowcharts' },
              { id: 'p3_t1_u1_l4', lessonNumber: 4, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 4: حلقات التكرار والعدادات في خرائط التدفق (Loops & Counters)', titleEn: 'Lesson 4: Loops & Counters in Flowcharts' },
              { id: 'p3_t1_u1_l5', lessonNumber: 5, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 5: خرائط التدفق المتقدمة وتطبيقات برمجية رياضية', titleEn: 'Lesson 5: Advanced Algorithmic Flowcharts' },
              { id: 'p3_t1_u1_l6', lessonNumber: 6, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 6: مقدمة إلى بيئة التطوير المتكاملة Visual Studio IDE', titleEn: 'Lesson 6: Visual Studio IDE & Development Environment' }
            ]
          },
          {
            unitNumber: 2,
            unitTitleAr: 'الوحدة الثانية: البرمجة الشيئية وموجهة بالحدث (Object-Oriented Programming)',
            unitTitleEn: 'Unit 2: Event-Driven OOP Programming',
            term: 1,
            lessons: [
              { id: 'p3_t1_u2_l1', lessonNumber: 1, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 1: مفاهيم البرمجة الكائنية والخصائص والأحداث والوسائل', titleEn: 'Lesson 1: OOP Concepts (Classes, Objects, Methods)' },
              { id: 'p3_t1_u2_l2', lessonNumber: 2, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 2: أداة النموذج (Form) وضبط خصائص الواجهة الأساسية', titleEn: 'Lesson 2: Form Control & UI Properties' },
              { id: 'p3_t1_u2_l3', lessonNumber: 3, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 3: أدوات التحكم الأساسية (Button, Label, TextBox)', titleEn: 'Lesson 3: Core UI Controls (Button, Label, TextBox)' },
              { id: 'p3_t1_u2_l4', lessonNumber: 4, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 4: أدوات الاختيار والقوائم (RadioButton, CheckBox, ListBox, ComboBox)', titleEn: 'Lesson 4: Selection & List Controls' },
              { id: 'p3_t1_u2_l5', lessonNumber: 5, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 5: كتابة الشيفرة البرمجية ومعالجة أحداث النقر والإدخال', titleEn: 'Lesson 5: Writing Code & Event Handlers' },
              { id: 'p3_t1_u2_l6', lessonNumber: 6, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 6: تطبيق برمجي: آلة حاسبة ذكية وبرنامج رصد وتقدير الدرجات', titleEn: 'Lesson 6: Calculator & Student Grade Software Project' }
            ]
          }
        ]
      },
      term2: {
        units: [
          {
            unitNumber: 3,
            unitTitleAr: 'الوحدة الثالثة: المتغيرات والثوابت وجمل التحكم والتكرار',
            unitTitleEn: 'Unit 3: Variables, Constants & Control Structures',
            term: 2,
            lessons: [
              { id: 'p3_t2_u3_l1', lessonNumber: 1, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 1: الإعلان عن المتغيرات والثوابت وأنواع البيانات (Dim & Const)', titleEn: 'Lesson 1: Variables, Constants & Data Types' },
              { id: 'p3_t2_u3_l2', lessonNumber: 2, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 2: العمليات الحسابية والمنطقية وأسبقية تنفيذ العمليات', titleEn: 'Lesson 2: Arithmetic & Logical Precedence' },
              { id: 'p3_t2_u3_l3', lessonNumber: 3, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 3: جمل اتخاذ القرار والتفرع الشرطي (If...Then...Else & Select Case)', titleEn: 'Lesson 3: Decision Statements (If & Select Case)' },
              { id: 'p3_t2_u3_l4', lessonNumber: 4, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 4: جمل التكرار والدوران (For...Next & Do While Loop)', titleEn: 'Lesson 4: Looping Structures (For Next & Do While)' },
              { id: 'p3_t2_u3_l5', lessonNumber: 5, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 5: الإجراءات والدوال المخصصة وإعادة استخدام الكود (Sub & Function)', titleEn: 'Lesson 5: Procedures & Functions (Sub / Function)' },
              { id: 'p3_t2_u3_l6', lessonNumber: 6, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 6: الأخطاء البرمجية وأنواعها وتتبع وتصحيح الأخطاء (Debugging)', titleEn: 'Lesson 6: Debugging & Error Handling Types' }
            ]
          },
          {
            unitNumber: 4,
            unitTitleAr: 'الوحدة الرابعة: أمان البرمجيات وقواعد البيانات وتطبيقات الذكاء الاصطناعي',
            unitTitleEn: 'Unit 4: Database Integration & Software Security',
            term: 2,
            lessons: [
              { id: 'p3_t2_u4_l1', lessonNumber: 1, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 1: مقدمة إلى قواعد البيانات وربطها بالتطبيقات البرمجية', titleEn: 'Lesson 1: Database Fundamentals & App Connection' },
              { id: 'p3_t2_u4_l2', lessonNumber: 2, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 2: تصميم قاعدة بيانات لتسجيل الطلاب وتخزين السجلات', titleEn: 'Lesson 2: Designing Student Records Database' },
              { id: 'p3_t2_u4_l3', lessonNumber: 3, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 3: دمج أدوات الذكاء الاصطناعي وتحليل البيانات في المشاريع', titleEn: 'Lesson 3: AI Integration & Data Insights' },
              { id: 'p3_t2_u4_l4', lessonNumber: 4, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 4: التشفير وحماية كلمات المرور وسرية معلومات النظام', titleEn: 'Lesson 4: Password Hashing & Security' },
              { id: 'p3_t2_u4_l5', lessonNumber: 5, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 5: توثيق البرامج وإنشاء ملف التثبيت التنفيذي (Setup Executable)', titleEn: 'Lesson 5: Software Packaging & Deployment' },
              { id: 'p3_t2_u4_l6', lessonNumber: 6, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 6: المشروع النهائي المتكامل: منظومة إدارة بيانات الطلاب والشهادات', titleEn: 'Lesson 6: Comprehensive Student Management System' }
            ]
          }
        ]
      }
    }
  },

  // -------------------------------------------------------------
  // SECONDARY 1 (GRADE 10) - الصف الأول الثانوي (رمز الكود G أو S1)
  // المنهج المطوّر - الحوسبة السحابية، شبكات متقدمة، لغة Python، والذكاء الاصطناعي
  // -------------------------------------------------------------
  sec1: {
    gradeKey: 'sec1',
    gradeCodePrefix: 'G',
    gradeNameAr: 'الصف الأول الثانوي',
    gradeNameEn: '1st Secondary (Grade 10)',
    stageAr: 'المرحلة الثانوية',
    subjectNameAr: 'تكنولوجيا المعلومات والاتصالات والذكاء الاصطناعي والحوسبة السحابية',
    subjectNameEn: 'Advanced ICT, Cloud Computing & AI (Sec 1)',
    terms: {
      term1: {
        units: [
          {
            unitNumber: 1,
            unitTitleAr: 'الوحدة الأولى: البنية التحتية للحوسبة السحابية وهندسة الشبكات والذكاء الاصطناعي',
            unitTitleEn: 'Unit 1: Cloud Infrastructure, Advanced Networking & AI',
            term: 1,
            lessons: [
              { id: 's1_t1_u1_l1', lessonNumber: 1, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 1: الحوسبة السحابية ونماذج الخدمة السحابية (IaaS, PaaS, SaaS)', titleEn: 'Lesson 1: Cloud Computing Service Models (IaaS, PaaS, SaaS)' },
              { id: 's1_t1_u1_l2', lessonNumber: 2, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 2: أمن المعلومات السحابية والتشفير المتقدم (Cloud Security & Cryptography)', titleEn: 'Lesson 2: Cloud Security & Encryption' },
              { id: 's1_t1_u1_l3', lessonNumber: 3, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 3: شبكات الحاسوب المتقدمة وبروتوكولات الإنترنت (TCP/IP, DNS, IPv6)', titleEn: 'Lesson 3: Advanced Protocols & Network Routing' },
              { id: 's1_t1_u1_l4', lessonNumber: 4, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 4: أساسيات الذكاء الاصطناعي التوليدي والتعلم الآلي (Machine Learning Concepts)', titleEn: 'Lesson 4: Generative AI & Machine Learning' },
              { id: 's1_t1_u1_l5', lessonNumber: 5, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 5: النماذج اللغوية الكبيرة واستخداماتها وصياغة الأوامر (LLMs & Prompt Engineering)', titleEn: 'Lesson 5: LLMs & Prompt Engineering' },
              { id: 's1_t1_u1_l6', lessonNumber: 6, unitNumber: 1, term: 1, unitTitleAr: 'الوحدة الأولى', unitTitleEn: 'Unit 1', titleAr: 'الدرس 6: أخلاقيات الذكاء الاصطناعي والمسؤولية القانونية الرقمية', titleEn: 'Lesson 6: AI Ethics & Legal Frameworks' }
            ]
          },
          {
            unitNumber: 2,
            unitTitleAr: 'الوحدة الثانية: حل المشكلات البرمجية بلغة بايثون (Python Programming Fundamentals)',
            unitTitleEn: 'Unit 2: Python Programming Fundamentals',
            term: 1,
            lessons: [
              { id: 's1_t1_u2_l1', lessonNumber: 1, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 1: بيئة لغة Python وأنواع البيانات الأساسية والمدخلات والمخرجات (Input / Output)', titleEn: 'Lesson 1: Python Basics & Input/Output Operations' },
              { id: 's1_t1_u2_l2', lessonNumber: 2, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 2: الهياكل الشرطية والمنطقية والتحكم في سير البرنامج (if, elif, else)', titleEn: 'Lesson 2: Conditional Logic & Branching in Python' },
              { id: 's1_t1_u2_l3', lessonNumber: 3, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 3: حلقات التكرار والقوائم والمصفوفات (Loops, Lists & Tuples)', titleEn: 'Lesson 3: Python Loops, Lists & Tuples' },
              { id: 's1_t1_u2_l4', lessonNumber: 4, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 4: القواميس والمجموعات والتعامل مع النصوص (Dictionaries & Strings)', titleEn: 'Lesson 4: Dictionaries & String Manipulation' },
              { id: 's1_t1_u2_l5', lessonNumber: 5, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 5: الدوال المخصصة والمكتبات البرمجية الأساسية (Functions & Modules)', titleEn: 'Lesson 5: Functions & Modular Python' },
              { id: 's1_t1_u2_l6', lessonNumber: 6, unitNumber: 2, term: 1, unitTitleAr: 'الوحدة الثانية', unitTitleEn: 'Unit 2', titleAr: 'الدرس 6: مشروع برمجي: بناء روبوت محادثة ذكي مبسط (Simple Chatbot in Python)', titleEn: 'Lesson 6: Python Chatbot Capstone Project' }
            ]
          }
        ]
      },
      term2: {
        units: [
          {
            unitNumber: 3,
            unitTitleAr: 'الوحدة الثالثة: تحليل البيانات وتصورها ومكتبات بايثون (Data Analysis with Python)',
            unitTitleEn: 'Unit 3: Data Analytics & Visualization with Python',
            term: 2,
            lessons: [
              { id: 's1_t2_u3_l1', lessonNumber: 1, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 1: مقدمة إلى علم البيانات وهندسة واستكشاف البيانات', titleEn: 'Lesson 1: Introduction to Data Science' },
              { id: 's1_t2_u3_l2', lessonNumber: 2, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 2: استخدام مكتبة NumPy للعمليات الرياضية والمصفوفات العددية', titleEn: 'Lesson 2: Numerical Computing with NumPy' },
              { id: 's1_t2_u3_l3', lessonNumber: 3, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 3: معالجة وتنظيف وتصفية البيانات باستخدام مكتبة Pandas', titleEn: 'Lesson 3: Data Wrangling with Pandas' },
              { id: 's1_t2_u3_l4', lessonNumber: 4, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 4: تصور ورسم البيانات بيانيا باستخدام Matplotlib & Seaborn', titleEn: 'Lesson 4: Data Visualization with Matplotlib' },
              { id: 's1_t2_u3_l5', lessonNumber: 5, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 5: بناء نماذج تنبؤية وتطبيقات عملية على البيانات الحقيقية', titleEn: 'Lesson 5: Predictive Analytics Basics' },
              { id: 's1_t2_u3_l6', lessonNumber: 6, unitNumber: 3, term: 2, unitTitleAr: 'الوحدة الثالثة', unitTitleEn: 'Unit 3', titleAr: 'الدرس 6: مشروع تحليل بيانات شامل وعرض لوحة مؤشرات تفاعلية', titleEn: 'Lesson 6: Interactive Data Analytics Dashboard' }
            ]
          },
          {
            unitNumber: 4,
            unitTitleAr: 'الوحدة الرابعة: الأمن السيبراني المتقدم وتطوير تطبيقات الويب الحديثة',
            unitTitleEn: 'Unit 4: Advanced Cybersecurity & Web App Development',
            term: 2,
            lessons: [
              { id: 's1_t2_u4_l1', lessonNumber: 1, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 1: أمن الويب واختبار الاختراق الأخلاقي واكتشاف الثغرات', titleEn: 'Lesson 1: Web Security & Ethical Hacking Basics' },
              { id: 's1_t2_u4_l2', lessonNumber: 2, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 2: حماية التطبيقات وتأمين واجهات برمجة التطبيقات (API Security & OAuth)', titleEn: 'Lesson 2: API Security & Modern Authentication' },
              { id: 's1_t2_u4_l3', lessonNumber: 3, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 3: تطوير واجهات الويب التفاعلية الحديثة واستخدام أطر العمل', titleEn: 'Lesson 3: Modern Web Framework Architecture' },
              { id: 's1_t2_u4_l4', lessonNumber: 4, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 4: التخزين السحابي وقواعد البيانات غير العلائقية (NoSQL / Cloud DB)', titleEn: 'Lesson 4: Cloud Databases & NoSQL' },
              { id: 's1_t2_u4_l5', lessonNumber: 5, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 5: إدارة المشاريع البرمجية ونظام التحكم في الإصدارات Git / GitHub', titleEn: 'Lesson 5: Version Control with Git & Team Workflows' },
              { id: 's1_t2_u4_l6', lessonNumber: 6, unitNumber: 4, term: 2, unitTitleAr: 'الوحدة الرابعة', unitTitleEn: 'Unit 4', titleAr: 'الدرس 6: المشروع الختامي المتكامل: تطبيق ويب ذكي متصل بالسحابة وقواعد البيانات', titleEn: 'Lesson 6: Cloud-Connected Smart Web Capstone' }
            ]
          }
        ]
      }
    }
  }
};

/**
 * Intelligent Grade Detection Engine
 * Accurately determines student's grade and corresponding curriculum based on:
 * 1. Student Code prefix (A -> Grade 4, B -> Grade 5, C -> Grade 6, D -> Prep 1, E -> Prep 2, F -> Prep 3, G/S1 -> Sec 1)
 * 2. Explicit grade or stage text (e.g. "الأول الإعدادي", "أولى إعدادي", "رابع", "خامس", "سادس", "ثانوي")
 * 3. Course name or group name
 */
export function detectCurriculum(student?: {
  code?: string;
  grade?: string;
  stage?: string;
  courseName?: string;
  groupName?: string;
  courseId?: string;
  academicYear?: string;
}): GradeCurriculum {
  if (!student) {
    return MOE_CURRICULA.grade4;
  }

  const code = (student.code || '').trim().toUpperCase();
  const gradeText = `${student.grade || ''} ${student.stage || ''} ${student.courseName || ''} ${student.groupName || ''}`.toLowerCase();

  // 1. Direct Student Code Prefix Matching (Highest Authority in NAGAH MS)
  if (code.startsWith('D')) {
    return MOE_CURRICULA.prep1; // Prep 1 (الصف الأول الإعدادي) - e.g. D015
  }
  if (code.startsWith('E')) {
    return MOE_CURRICULA.prep2; // Prep 2 (الصف الثاني الإعدادي)
  }
  if (code.startsWith('F')) {
    return MOE_CURRICULA.prep3; // Prep 3 (الصف الثالث الإعدادي)
  }
  if (code.startsWith('G') || code.startsWith('S1') || code.startsWith('S-1')) {
    return MOE_CURRICULA.sec1;  // Sec 1 (الصف الأول الثانوي)
  }
  if (code.startsWith('A')) {
    return MOE_CURRICULA.grade4; // Grade 4 (الصف الرابع الابتدائي)
  }
  if (code.startsWith('B')) {
    return MOE_CURRICULA.grade5; // Grade 5 (الصف الخامس الابتدائي)
  }
  if (code.startsWith('C')) {
    return MOE_CURRICULA.grade6; // Grade 6 (الصف السادس الابتدائي)
  }

  // 2. Text-Based Fallback Matching
  if (
    gradeText.includes('أول إعدادي') ||
    gradeText.includes('الأول الإعدادي') ||
    gradeText.includes('اول اعدادي') ||
    gradeText.includes('prep 1') ||
    gradeText.includes('prep1') ||
    gradeText.includes('grade 7') ||
    gradeText.includes('g7')
  ) {
    return MOE_CURRICULA.prep1;
  }

  if (
    gradeText.includes('ثاني إعدادي') ||
    gradeText.includes('الثاني الإعدادي') ||
    gradeText.includes('تاني اعدادي') ||
    gradeText.includes('prep 2') ||
    gradeText.includes('prep2') ||
    gradeText.includes('grade 8') ||
    gradeText.includes('g8')
  ) {
    return MOE_CURRICULA.prep2;
  }

  if (
    gradeText.includes('ثالث إعدادي') ||
    gradeText.includes('الثالث الإعدادي') ||
    gradeText.includes('تالت اعدادي') ||
    gradeText.includes('prep 3') ||
    gradeText.includes('prep3') ||
    gradeText.includes('grade 9') ||
    gradeText.includes('g9')
  ) {
    return MOE_CURRICULA.prep3;
  }

  if (
    gradeText.includes('أول ثانوي') ||
    gradeText.includes('الأول الثانوي') ||
    gradeText.includes('اول ثانوي') ||
    gradeText.includes('sec 1') ||
    gradeText.includes('sec1') ||
    gradeText.includes('grade 10') ||
    gradeText.includes('g10')
  ) {
    return MOE_CURRICULA.sec1;
  }

  if (
    gradeText.includes('رابع') ||
    gradeText.includes('الرابع') ||
    gradeText.includes('grade 4') ||
    gradeText.includes('primary 4') ||
    gradeText.includes('p4')
  ) {
    return MOE_CURRICULA.grade4;
  }

  if (
    gradeText.includes('خامس') ||
    gradeText.includes('الخامس') ||
    gradeText.includes('grade 5') ||
    gradeText.includes('primary 5') ||
    gradeText.includes('p5')
  ) {
    return MOE_CURRICULA.grade5;
  }

  if (
    gradeText.includes('سادس') ||
    gradeText.includes('السادس') ||
    gradeText.includes('grade 6') ||
    gradeText.includes('primary 6') ||
    gradeText.includes('p6')
  ) {
    return MOE_CURRICULA.grade6;
  }

  // Default to Grade 4 if unspecified
  return MOE_CURRICULA.grade4;
}

/**
 * Returns all lessons for a specific grade formatted for UI dropdowns & pickers
 */
export function getGradeLessonsList(
  curriculum: GradeCurriculum,
  selectedTerm: 1 | 2 | 'all' = 'all'
): Array<{
  id: string;
  label: string;
  labelEn: string;
  unitTitle: string;
  term: number;
  lessonNumber: number;
}> {
  const result: Array<{
    id: string;
    label: string;
    labelEn: string;
    unitTitle: string;
    term: number;
    lessonNumber: number;
  }> = [];

  const includeTerm1 = selectedTerm === 'all' || selectedTerm === 1;
  const includeTerm2 = selectedTerm === 'all' || selectedTerm === 2;

  if (includeTerm1 && curriculum.terms.term1) {
    curriculum.terms.term1.units.forEach(unit => {
      unit.lessons.forEach(l => {
        result.push({
          id: l.id,
          label: l.titleAr,
          labelEn: l.titleEn,
          unitTitle: unit.unitTitleAr,
          term: 1,
          lessonNumber: l.lessonNumber
        });
      });
    });
  }

  if (includeTerm2 && curriculum.terms.term2) {
    curriculum.terms.term2.units.forEach(unit => {
      unit.lessons.forEach(l => {
        result.push({
          id: l.id,
          label: l.titleAr,
          labelEn: l.titleEn,
          unitTitle: unit.unitTitleAr,
          term: 2,
          lessonNumber: l.lessonNumber
        });
      });
    });
  }

  return result;
}

/**
 * Quick curriculum topics for voice recordings & summaries for a given grade
 */
export function getVoiceSummaryTopicsForGrade(curriculum: GradeCurriculum): Array<{ title: string; category: string }> {
  const list: Array<{ title: string; category: string }> = [];

  // Extract key lessons from Term 1 & 2
  const allLessons = getGradeLessonsList(curriculum, 'all');
  allLessons.slice(0, 6).forEach(les => {
    list.push({
      title: `${les.label} (${les.unitTitle})`,
      category: curriculum.gradeKey
    });
  });

  list.push({
    title: `🚀 ملخص شامل للمحاضرة والتكليف العملي الأخير (${curriculum.gradeNameAr})`,
    category: 'general'
  });

  return list;
}
