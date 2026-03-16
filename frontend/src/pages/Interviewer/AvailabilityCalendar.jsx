import React, { useState, useEffect, useContext } from 'react';
import { CalendarDays, Clock, Check, X, Plus, Trash2, Save } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

const colorFor = (day) => {
  const palette = ['#ef4444','#3b82f6','#10b981','#8b5cf6','#f59e0b','#ec4899','#14b8a6'];
  return palette[day % palette.length];
};

const AvailabilityCalendar = () => {
  const { user } = useContext(UserContext);
  const [slots, setSlots] = useState([]); // [{dayOfWeek, startTime, endTime}]
  const [blockedDates, setBlockedDates] = useState([]);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
  const [newBlock, setNewBlock] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) return;
    axiosInstance.get(`/api/availability/${userId}`)
      .then(res => {
        setSlots(res.data?.weeklySlots || []);
        setBlockedDates(res.data?.blockedDates || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const addSlot = () => {
    if (newSlot.startTime >= newSlot.endTime) return toast.error('Start time must be before end time');
    const conflict = slots.find(s => s.dayOfWeek === newSlot.dayOfWeek &&
      ((newSlot.startTime >= s.startTime && newSlot.startTime < s.endTime) ||
       (newSlot.endTime > s.startTime && newSlot.endTime <= s.endTime)));
    if (conflict) return toast.error('This slot overlaps with an existing one');
    setSlots(prev => [...prev, { ...newSlot }]);
  };

  const removeSlot = (idx) => setSlots(prev => prev.filter((_, i) => i !== idx));

  const addBlockedDate = () => {
    if (!newBlock) return;
    if (blockedDates.includes(newBlock)) return toast.error('Already blocked');
    setBlockedDates(prev => [...prev, newBlock].sort());
    setNewBlock('');
  };

  const removeBlock = (d) => setBlockedDates(prev => prev.filter(b => b !== d));

  const save = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/api/availability', { weeklySlots: slots, blockedDates });
      toast.success('Availability saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const groupedSlots = DAYS.map((d, i) => ({
    day: d, dayNum: i,
    slots: slots.filter(s => s.dayOfWeek === i),
  }));

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays size={24} className="text-teal-500" /> Availability Calendar
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Set your recurring weekly availability for interview scheduling</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 transition-all disabled:opacity-50">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={15} /> Save Availability</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add Slot */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <Plus size={15} className="text-teal-500" /> Add Weekly Slot
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">Day of Week</label>
              <select value={newSlot.dayOfWeek} onChange={e => setNewSlot(s => ({ ...s, dayOfWeek: +e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-teal-500/40">
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">Start</label>
                <select value={newSlot.startTime} onChange={e => setNewSlot(s => ({ ...s, startTime: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-teal-500/40">
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">End</label>
                <select value={newSlot.endTime} onChange={e => setNewSlot(s => ({ ...s, endTime: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-teal-500/40">
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button onClick={addSlot}
              className="w-full py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
              <Plus size={15} /> Add Slot
            </button>
          </div>

          {/* Blocked Dates */}
          <div className="mt-6">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
              <X size={15} className="text-red-500" /> Blocked Dates
            </h2>
            <div className="flex gap-2 mb-2">
              <input type="date" value={newBlock} onChange={e => setNewBlock(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-red-500/40" />
              <button onClick={addBlockedDate} className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all">
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {blockedDates.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">No blocked dates</p>
              ) : blockedDates.map(d => (
                <div key={d} className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                  <span className="text-xs font-medium text-red-700 dark:text-red-400">{d}</span>
                  <button onClick={() => removeBlock(d)} className="text-red-400 hover:text-red-600"><X size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Weekly Calendar Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <Clock size={15} className="text-teal-500" /> Weekly Schedule
          </h2>
          <div className="space-y-2">
            {groupedSlots.map(({ day, dayNum, slots: daySlots }) => (
              <div key={day} className="flex items-start gap-3">
                <div className="w-24 flex-shrink-0">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{day.slice(0, 3)}</span>
                </div>
                <div className="flex-1 flex flex-wrap gap-1.5 min-h-[32px]">
                  {daySlots.length === 0 ? (
                    <span className="text-xs text-gray-300 dark:text-gray-600 italic self-center">No slots</span>
                  ) : daySlots.map((slot, si) => {
                    const globalIdx = slots.findIndex(s => s.dayOfWeek === slot.dayOfWeek && s.startTime === slot.startTime && s.endTime === slot.endTime);
                    return (
                      <div key={si} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white group"
                        style={{ background: colorFor(dayNum) }}>
                        <Clock size={10} />{slot.startTime} – {slot.endTime}
                        <button onClick={() => removeSlot(globalIdx)} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {slots.length === 0 && (
            <div className="text-center py-10 text-gray-300 dark:text-gray-600">
              <CalendarDays size={32} className="mx-auto mb-2" />
              <p className="text-sm">Add weekly slots to get started</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AvailabilityCalendar;
