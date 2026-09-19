import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Calendar, 
  CheckSquare, 
  Phone, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Users, 
  Luggage, 
  User, 
  Sparkles,
  Plane,
  X,
  ExternalLink,
  Navigation,
  Compass,
  Pencil,
  Share2,
  AlertTriangle,
  Waves,
  ShieldCheck,
  Car
} from 'lucide-react';
import './index.css';

const CITY_HERO_IMAGES = {
  Transit: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
  Varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
  Prayagraj: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
  Ayodhya: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80'
};

const TRIP_DAYS = [
  { day: 1, date: '2026-09-26', label: 'Sep 26', city: 'Transit / Prayagraj', hero: CITY_HERO_IMAGES.Transit, riverStatus: 'Airport Arrival • Highway Transfer to Prayagraj' },
  { day: 2, date: '2026-09-27', label: 'Sep 27', city: 'Prayagraj / Varanasi', hero: CITY_HERO_IMAGES.Prayagraj, riverStatus: 'Sangam Confluence Boats: Running • Darshan' },
  { day: 3, date: '2026-09-28', label: 'Sep 28', city: 'Varanasi', hero: CITY_HERO_IMAGES.Varanasi, riverStatus: 'Sunrise Cruise Active • Moderate Current' },
  { day: 4, date: '2026-09-29', label: 'Sep 29', city: 'Varanasi', hero: CITY_HERO_IMAGES.Varanasi, riverStatus: 'Ganga Boating: Clear • Aarti Crowds Heavy' },
  { day: 5, date: '2026-09-30', label: 'Sep 30', city: 'Ayodhya', hero: CITY_HERO_IMAGES.Ayodhya, riverStatus: 'Saryu River Aarti: Normal Water Level' },
  { day: 6, date: '2026-10-01', label: 'Oct 1',  city: 'Ayodhya', hero: CITY_HERO_IMAGES.Ayodhya, riverStatus: 'Ram Mandir Darshan: Standard Queues' },
  { day: 7, date: '2026-10-02', label: 'Oct 2',  city: 'Varanasi', hero: CITY_HERO_IMAGES.Varanasi, riverStatus: 'Silk Weaver Walks • Ghat Evening Walk' },
  { day: 8, date: '2026-10-03', label: 'Oct 3',  city: 'Transit / Return', hero: CITY_HERO_IMAGES.Transit, riverStatus: 'Return Flight to Kochi (COK)' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDay, setSelectedDay] = useState(1);
  const [checklistMode, setChecklistMode] = useState('person');
  const [filterChoice, setFilterChoice] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingTipModal, setIsEditingTipModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Offline-resilient states
  const [itinerary, setItinerary] = useState(() => JSON.parse(localStorage.getItem('trip_itinerary') || '[]'));
  const [contacts, setContacts] = useState(() => JSON.parse(localStorage.getItem('trip_contacts') || '[]'));
  const [packing, setPacking] = useState(() => JSON.parse(localStorage.getItem('packing_list') || '[]'));
  const [members, setMembers] = useState(() => JSON.parse(localStorage.getItem('trip_members') || '[]'));
  const [bags, setBags] = useState(() => JSON.parse(localStorage.getItem('trip_bags') || '[]'));
  const [dayTips, setDayTips] = useState(() => JSON.parse(localStorage.getItem('trip_day_meta') || '{}'));

  // Form states
  const [tipInput, setTipInput] = useState('');
  const [newActivity, setNewActivity] = useState({ 
    day_number: 1, 
    date: '2026-09-26', 
    location: 'Transit (VNS → Prayagraj)', 
    type: 'Drive', 
    activity: '', 
    flight_no: '', 
    time_info: '', 
    map_link: '',
    accessibility: 'normal',
    notes: '' 
  });
  const [newContact, setNewContact] = useState({ name: '', role: '', phone: '', notes: '' });
  const [newItem, setNewItem] = useState({ item: '', category: 'General', assigned_to: 'All', target_bag: 'General' });
  const [newMember, setNewMember] = useState({ name: '', role: 'Adult' });
  const [newBag, setNewBag] = useState({ bag_name: '', bag_type: 'Trolley', assigned_to: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      const [itinRes, contRes, packRes, membRes, bagRes, tipsRes] = await Promise.all([
        supabase.from('trip_itinerary').select('*').order('day_number', { ascending: true }),
        supabase.from('trip_contacts').select('*').order('name', { ascending: true }),
        supabase.from('packing_list').select('*').order('id', { ascending: true }),
        supabase.from('trip_members').select('*').order('id', { ascending: true }),
        supabase.from('trip_bags').select('*').order('id', { ascending: true }),
        supabase.from('trip_day_meta').select('*')
      ]);

      if (itinRes.data) { setItinerary(itinRes.data); localStorage.setItem('trip_itinerary', JSON.stringify(itinRes.data)); }
      if (contRes.data) { setContacts(contRes.data); localStorage.setItem('trip_contacts', JSON.stringify(contRes.data)); }
      if (packRes.data) { setPacking(packRes.data); localStorage.setItem('packing_list', JSON.stringify(packRes.data)); }
      if (membRes.data) { setMembers(membRes.data); localStorage.setItem('trip_members', JSON.stringify(membRes.data)); }
      if (bagRes.data) { setBags(bagRes.data); localStorage.setItem('trip_bags', JSON.stringify(bagRes.data)); }
      
      if (tipsRes.data) {
        const tipsMap = {};
        tipsRes.data.forEach(t => { tipsMap[t.day_number] = t.custom_tip; });
        setDayTips(tipsMap);
        localStorage.setItem('trip_day_meta', JSON.stringify(tipsMap));
      }
    } catch (err) {
      console.warn("Working offline with cached data", err);
    } finally {
      setTimeout(() => setLoading(false), 350);
    }
  }

  // --- OPTIMISTIC CRUD ACTIONS ---
  async function addItineraryItem(e) {
    e.preventDefault();
    if (!newActivity.activity.trim()) return;

    const optimisticItem = {
      ...newActivity,
      id: Date.now()
    };

    const updated = [...itinerary, optimisticItem];
    setItinerary(updated);
    localStorage.setItem('trip_itinerary', JSON.stringify(updated));
    setIsModalOpen(false);

    setNewActivity({ 
      day_number: selectedDay, 
      date: TRIP_DAYS.find(d => d.day === selectedDay)?.date || '2026-09-26', 
      location: 'Varanasi', 
      type: 'Activity', 
      activity: '', 
      flight_no: '', 
      time_info: '', 
      map_link: '',
      accessibility: 'normal',
      notes: '' 
    });

    try {
      const { data, error } = await supabase.from('trip_itinerary').insert([newActivity]).select();
      if (error) {
        console.error("Supabase insert issue:", error.message);
      } else if (data && data.length > 0) {
        const reconciled = updated.map(item => item.id === optimisticItem.id ? data[0] : item);
        setItinerary(reconciled);
        localStorage.setItem('trip_itinerary', JSON.stringify(reconciled));
      }
    } catch (err) {
      console.warn("Offline: cached in localStorage", err);
    }
  }

  async function saveDayTip(e) {
    e.preventDefault();
    const updated = { ...dayTips, [selectedDay]: tipInput };
    setDayTips(updated);
    localStorage.setItem('trip_day_meta', JSON.stringify(updated));
    setIsEditingTipModal(false);

    try {
      await supabase.from('trip_day_meta').upsert({
        day_number: selectedDay,
        custom_tip: tipInput
      });
    } catch (err) {
      console.warn("Offline: tip saved locally", err);
    }
  }

  async function addPackingItem(e) {
    e.preventDefault();
    if (!newItem.item.trim()) return;

    const optimisticItem = { ...newItem, id: Date.now(), is_packed: false };
    const updated = [...packing, optimisticItem];
    setPacking(updated);
    localStorage.setItem('packing_list', JSON.stringify(updated));
    setIsModalOpen(false);
    setNewItem({ ...newItem, item: '' });

    try {
      const { data, error } = await supabase.from('packing_list').insert([{ ...newItem, is_packed: false }]).select();
      if (!error && data && data.length > 0) {
        const reconciled = updated.map(p => p.id === optimisticItem.id ? data[0] : p);
        setPacking(reconciled);
        localStorage.setItem('packing_list', JSON.stringify(reconciled));
      }
    } catch (err) {
      console.warn("Offline: packing item saved locally", err);
    }
  }

  async function togglePackingItem(id, currentState) {
    const nextState = !currentState;
    const updated = packing.map(p => p.id === id ? { ...p, is_packed: nextState } : p);
    setPacking(updated);
    localStorage.setItem('packing_list', JSON.stringify(updated));

    try {
      await supabase.from('packing_list').update({ is_packed: nextState }).eq('id', id);
    } catch (err) {
      console.warn("Offline: toggle saved locally", err);
    }
  }

  async function addMember(e) {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    const optimistic = { ...newMember, id: Date.now() };
    const updated = [...members, optimistic];
    setMembers(updated);
    localStorage.setItem('trip_members', JSON.stringify(updated));
    setIsModalOpen(false);
    setNewMember({ name: '', role: 'Adult' });

    try {
      const { data, error } = await supabase.from('trip_members').insert([newMember]).select();
      if (!error && data && data.length > 0) {
        const reconciled = updated.map(m => m.id === optimistic.id ? data[0] : m);
        setMembers(reconciled);
        localStorage.setItem('trip_members', JSON.stringify(reconciled));
      }
    } catch (err) {
      console.warn("Offline: member saved locally", err);
    }
  }

  async function addBag(e) {
    e.preventDefault();
    if (!newBag.bag_name.trim()) return;

    const optimistic = { ...newBag, id: Date.now() };
    const updated = [...bags, optimistic];
    setBags(updated);
    localStorage.setItem('trip_bags', JSON.stringify(updated));
    setIsModalOpen(false);
    setNewBag({ bag_name: '', bag_type: 'Trolley', assigned_to: '' });

    try {
      const { data, error } = await supabase.from('trip_bags').insert([newBag]).select();
      if (!error && data && data.length > 0) {
        const reconciled = updated.map(b => b.id === optimistic.id ? data[0] : b);
        setBags(reconciled);
        localStorage.setItem('trip_bags', JSON.stringify(reconciled));
      }
    } catch (err) {
      console.warn("Offline: bag saved locally", err);
    }
  }

  async function addContact(e) {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phone.trim()) return;

    const optimistic = { ...newContact, id: Date.now() };
    const updated = [...contacts, optimistic];
    setContacts(updated);
    localStorage.setItem('trip_contacts', JSON.stringify(updated));
    setIsModalOpen(false);
    setNewContact({ name: '', role: '', phone: '', notes: '' });

    try {
      const { data, error } = await supabase.from('trip_contacts').insert([newContact]).select();
      if (!error && data && data.length > 0) {
        const reconciled = updated.map(c => c.id === optimistic.id ? data[0] : c);
        setContacts(reconciled);
        localStorage.setItem('trip_contacts', JSON.stringify(reconciled));
      }
    } catch (err) {
      console.warn("Offline: contact saved locally", err);
    }
  }

  async function deleteEntrySafely(table, id, listState, setListState, storageKey, label) {
    if (!window.confirm(`Are you sure you want to remove "${label || 'this item'}"?`)) return;
    const updated = listState.filter(item => item.id !== id);
    setListState(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    try {
      await supabase.from(table).delete().eq('id', id);
    } catch (err) {
      console.warn("Offline: deletion saved locally", err);
    }
  }

  // --- Dynamic calculations ---
  const activeDayMeta = TRIP_DAYS.find(d => d.day === selectedDay) || TRIP_DAYS[0];
  const dayItinerary = itinerary.filter(i => Number(i.day_number) === Number(selectedDay));

  const activeDayDescription = dayTips[selectedDay] || (
    dayItinerary.length > 0 
      ? `Highlights: ${dayItinerary.map(i => i.activity).join(' • ')}`
      : `No items scheduled yet for Day ${selectedDay}. Tap pencil or + to add.`
  );

  const filteredPacking = packing.filter(p => {
    if (filterChoice === 'All') return true;
    if (checklistMode === 'person') return p.assigned_to === filterChoice;
    if (checklistMode === 'bag') return p.target_bag === filterChoice;
    return true;
  });

  const packedCount = packing.filter(p => p.is_packed).length;
  const packedPercent = packing.length ? Math.round((packedCount / packing.length) * 100) : 0;
  const leadEmergencyContact = contacts.find(c => c.role?.toLowerCase().includes('emergency') || c.role?.toLowerCase().includes('cab') || c.role?.toLowerCase().includes('driver')) || contacts[0];

  function getMapUrl(item) {
    if (item.map_link && item.map_link.startsWith('http')) return item.map_link;
    const query = encodeURIComponent(`${item.activity}, ${item.location}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  function getCountdownStatus() {
    const today = new Date();
    const tripStart = new Date('2026-09-26T00:00:00');
    const tripEnd = new Date('2026-10-03T23:59:59');

    if (today < tripStart) {
      const diffDays = Math.ceil((tripStart - today) / (1000 * 60 * 60 * 24));
      return `⏳ ${diffDays} Days to Go`;
    } else if (today >= tripStart && today <= tripEnd) {
      const activeTripDay = Math.floor((today - tripStart) / (1000 * 60 * 60 * 24)) + 1;
      return `📍 Day ${activeTripDay} of 8`;
    } else {
      return `✨ Yatra Done`;
    }
  }

  function shareDayToWhatsApp() {
    const header = `🕉️ *Kashi Yatra • Day ${selectedDay} (${activeDayMeta.label})*\n📍 *Location:* ${activeDayMeta.city}\n\n`;
    const events = dayItinerary.map((it, idx) => {
      let line = `${idx + 1}. *${it.activity}*`;
      if (it.time_info) line += ` (🕒 ${it.time_info})`;
      if (it.flight_no) line += ` [${it.type === 'Drive' ? 'Cab' : 'Flight'}: ${it.flight_no}]`;
      if (it.notes) line += `\n   ↳ _Note: ${it.notes}_`;
      return line;
    }).join('\n\n');

    const focus = `\n\n📌 *Day Goal:* ${activeDayDescription}`;
    const driver = leadEmergencyContact ? `\n\n📞 *Driver/Lead Contact:* ${leadEmergencyContact.name} (${leadEmergencyContact.phone})` : '';
    const fullMessage = encodeURIComponent(header + (events || 'No activities logged yet.') + focus + driver);
    window.open(`https://api.whatsapp.com/send?text=${fullMessage}`, '_blank');
  }

  return (
    <div className="luxury-container">
      {/* DYNAMIC HERO BANNER */}
      <header 
        className="dynamic-hero" 
        style={{ backgroundImage: `url(${activeTab === 'itinerary' ? activeDayMeta.hero : CITY_HERO_IMAGES.Varanasi})` }}
      >
        <div className="hero-vignette"></div>
        <div className="hero-content">
          <div className="hero-tags-row">
            <span className="hero-tag"><Sparkles size={11} /> 7 Travelers</span>
            <span className="hero-tag hero-tag-countdown">{getCountdownStatus()}</span>
            <span className="hero-tag hero-tag-offline"><ShieldCheck size={11} /> Offline Ready</span>
          </div>
          <h1 className="hero-main-title">Kashi & Beyond</h1>
          <p className="hero-sub">Kochi ⇄ Varanasi • Prayagraj • Ayodhya (Sept 26 – Oct 3)</p>
        </div>
      </header>

      {/* KASHI VISHWANATH ANIMATED LOADING SPLASH */}
      {loading ? (
        <div className="kashi-splash-wrapper">
          <div className="kashi-mandala-container">
            <div className="kashi-aura-ring-1"></div>
            <div className="kashi-aura-ring-2"></div>
            <div className="kashi-disc">
              <svg className="trishul-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 4L36 18H28L32 4Z" fill="#78350f" />
                <path d="M32 18V60" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                <path d="M18 14C18 28 29 32 29 32" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
                <path d="M16 12L20 18H14L16 12Z" fill="#78350f" />
                <path d="M46 14C46 28 35 32 35 32" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
                <path d="M48 12L50 18H44L48 12Z" fill="#78350f" />
                <path d="M26 38L38 46M38 38L26 46" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="32" cy="42" r="2.5" fill="#78350f" />
              </svg>
              <div className="kashi-diya-glow"></div>
            </div>
          </div>
          <div className="kashi-chant">॥ ॐ नमः शिवाय ॥</div>
          <div className="kashi-subtitle">Kashi Vishwanath Mandir</div>
          <div className="kashi-loader-pill">
            <span className="kashi-flame-dot"></span>
            <span>Syncing Itinerary, Routes & GPS...</span>
          </div>
        </div>
      ) : (
        <main className="main-viewport">
          {/* =========================================================
              1. ITINERARY TAB
              ========================================================= */}
          {activeTab === 'itinerary' && (
            <div>
              {/* Day Carousel */}
              <div className="day-scroller">
                {TRIP_DAYS.map(d => (
                  <div
                    key={d.day}
                    onClick={() => { 
                      setSelectedDay(d.day); 
                      setNewActivity(prev => ({ 
                        ...prev, 
                        day_number: d.day,
                        date: d.date 
                      })); 
                    }}
                    className={`day-chip ${selectedDay === d.day ? 'active' : ''}`}
                  >
                    <div className="chip-num">Day {d.day}</div>
                    <div className="chip-date">{d.label}</div>
                    <div className="chip-city">{d.city.split(' ')[0]}</div>
                  </div>
                ))}
              </div>

              {/* Weather & River/Highway Condition Strip */}
              <div className="weather-strip">
                <div className="weather-indicator">
                  <Waves size={14} color="#16a34a" />
                  <span>{activeDayMeta.riverStatus}</span>
                </div>
                <span>☀️ ~31°C</span>
              </div>

              {/* Day Focus & WhatsApp Share Bar */}
              <div className="day-spotlight-pill">
                <div className="day-spotlight-content">
                  <Compass size={18} color="#b45309" style={{ flexShrink: 0 }} />
                  <div>{activeDayDescription}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={shareDayToWhatsApp} 
                    className="btn-spotlight-action btn-whatsapp-share"
                    title="Broadcast Day Schedule to Family WhatsApp"
                  >
                    <Share2 size={13} />
                  </button>
                  <button 
                    onClick={() => { 
                      setTipInput(dayTips[selectedDay] || ''); 
                      setIsEditingTipModal(true); 
                    }} 
                    className="btn-spotlight-action"
                    title="Edit Day Goal"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              </div>

              {/* Connected Vertical Timeline Spine */}
              {dayItinerary.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#a8a29e', background: '#fff', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
                  No events scheduled for Day {selectedDay}. Tap <strong>+</strong> below to add one.
                </div>
              ) : (
                <div className="timeline-container">
                  <div className="timeline-spine"></div>
                  {dayItinerary.map(item => {
                    const isFlight = item.type === 'Flight' || item.location?.includes('COK →') || item.location?.includes('→ COK');
                    const isDrive = item.type === 'Drive' || item.location?.includes('Transit') || item.location?.includes('→');
                    const isTemple = item.activity?.toLowerCase().includes('mandir') || 
                                     item.activity?.toLowerCase().includes('aarti') || 
                                     item.activity?.toLowerCase().includes('darshan') ||
                                     item.activity?.toLowerCase().includes('garhi');
                    
                    const isHighSecurityTemple = item.activity?.toLowerCase().includes('vishwanath') || 
                                                 item.activity?.toLowerCase().includes('janmabhoomi') ||
                                                 item.activity?.toLowerCase().includes('hanuman garhi');

                    const cityClass = isFlight 
                      ? 'city-transit'
                      : isDrive 
                      ? 'city-prayagraj'
                      : item.location === 'Varanasi' 
                      ? 'city-varanasi' 
                      : item.location === 'Prayagraj' 
                      ? 'city-prayagraj' 
                      : item.location === 'Ayodhya' 
                      ? 'city-ayodhya' 
                      : 'city-transit';

                    return (
                      <div key={item.id} className="timeline-node-wrapper">
                        {/* Dynamic Timeline Node Icon */}
                        <div className="timeline-node-bullet">
                          {isFlight ? '✈️' : isDrive ? '🚗' : isTemple ? '🛕' : '📍'}
                        </div>

                        {/* Event Card */}
                        <div className={`luxury-card ${isFlight ? 'card-flight' : isDrive ? 'card-drive' : ''}`}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                <span className={`city-pill ${cityClass}`}>
                                  {isFlight ? '✈️ ' + item.location : isDrive ? '🚗 ' + item.location : item.location}
                                </span>

                                {item.accessibility === 'stroller_yes' && (
                                  <span className="tag-access tag-stroller-yes">✓ Stroller Friendly</span>
                                )}
                                {item.accessibility === 'stairs' && (
                                  <span className="tag-access tag-stroller-no">⚠ Ghat Stairs / Galies</span>
                                )}
                              </div>
                              <div className="card-title-text">{item.activity}</div>
                            </div>
                            <button 
                              onClick={() => deleteEntrySafely('trip_itinerary', item.id, itinerary, setItinerary, 'trip_itinerary', item.activity)} 
                              style={{ background: 'none', border: 'none', color: '#d6d3d1', cursor: 'pointer', padding: '4px' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {(item.flight_no || item.time_info) && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                              {item.flight_no && (
                                <span className="flight-meta-tag">
                                  {isDrive ? '🚗 ' : '✈️ '}{item.flight_no}
                                </span>
                              )}
                              {item.time_info && <span className="flight-meta-tag">🕒 {item.time_info}</span>}
                            </div>
                          )}

                          {item.notes && <div className="card-notes-text">{item.notes}</div>}

                          {isHighSecurityTemple && (
                            <div className="tag-darshan-warning">
                              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span><strong>Security Check:</strong> Phones, leather belts & electronic keys strictly barred in sanctum. Deposit at hotel or official gate locker.</span>
                            </div>
                          )}

                          {!isFlight && (
                            <a
                              href={getMapUrl(item)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-nav-luxury"
                            >
                              <Navigation size={12} /> Navigate in Maps <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              2. CHECKLIST TAB
              ========================================================= */}
          {activeTab === 'packing' && (
            <div>
              <div className="progress-ring-card">
                <div className="progress-ring-left">
                  <div className="progress-ring-title">Packing Completion</div>
                  <div className="progress-ring-sub">{packedCount} of {packing.length} items verified</div>
                </div>
                <div className="ring-circle-box">
                  <svg width="58" height="58">
                    <circle cx="29" cy="29" r="23" stroke="#ede6d8" strokeWidth="5" fill="none" />
                    <circle 
                      cx="29" 
                      cy="29" 
                      r="23" 
                      stroke="#16a34a" 
                      strokeWidth="5" 
                      fill="none" 
                      strokeDasharray="144.5"
                      strokeDashoffset={144.5 - (144.5 * packedPercent) / 100}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                    />
                  </svg>
                  <div className="ring-percent-text">{packedPercent}%</div>
                </div>
              </div>

              <div className="view-switch-luxury">
                <button 
                  onClick={() => { setChecklistMode('person'); setFilterChoice('All'); }}
                  className={`view-btn-luxury ${checklistMode === 'person' ? 'active' : ''}`}
                >
                  Filter By Traveler
                </button>
                <button 
                  onClick={() => { setChecklistMode('bag'); setFilterChoice('All'); }}
                  className={`view-btn-luxury ${checklistMode === 'bag' ? 'active' : ''}`}
                >
                  Filter By Bag
                </button>
              </div>

              <div className="filter-tray">
                <button
                  onClick={() => setFilterChoice('All')}
                  className={`filter-pill ${filterChoice === 'All' ? 'active' : ''}`}
                >
                  All Items ({packing.length})
                </button>
                {checklistMode === 'person' && members.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setFilterChoice(m.name)}
                    className={`filter-pill ${filterChoice === m.name ? 'active' : ''}`}
                  >
                    {m.name} ({packing.filter(p => p.assigned_to === m.name).length})
                  </button>
                ))}
                {checklistMode === 'bag' && bags.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setFilterChoice(b.bag_name)}
                    className={`filter-pill ${filterChoice === b.bag_name ? 'active' : ''}`}
                  >
                    🧳 {b.bag_name} ({packing.filter(p => p.target_bag === b.bag_name).length})
                  </button>
                ))}
              </div>

              <div>
                {filteredPacking.map(p => (
                  <div key={p.id} className="luxury-card" style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }} onClick={() => togglePackingItem(p.id, p.is_packed)}>
                      {p.is_packed ? <CheckCircle2 size={20} color="#15803d" /> : <Circle size={20} color="#a8a29e" />}
                      <div>
                        <div style={{ textDecoration: p.is_packed ? 'line-through' : 'none', color: p.is_packed ? '#a8a29e' : '#1c1917', fontSize: '0.9rem', fontWeight: '600' }}>
                          {p.item}
                        </div>
                        <div style={{ display: 'flex', gap: '5px', marginTop: '3px' }}>
                          <span style={{ fontSize: '0.65rem', background: '#f5f5f4', color: '#57534e', padding: '1px 6px', borderRadius: '4px' }}>👤 {p.assigned_to || 'All'}</span>
                          {p.target_bag && p.target_bag !== 'General' && (
                            <span style={{ fontSize: '0.65rem', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px' }}>🧳 {p.target_bag}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteEntrySafely('packing_list', p.id, packing, setPacking, 'packing_list', p.item)} 
                      style={{ background: 'none', border: 'none', color: '#d6d3d1', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              3. TRAVELERS & BAGS TAB
              ========================================================= */}
          {activeTab === 'party' && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: '800', color: '#78350f', marginBottom: '10px' }}>
                  Travelers Roster ({members.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {members.map(m => (
                    <div key={m.id} className="luxury-card" style={{ padding: '12px', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#78716c' }}>{m.role}</div>
                      </div>
                      <button 
                        onClick={() => deleteEntrySafely('trip_members', m.id, members, setMembers, 'trip_members', m.name)} 
                        style={{ background: 'none', border: 'none', color: '#d6d3d1', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: '800', color: '#78350f', marginBottom: '10px' }}>
                  Luggage & Bags ({bags.length})
                </h3>
                <div>
                  {bags.map(b => (
                    <div key={b.id} className="luxury-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>🧳 {b.bag_name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#78716c', marginTop: '2px' }}>
                          {b.bag_type} • Caretaker: <strong>{b.assigned_to || 'Unassigned'}</strong>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteEntrySafely('trip_bags', b.id, bags, setBags, 'trip_bags', b.bag_name)} 
                        style={{ background: 'none', border: 'none', color: '#d6d3d1', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              4. DIRECTORY TAB
              ========================================================= */}
          {activeTab === 'contacts' && (
            <div>
              <div style={{ marginBottom: '14px', fontSize: '0.82rem', color: '#78716c' }}>
                Tap on any phone number to dial directly via carrier network.
              </div>
              <div>
                {contacts.map(c => (
                  <div key={c.id} className="luxury-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.94rem' }}>
                        {c.name} <span style={{ fontSize: '0.72rem', color: '#78716c', fontWeight: 'normal' }}>({c.role})</span>
                      </div>
                      <a href={`tel:${c.phone}`} style={{ color: '#0369a1', fontSize: '0.86rem', textDecoration: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <Phone size={13} /> {c.phone}
                      </a>
                    </div>
                    <button 
                      onClick={() => deleteEntrySafely('trip_contacts', c.id, contacts, setContacts, 'trip_contacts', c.name)} 
                      style={{ background: 'none', border: 'none', color: '#d6d3d1', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* PERSISTENT SOS & FAB BUTTONS */}
      {!loading && leadEmergencyContact && (
        <a href={`tel:${leadEmergencyContact.phone}`} className="fab-sos-luxury">
          <Phone size={13} /> Call {leadEmergencyContact.role || 'Driver'}
        </a>
      )}

      {!loading && (
        <button 
          onClick={() => {
            setNewActivity(prev => ({
              ...prev,
              day_number: selectedDay,
              date: TRIP_DAYS.find(d => d.day === selectedDay)?.date || '2026-09-26'
            }));
            setIsModalOpen(true);
          }} 
          className="fab-btn-luxury" 
          aria-label="Add Item"
        >
          <Plus size={26} />
        </button>
      )}

      {/* DOCK NAV */}
      {!loading && (
        <nav className="dock-nav">
          {[
            { id: 'itinerary', label: 'Plan', icon: <Calendar size={18} /> },
            { id: 'packing', label: 'Checklist', icon: <CheckSquare size={18} /> },
            { id: 'party', label: 'Travelers', icon: <Users size={18} /> },
            { id: 'contacts', label: 'Directory', icon: <Phone size={18} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setFilterChoice('All'); }}
              className={`dock-btn ${activeTab === t.id ? 'active' : ''}`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* EDIT DAY GOAL MODAL */}
      {isEditingTipModal && (
        <div className="modal-overlay" onClick={() => setIsEditingTipModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Day {selectedDay} Focus / Note</h2>
              <button onClick={() => setIsEditingTipModal(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveDayTip}>
              <p style={{ fontSize: '0.78rem', color: '#78716c', marginBottom: '8px' }}>
                Enter custom guidance, darshan timings, or reminders for this day. Leave blank to auto-summarize your activities.
              </p>
              <textarea
                value={tipInput}
                onChange={(e) => setTipInput(e.target.value)}
                placeholder="e.g., Direct drive to Prayagraj; check-in at Kashi Math and rest."
                rows={4}
                className="input-box"
                style={{ resize: 'vertical' }}
              />
              <button type="submit" className="btn-cta">
                Save Day Focus
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {activeTab === 'itinerary' && `Day ${selectedDay} Schedule`}
                {activeTab === 'packing' && 'Add Checklist Item'}
                {activeTab === 'party' && 'Register Member / Bag'}
                {activeTab === 'contacts' && 'Add Emergency Contact'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            {/* ITINERARY MODAL FORM */}
            {activeTab === 'itinerary' && (
              <form onSubmit={addItineraryItem}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <select
                    value={newActivity.type}
                    onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                    className="select-box"
                  >
                    <option value="Activity">Sightseeing / Darshan</option>
                    <option value="Drive">🚗 Road Transit / Cab</option>
                    <option value="Flight">✈️ Flight</option>
                  </select>
                  <select
                    value={newActivity.location}
                    onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                    className="select-box"
                  >
                    <option value="Transit (VNS → Prayagraj)">VNS Airport → Prayagraj</option>
                    <option value="Prayagraj">Prayagraj</option>
                    <option value="Transit (Prayagraj → Ayodhya)">Prayagraj → Ayodhya</option>
                    <option value="Ayodhya">Ayodhya</option>
                    <option value="Transit (Ayodhya → Varanasi)">Ayodhya → Varanasi</option>
                    <option value="Varanasi">Varanasi</option>
                    <option value="Transit (COK → VNS)">COK → VNS (Flight)</option>
                    <option value="Transit (VNS → COK)">VNS → COK (Flight)</option>
                  </select>
                </div>

                {(newActivity.type === 'Flight' || newActivity.type === 'Drive') && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder={newActivity.type === 'Drive' ? "Vehicle (e.g. Innova / Traveller)" : "Flight No (e.g. 6E 543)"}
                      value={newActivity.flight_no}
                      onChange={(e) => setNewActivity({ ...newActivity, flight_no: e.target.value })}
                      className="input-box"
                    />
                    <input
                      type="text"
                      placeholder={newActivity.type === 'Drive' ? "Duration (e.g. 1:30 PM - 4:30 PM)" : "Time (e.g. 06:15 - 12:30)"}
                      value={newActivity.time_info}
                      onChange={(e) => setNewActivity({ ...newActivity, time_info: e.target.value })}
                      className="input-box"
                    />
                  </div>
                )}

                <input
                  type="text"
                  placeholder={newActivity.type === 'Drive' ? "Destination (e.g. Drive to Prayagraj & Stay at Kashi Math)" : newActivity.type === 'Flight' ? "Flight Route" : "Activity or Temple (e.g. Sankat Mochan)"}
                  value={newActivity.activity}
                  onChange={(e) => setNewActivity({ ...newActivity, activity: e.target.value })}
                  className="input-box"
                  required
                />

                {newActivity.type !== 'Flight' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <select
                      value={newActivity.accessibility}
                      onChange={(e) => setNewActivity({ ...newActivity, accessibility: e.target.value })}
                      className="select-box"
                    >
                      <option value="normal">Standard Walk</option>
                      <option value="stroller_yes">Stroller Friendly</option>
                      <option value="stairs">Ghat Stairs / Narrow Galies</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Google Maps link (optional)"
                      value={newActivity.map_link}
                      onChange={(e) => setNewActivity({ ...newActivity, map_link: e.target.value })}
                      className="input-box"
                    />
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Notes (e.g. Driver contact, Room booked, Toll/Highway notes)"
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                  className="input-box"
                />
                <button type="submit" className="btn-cta">
                  Save to Schedule
                </button>
              </form>
            )}

            {/* CHECKLIST MODAL FORM */}
            {activeTab === 'packing' && (
              <form onSubmit={addPackingItem}>
                <input
                  type="text"
                  placeholder="Item Name (e.g. Diapers, Aadhaar Card)"
                  value={newItem.item}
                  onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                  className="input-box"
                  required
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <select
                    value={newItem.assigned_to}
                    onChange={(e) => setNewItem({ ...newItem, assigned_to: e.target.value })}
                    className="select-box"
                  >
                    <option value="All">Traveler: All</option>
                    {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                  <select
                    value={newItem.target_bag}
                    onChange={(e) => setNewItem({ ...newItem, target_bag: e.target.value })}
                    className="select-box"
                  >
                    <option value="General">Bag: General</option>
                    {bags.map(b => <option key={b.id} value={b.bag_name}>{b.bag_name}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-cta">
                  Add to Checklist
                </button>
              </form>
            )}

            {/* TRAVELERS & BAGS MODAL FORM */}
            {activeTab === 'party' && (
              <div>
                <form onSubmit={addMember} style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.9rem', fontWeight: '800', marginBottom: '6px' }}>+ Add Traveler</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="input-box"
                      required
                    />
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      className="select-box"
                    >
                      <option value="Adult">Adult</option>
                      <option value="Senior">Senior</option>
                      <option value="Child">Child</option>
                      <option value="Toddler">Toddler</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-cta">Save Member</button>
                </form>

                <hr style={{ border: 'none', borderTop: '1px solid #e7e5e4', margin: '14px 0' }} />

                <form onSubmit={addBag}>
                  <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.9rem', fontWeight: '800', marginBottom: '6px' }}>+ Register Luggage</h4>
                  <input
                    type="text"
                    placeholder="Bag identifier (e.g. Red Cabin Trolley)"
                    value={newBag.bag_name}
                    onChange={(e) => setNewBag({ ...newBag, bag_name: e.target.value })}
                    className="input-box"
                    required
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <select
                      value={newBag.bag_type}
                      onChange={(e) => setNewBag({ ...newBag, bag_type: e.target.value })}
                      className="select-box"
                    >
                      <option value="Trolley">Large Trolley</option>
                      <option value="Cabin">Cabin Bag</option>
                      <option value="Backpack">Daypack</option>
                      <option value="Stroller">Stroller</option>
                      <option value="Handbag">Sling / Purse</option>
                    </select>
                    <select
                      value={newBag.assigned_to}
                      onChange={(e) => setNewBag({ ...newBag, assigned_to: e.target.value })}
                      className="select-box"
                    >
                      <option value="">Caretaker</option>
                      {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn-cta">Save Bag</button>
                </form>
              </div>
            )}

            {/* DIRECTORY MODAL FORM */}
            {activeTab === 'contacts' && (
              <form onSubmit={addContact}>
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="input-box"
                  required
                />
                <input
                  type="text"
                  placeholder="Role (e.g. Taxi Driver, Hotel Reception)"
                  value={newContact.role}
                  onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  className="input-box"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (+91 ...)"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="input-box"
                  required
                />
                <button type="submit" className="btn-cta">Save Contact</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}