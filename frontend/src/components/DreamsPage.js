import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Calendar, ChevronRight } from 'lucide-react';
import { dreamPriorityAPI } from '../services/api';

const DreamsPage = ({ user }) => {
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState(null);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    title: '',
    initial_dreams: Array(10).fill(''),
    final_priorities: [],
    descriptions: {},
    target_income: '',
    target_months: '',
    daily_hours: '',
  });

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const response = await dreamPriorityAPI.getAll();
      setAnalyses(response.data);
      if (response.data.length > 0 && !selectedAnalysis) {
        setSelectedAnalysis(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu analizi silmek istediğinize emin misiniz?')) return;
    try {
      await dreamPriorityAPI.delete(id);
      loadAnalyses();
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
    }
  };

  const handleStartWizard = () => {
    setWizardData({
      title: '',
      initial_dreams: Array(10).fill(''),
      final_priorities: [],
      descriptions: {},
      target_income: '',
      target_months: '',
      daily_hours: '',
    });
    setWizardStep(1);
    setEditingAnalysis(null);
    setShowWizard(true);
  };

  const handleSaveWizard = async () => {
    try {
      const dataToSave = {
        ...wizardData,
        final_priorities: wizardData.final_priorities.length > 0 
          ? wizardData.final_priorities 
          : wizardData.initial_dreams.filter(d => d.trim()),
      };

      if (editingAnalysis) {
        await dreamPriorityAPI.update(editingAnalysis.id, dataToSave);
      } else {
        await dreamPriorityAPI.create(dataToSave);
      }
      
      await loadAnalyses();
      setShowWizard(false);
      setWizardStep(1);
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Analiz kaydedilirken hata oluştu');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Analysis List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Değer Analizlerim
              </h3>
              <button
                onClick={() => setShowWizard(true)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Yeni Analiz
              </button>
            </div>

            {analyses.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Star size={48} className="mx-auto mb-3 opacity-30" />
                <p>Henüz değer analizi yok</p>
                <p className="text-sm mt-1">Yeni analiz başlatın</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    onClick={() => setSelectedAnalysis(analysis)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAnalysis?.id === analysis.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                          {analysis.title || 'İsimsiz Analiz'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          {formatDate(analysis.created_at)}
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                    {analysis.top_priority && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                          {analysis.top_priority}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Analysis Detail */}
        <div className="lg:col-span-3">
          {selectedAnalysis ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {selectedAnalysis.title || 'Analiz Detayı'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(selectedAnalysis.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingAnalysis(selectedAnalysis)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedAnalysis.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Top Priority */}
              {selectedAnalysis.top_priority && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={24} className="text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      En Önemli Değer
                    </h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 font-medium">
                    {selectedAnalysis.top_priority}
                  </p>
                </div>
              )}

              {/* All Priorities */}
              {selectedAnalysis.final_priorities && selectedAnalysis.final_priorities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                    Öncelik Sırası
                  </h4>
                  <div className="space-y-2">
                    {selectedAnalysis.final_priorities.map((priority, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 dark:text-gray-100 font-medium">
                            {priority}
                          </p>
                          {selectedAnalysis.descriptions?.[priority] && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {selectedAnalysis.descriptions[priority]}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {(selectedAnalysis.target_income || selectedAnalysis.target_months || selectedAnalysis.daily_hours) && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                    Hedef Bilgileri
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedAnalysis.target_income && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Hedef Gelir</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {selectedAnalysis.target_income}
                        </p>
                      </div>
                    )}
                    {selectedAnalysis.target_months && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Hedef Süre</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {selectedAnalysis.target_months} ay
                        </p>
                      </div>
                    )}
                    {selectedAnalysis.daily_hours && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Günlük Saat</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {selectedAnalysis.daily_hours} saat
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <Star size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Analiz Seçin
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Sol taraftan bir analiz seçin veya yeni analiz başlatın
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Note: Wizard and Edit modal will be added by updating the existing wizard in App.js */}
    </div>
  );
};

export default DreamsPage;
