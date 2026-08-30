import React from 'react';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
      <h1>مرحباً بك مجدداً</h1>
      <p>لقد قمت مسبقاً بحذف جميع ملفات المشروع.</p>
      <p>لقد قمت بإنشاء ملفات أساسية جديدة لإيقاف أخطاء التشغيل.</p>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <strong>كيف تستعيد كودك القديم؟</strong>
        <p>إذا كنت تريد إكمال العمل على مشروعك القديم هنا، قم بسحب وإفلات ملفات الـ ZIP التي حملتها سابقاً داخل مدير الملفات (File Explorer) على اليسار.</p>
      </div>
    </div>
  );
}

export default App;
