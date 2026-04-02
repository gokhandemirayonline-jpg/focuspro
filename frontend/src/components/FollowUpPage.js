import React, { useState, useEffect } from 'react';
import {
  ClipboardList, ArrowRightCircle, Trash2, Save, User,
  Phone, Mail, CheckCircle2, Clock, XCircle, MessageSquare
} from 'lucide-react';
import { prospectAPI } from '../services/api';

const FOLLOW_UP_STATUSES = [
  { value: '', label: 'Durum Seç', color: 'bg-gray-100 text-gray-600' },
  { value: 'bekliyor', label: '⏳ Görüşme Bekleniyor', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'gorusuldu', label: '💬 Görüşüldü', color: 'bg-blue-100 text-blue-700' },
  { value: 'ilgileniyor', label: '✅ İlgileniyor', color: 'bg-green-100 text-green-700' },
  { value: 'ilgilenmiyor', label: '❌ İlgilenmiyor', color: 'bg-red-100 text-red-700' },
  { value: 'dusunuyor', label: '🤔 Düşünüyor', color: 'bg-purple-100 text-purple-700' },
  { value: 'katildi', label: '🎉 Katıldı', color: 'bg-emerald-100 text-emerald-700' },
];

const FollowUpPage = ({ user }) => {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState({}); // { id: note_text }
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadFollowUps();
  }, []);

  const loadFollowUps = async () => {
    setLoading(true);
    try {
      const response = await prospectAPI.getAll();
      const all = response.data;
      setProspects(all.filter(p => p.custom_fields?.in_follow_up));
    } catch (e) {
      console.error('Follow-up listesi yüklenemedi:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateFollowUpField = async (prospect, field, value) => {
    try {
      await prospectAPI.update(prospect.id, {
        ...prospect,
        custom_fields: {
          ...prospect.custom_fields,
          [field]: value,
        },
      });
      setProspects(prev =>
        prev.map(p =>
          p.id === prospect.id
            ? { ...p, custom_fields: { ...p.custom_fields, [field]: value } }
            : p
        )
      );
    } catch (e) {
      console.error('Güncelleme hatası:', e);
    }
  };

  const saveNote = async (prospect) => {
    const note = editingNotes[prospect.id] ?? prospect.custom_fields?.follow_up_note ?? '';
    setSavingId(prospect.id);
    await updateFollowUpField(prospect, 'follow_up_note', note);
    setSavingId(null);
    setEditingNotes(prev => { const s = { ...prev }; delete s[prospect.id]; return s; });
  };

  const removeFromFollowUp = async (prospect) => {
    if (!window.confirm(`${prospect.name} kişisi takip listesinden çıkarılsın mı?`)) return;
    try {
      await prospectAPI.update(prospect.id, {
        ...prospect,
        custom_fields: {
          ...prospect.custom_fields,
          in_follow_up: false,
        },
      });
      setProspects(prev => prev.filter(p => p.id !== prospect.id));
    } catch (e) {
      console.error('Çıkarma hatası:', e);
    }
  };

  const getStatusConfig = (value) =>
    FOLLOW_UP_STATUSES.find(s => s.value === value) || FOLLOW_UP_STATUSES[0];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <ClipboardList size={20} className="text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Takip Listesi</h2>
            <p className="text-sm text-gray-500">{prospects.length} kişi takipte</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {prospects.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={32} className="text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Takip Listesi Boş</h3>
          <p className="text-gray-400 text-sm">
            İsim Listesi'ndeki kişilerin yanındaki{' '}
            <span className="inline-flex items-center gap-1 text-orange-500 font-medium">
              <ArrowRightCircle size={14} /> gönder
            </span>{' '}
            ikonuna tıklayarak buraya ekleyebilirsiniz.
          </p>
        </div>
      )}

      {/* Follow-up Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prospects.map(prospect => {
          const status = prospect.custom_fields?.follow_up_status || '';
          const statusConf = getStatusConfig(status);
          const currentNote = editingNotes[prospect.id] !== undefined
            ? editingNotes[prospect.id]
            : (prospect.custom_fields?.follow_up_note || '');
          const hasUnsavedNote = editingNotes[prospect.id] !== undefined;

          return (
            <div key={prospect.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
              {/* Person Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {prospect.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{prospect.name}</p>
                    {prospect.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone size={11} /> {prospect.phone}
                      </p>
                    )}
                    {prospect.email && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail size={11} /> {prospect.email}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFromFollowUp(prospect)}
                  title="Takip Listesinden Çıkar"
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <XCircle size={16} />
                </button>
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Görüşme Durumu</label>
                <select
                  value={status}
                  onChange={e => updateFollowUpField(prospect, 'follow_up_status', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-300 ${statusConf.color} border-transparent`}
                >
                  {FOLLOW_UP_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1 block">
                  <MessageSquare size={12} /> Notlar
                </label>
                <textarea
                  rows={3}
                  value={currentNote}
                  onChange={e => setEditingNotes(prev => ({ ...prev, [prospect.id]: e.target.value }))}
                  placeholder="Görüşme notu, hatırlatma..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
              </div>

              {/* Save Note Button */}
              {hasUnsavedNote && (
                <button
                  onClick={() => saveNote(prospect)}
                  disabled={savingId === prospect.id}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm py-2 rounded-lg font-medium transition-colors disabled:opacity-60"
                >
                  {savingId === prospect.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Notu Kaydet
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FollowUpPage;
