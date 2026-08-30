import re

with open('src/features/shell/Header.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace("import { \n  Bell,", "import { \n  Bell, Calendar as CalendarIcon, CalendarDays, RotateCcw, ChevronRight as ChevronRightIcon, ChevronLeft as ChevronLeftIcon, X,")

if "useToast" not in content:
    content = content.replace("import { Tooltip } from '../../components/ui/Tooltip';", "import { Tooltip } from '../../components/ui/Tooltip';\nimport { useToast } from '../../core/notifications/ToastContext';")

# 2. Update state and effect
state_injection = """
  const { celebrate } = useToast();
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Basic mock calendar state for month navigation
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const handleDateSelect = (day: number) => {
    const newDate = new Date(calendarYear, calendarMonth, day);
    setSelectedDate(newDate);
    setShowCalendarMenu(false);
    celebrate(`تم تغيير تاريخ النظام إلى ${newDate.toLocaleDateString('ar-EG')} وجاري تحديث الإحصائيات`);
    window.dispatchEvent(new CustomEvent('SYSTEM_DATE_CHANGED', { detail: newDate }));
  };

  const handleResetDate = () => {
    setSelectedDate(null);
    setCalendarMonth(new Date().getMonth());
    setCalendarYear(new Date().getFullYear());
    celebrate('تم إعادة النظام لليوم الحالي');
    window.dispatchEvent(new CustomEvent('SYSTEM_DATE_CHANGED', { detail: null }));
  };

  // Calendar rendering helpers
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNamesArabic = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
"""

# Insert state_injection just after `const [currentTimeStr, setCurrentTimeStr] = useState(...);`
content = re.sub(r"(const \[currentTimeStr, setCurrentTimeStr\] = useState\([^)]+\);)", r"\1\n" + state_injection, content)

# 3. Modify time formatting effect to respect selectedDate
time_effect_replacement = """
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // If a date is selected, use that date but keep current time
      const displayDate = selectedDate ? new Date(selectedDate) : now;
      if (selectedDate) {
        displayDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      }
      
      try {
        const timeString = displayDate.toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const dateString = displayDate.toLocaleDateString('ar-EG', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        setCurrentTimeStr(`${dateString} - ${timeString}`);
      } catch (e) {
        setCurrentTimeStr(displayDate.toLocaleString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [selectedDate]);
"""

# Replace the existing useEffect for time
content = re.sub(
    r"useEffect\(\(\) => \{\s*const updateTime = \(\) => \{.*?return \(\) => clearInterval\(interval\);\s*\}, \[\]\);", 
    time_effect_replacement.strip(), 
    content, 
    flags=re.DOTALL
)

# 4. Replace the center clock UI with the new interactive calendar UI
center_clock_ui_search = """
        {/* Center: System Status Indicator or Brand Stamp */}
        <div className="flex items-center gap-2">
          {/* Subtle Live Clock */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-slate-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentTimeStr}</span>
          </div>
        </div>
"""

center_clock_ui_replacement = """
        {/* Center: System Status Indicator & Calendar Picker */}
        <div className="flex items-center gap-2 relative">
          <div className="hidden lg:flex items-center gap-1.5">
            <button 
              onClick={() => setShowCalendarMenu(!showCalendarMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                selectedDate 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                  : 'bg-slate-800/50 border-slate-700/40 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>{currentTimeStr}</span>
            </button>
            
            {selectedDate && (
              <Tooltip content="العودة لليوم الحالي">
                <button
                  onClick={handleResetDate}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            )}
          </div>

          {/* Modern Calendar Dropdown */}
          {showCalendarMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCalendarMenu(false)} />
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-3 select-none">
                <div className="flex items-center justify-between mb-3 text-slate-200">
                  <button 
                    onClick={() => {
                      if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
                      else setCalendarMonth(m => m - 1);
                    }}
                    className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold">{monthNamesArabic[calendarMonth]} {calendarYear}</span>
                  <button 
                    onClick={() => {
                      if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
                      else setCalendarMonth(m => m + 1);
                    }}
                    className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map(day => (
                    <div key={day} className="text-[10px] font-bold text-slate-500">{day}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center">
                  {blanksArray.map(b => <div key={`blank-${b}`} />)}
                  {daysArray.map(day => {
                    const isToday = !selectedDate && day === new Date().getDate() && calendarMonth === new Date().getMonth() && calendarYear === new Date().getFullYear();
                    const isSelected = selectedDate && day === selectedDate.getDate() && calendarMonth === selectedDate.getMonth() && calendarYear === selectedDate.getFullYear();
                    
                    return (
                      <button
                        key={day}
                        onClick={() => handleDateSelect(day)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected ? 'bg-amber-500 text-slate-900 shadow-md scale-110' : 
                          isToday ? 'bg-slate-700 text-amber-400 border border-amber-500/30' : 
                          'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
"""

content = content.replace(center_clock_ui_search, center_clock_ui_replacement)

with open('src/features/shell/Header.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched Header.tsx for calendar")

