import React, { useState, useEffect } from 'react';
import {
  ClipboardList, XCircle, Save, Phone, Mail,
  MessageSquare, ChevronRight, ArrowLeft, User, Star, Edit3, Check
} from 'lucide-react';
import { prospectAPI, prospectCategoryAPI } from '../services/api';

const FOLLOW_UP_STATUSES = [
  { value: '', label: 'Durum Seç', color: 'text-gray-500 bg-gray-100' },
  { value: 'bekliyor', label: '⏳ Görüşme Bekleniyor', color: 'text-yellow-700 bg-yellow-100' },
  { value: 'gorusuldu', label: '💬 Görüşüldü', color: 'text-blue-700 bg-blue-100' },
  { value: 'ilgileniyor', label: '✅ İlgileniyor', color: 'text-green-700 bg-green-100' },
  { value: 'ilgilenmiyor', label: '❌ İlgilenmiyor', color: 'text-red-700 bg-red-100' },
  { value: 'dusunuyor', label: '🤔 Düşünüyor', color: 'text-purple-700 bg-purple-100' },
  { value: 'katildi', label: '🎉 Katıldı', color: 'text-emerald-700 bg-emerald-100' },
];

const FollowUpPage = ({ user }) => {
  const [prospects, setProspects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        prospectAPI.getAll(),
        prospectCategoryAPI.getAll(),
      ]);
      const followUps = pRes.data.filter(p => p.custom_fields?.in_follow_up);
      setProspects(followUps);
      setCategories(cRes.data);
    } catch (e) {
      console.error('Yükleme hatası:', e);
    } finally {
      setLoading(false);
    }
  };

  const selectPerson = (person) => {
    setSelectedId(person.id);
    setEditForm({
      name: person.name || '',
      phone: person.phone || '',
      email: person.email || '',
      notes: person.notes || '',
      category_id: person.category_id || '',
      rating: person.rating || 0,
      follow_up_status: person.custom_fields?.follow_up_status || '',
      follow_up_note: person.custom_fields?.follow_up_note || '',
    });
    setSaved(false);
  };

  const selectedPerson = prospects.find(p => p.id === selectedId);

  const handleSave = async () => {
    if (!selectedPerson) return;
    setSaving(true);
    try {
      await prospectAPI.update(selectedPerson.id, {
        ...selectedPerson,
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        notes: editForm.notes,
        category_id: editForm.category_id,
        rating: editForm.rating,
        custom_fields: {
          ...selectedPerson.custom_fields,
          in_follow_up: true,
          follow_up_status: editForm.follow_up_status,
          follow_up_note: editForm.follow_up_note,
        },
      });
      // Update local state
      setProspects(prev => prev.map(p =>
        p.id === selectedPerson.id
          ? {
              ...p,
              name: editForm.name,
              phone: editForm.phone,
              email: editForm.email,
              notes: editForm.notes,
              category_id: editForm.category_id,
              rating: editForm.rating,
              custom_fields: {
                ...p.custom_fields,
                follow_up_status: editForm.follow_up_status,
                follow_up_note: editForm.follow_up_note,
              },
            }
          : p
      ));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Kaydetme hatası:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromFollowUp = async (person) => {
    if (!window.confirm(`${person.name} takip listesinden çıkarılsın mı?`)) return;
    try {
      await prospectAPI.update(person.id, {
        ...person,
        custom_fields: { ...person.custom_fields, in_follow_up: false },
      });
      setProspects(prev => prev.filter(p => p.id !== person.id));
      if (selectedId === person.id) {
        setSelectedId(null);
        setEditForm(null);
      }
    } catch (e) {
      console.error('Çıkarma hatası:', e);
    }
  };

  const getStatusConf = (val) =>
    FOLLOW_UP_STATUSES.find(s => s.value === val) || FOLLOW_UP_STATUSES[0];

  const getCategoryName = (id) =>
    categories.find(c => c.id === id)?.name || '';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center">
          <ClipboardList size={18} className="text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Takip Listesi</h2>
          <p className="text-xs text-gray-400">{prospects.length} kişi</p>
        </div>
      </div>

      {/* Empty State */}
      {prospects.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClipboardList size={28} className="text-teal-400" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">Takip Listesi Boş</h3>
          <p className="text-gray-400 text-sm">
            İsim Listesi'ndeki <span className="text-orange-500 font-medium">→</span> ikonuna tıklayarak buraya ekleyin.
          </p>
        </div>
      )}

      {/* Two-panel layout */}
      {prospects.length > 0 && (
        <div className="flex gap-4 min-h-[500px]">
          {/* Left: Name List */}
          <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kişiler</p>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              {prospects.map(person => {
                const statusConf = getStatusConf(person.custom_fields?.follow_up_status);
                const isSelected = person.id === selectedId;
                return (
                  <button
                    key={person.id}
                    onClick={() => selectPerson(person)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-teal-50 border-l-4 border-l-teal-500'
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${
                      isSelected ? 'bg-teal-500' : 'bg-gradient-to-br from-teal-400 to-cyan-500'
                    }`}>
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? 'text-teal-700' : 'text-gray-800'}`}>
                        {person.name}
                      </p>
                      {person.custom_fields?.follow_up_status && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Detail Panel */}
          <div className="flex-1">
            {!selectedPerson && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex items-center justify-center p-12 text-center">
                <div>
                  <User size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">Detayları görmek için sol listeden bir kişi seçin</p>
                </div>
              </div>
            )}

            {selectedPerson && editForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* Panel Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {editForm.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{selectedPerson.name}</h3>
                      {getCategoryName(selectedPerson.category_id) && (
                        <span className="text-xs text-gray-500">{getCategoryName(selectedPerson.category_id)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFromFollowUp(selectedPerson)}
                    title="Takip Listesinden Çıkar"
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                  >
                    <XCircle size={14} /> Listeden Çıkar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kişisel Bilgiler */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Kişisel Bilgiler</h4>

                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">İsim Soyisim</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-300 focus:border-teal-300 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1 flex items-center gap-1"><Phone size={11} /> Telefon</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-300 outline-none"
                        placeholder="0555 555 55 55"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1 flex items-center gap-1"><Mail size={11} /> Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-300 outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">Kategori</label>
                      <select
                        value={editForm.category_id}
                        onChange={e => setEditForm(f => ({ ...f, category_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-300 outline-none"
                      >
                        <option value="">Kategori Seç</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1 flex items-center gap-1"><Star size={11} /> Puan</label>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <button
                            key={s}
                            onClick={() => setEditForm(f => ({ ...f, rating: s }))}
                            className={`w-7 h-7 rounded text-base ${s <= editForm.rating ? 'text-yellow-400' : 'text-gray-200'} hover:scale-110 transition-transform`}
                          >★</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1 flex items-center gap-1"><MessageSquare size={11} /> Notlar (İsim Listesi)</label>
                      <textarea
                        rows={2}
                        value={editForm.notes}
                        onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-teal-300 outline-none"
                        placeholder="Genel notlar..."
                      />
                    </div>
                  </div>

                  {/* Görüşme Takip Bilgileri */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Görüşme Takibi</h4>

                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">Görüşme Durumu</label>
                      <select
                        value={editForm.follow_up_status}
                        onChange={e => setEditForm(f => ({ ...f, follow_up_status: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-300 ${
                          getStatusConf(editForm.follow_up_status).color
                        } border-transparent`}
                      >
                        {FOLLOW_UP_STATUSES.map(s => (
                          <option key={s.value} value={s.value} className="bg-white text-gray-800">{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1 flex items-center gap-1"><Edit3 size={11} /> Görüşme Notu</label>
                      <textarea
                        rows={8}
                        value={editForm.follow_up_note}
                        onChange={e => setEditForm(f => ({ ...f, follow_up_note: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-teal-300 outline-none"
                        placeholder="Görüşme sonucu, detaylar, hatırlatmalar..."
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      saved
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                    } disabled:opacity-60`}
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : saved ? (
                      <Check size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    {saved ? 'Kaydedildi!' : 'Kaydet'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpPage;
