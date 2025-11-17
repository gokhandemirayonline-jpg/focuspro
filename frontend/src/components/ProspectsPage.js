import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Star,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { prospectAPI, prospectCategoryAPI, prospectColumnAPI } from '../services/api';

const ProspectsPage = ({ user = null }) => {
  // State management
  const [prospects, setProspects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customColumns, setCustomColumns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sorting, setSorting] = useState([]);
  
  // Check if user exists
  if (!user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Yükleniyor...</h2>
          <p className="text-gray-600">Lütfen bekleyin</p>
        </div>
      </div>
    );
  }
  
  // Modals state
  const [showAddProspectModal, setShowAddProspectModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [editingProspect, setEditingProspect] = useState(null);
  
  // Form state
  const [prospectForm, setProspectForm] = useState({
    name: '',
    phone: '',
    email: '',
    category_id: '',
    rating: 0,
    notes: '',
    custom_fields: {},
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '📋',
    color: 'gray',
    order: 0,
  });
  
  const [columnForm, setColumnForm] = useState({
    column_name: '',
    column_type: 'text',
    order: 0,
    is_required: false,
  });

  // Load data on mount
  useEffect(() => {
    loadProspects();
    loadCategories();
    loadCustomColumns();
  }, []);

  const loadProspects = async () => {
    try {
      const response = await prospectAPI.getAll();
      setProspects(response.data);
    } catch (error) {
      console.error('Error loading prospects:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await prospectCategoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCustomColumns = async () => {
    try {
      const response = await prospectColumnAPI.getAll();
      setCustomColumns(response.data);
    } catch (error) {
      console.error('Error loading custom columns:', error);
    }
  };

  // Filtered prospects by category
  const filteredProspects = useMemo(() => {
    if (selectedCategory === 'all') return prospects;
    return prospects.filter((p) => p.category_id === selectedCategory);
  }, [prospects, selectedCategory]);

  // Table columns definition
  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'name',
        header: 'İsim',
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">{getValue()}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Telefon',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'category_id',
        header: 'Kategori',
        cell: ({ row, getValue }) => (
          <select
            value={getValue() || ''}
            onChange={(e) => updateProspectCategory(row.original.id, e.target.value)}
            className="px-2 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Kategori Seç</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        ),
      },
      {
        accessorKey: 'rating',
        header: 'Puan',
        cell: ({ row, getValue }) => (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={`cursor-pointer transition-colors ${
                  star <= getValue()
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
                onClick={() => updateProspectRating(row.original.id, star)}
              />
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'added_date',
        header: 'Eklenme Tarihi',
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return date.toLocaleDateString('tr-TR');
        },
      },
    ];

    // Add custom columns
    const customCols = customColumns.map((col) => ({
      accessorKey: `custom_fields.${col.column_name}`,
      header: col.column_name,
      cell: ({ row }) => {
        const value = row.original.custom_fields?.[col.column_name] || '';
        return (
          <input
            type={col.column_type === 'number' ? 'number' : col.column_type === 'date' ? 'date' : 'text'}
            value={value}
            onChange={(e) =>
              updateProspectCustomField(row.original.id, col.column_name, e.target.value)
            }
            className="px-2 py-1 border rounded text-sm w-full focus:ring-2 focus:ring-blue-500"
          />
        );
      },
    }));

    // Actions column
    const actionsColumn = {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditProspect(row.original)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteProspect(row.original.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    };

    return [...baseColumns, ...customCols, actionsColumn];
  }, [categories, customColumns, prospects]);

  // Table instance
  const table = useReactTable({
    data: filteredProspects,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // CRUD operations
  const handleAddProspect = async () => {
    try {
      await prospectAPI.create(prospectForm);
      loadProspects();
      setShowAddProspectModal(false);
      resetProspectForm();
    } catch (error) {
      console.error('Error adding prospect:', error);
      alert('Kişi eklenirken hata oluştu');
    }
  };

  const handleEditProspect = (prospect) => {
    setEditingProspect(prospect);
    setProspectForm({
      name: prospect.name,
      phone: prospect.phone || '',
      email: prospect.email || '',
      category_id: prospect.category_id || '',
      rating: prospect.rating || 0,
      notes: prospect.notes || '',
      custom_fields: prospect.custom_fields || {},
    });
    setShowAddProspectModal(true);
  };

  const handleUpdateProspect = async () => {
    try {
      await prospectAPI.update(editingProspect.id, prospectForm);
      loadProspects();
      setShowAddProspectModal(false);
      setEditingProspect(null);
      resetProspectForm();
    } catch (error) {
      console.error('Error updating prospect:', error);
      alert('Kişi güncellenirken hata oluştu');
    }
  };

  const handleDeleteProspect = async (id) => {
    if (!window.confirm('Bu kişiyi silmek istediğinize emin misiniz?')) return;
    try {
      await prospectAPI.delete(id);
      loadProspects();
    } catch (error) {
      console.error('Error deleting prospect:', error);
      alert('Kişi silinirken hata oluştu');
    }
  };

  const updateProspectCategory = async (prospectId, categoryId) => {
    try {
      const prospect = prospects.find((p) => p.id === prospectId);
      await prospectAPI.update(prospectId, { ...prospect, category_id: categoryId });
      loadProspects();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const updateProspectRating = async (prospectId, rating) => {
    try {
      const prospect = prospects.find((p) => p.id === prospectId);
      await prospectAPI.update(prospectId, { ...prospect, rating });
      loadProspects();
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  const updateProspectCustomField = async (prospectId, fieldName, value) => {
    try {
      const prospect = prospects.find((p) => p.id === prospectId);
      const updatedCustomFields = { ...prospect.custom_fields, [fieldName]: value };
      await prospectAPI.update(prospectId, {
        ...prospect,
        custom_fields: updatedCustomFields,
      });
      loadProspects();
    } catch (error) {
      console.error('Error updating custom field:', error);
    }
  };

  // Category management
  const handleAddCategory = async () => {
    try {
      await prospectCategoryAPI.create(categoryForm);
      loadCategories();
      setCategoryForm({ name: '', icon: '📋', color: 'gray', order: 0 });
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Kategori eklenirken hata oluştu');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
      await prospectCategoryAPI.delete(id);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Column management (Admin only)
  const handleAddColumn = async () => {
    try {
      await prospectColumnAPI.create(columnForm);
      loadCustomColumns();
      setColumnForm({
        column_name: '',
        column_type: 'text',
        order: 0,
        is_required: false,
      });
      setShowColumnModal(false);
    } catch (error) {
      console.error('Error adding column:', error);
      alert('Sütun eklenirken hata oluştu');
    }
  };

  const handleDeleteColumn = async (id) => {
    if (!window.confirm('Bu sütunu silmek istediğinize emin misiniz?')) return;
    try {
      await prospectColumnAPI.delete(id);
      loadCustomColumns();
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  const resetProspectForm = () => {
    setProspectForm({
      name: '',
      phone: '',
      email: '',
      category_id: '',
      rating: 0,
      notes: '',
      custom_fields: {},
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">İsim Listesi</h1>
        <p className="text-gray-600">Potansiyel müşterilerinizi yönetin</p>
      </div>

      {/* Top Bar - Categories and Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tümü ({prospects.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name} (
                {prospects.filter((p) => p.category_id === cat.id).length})
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingProspect(null);
                resetProspectForm();
                setShowAddProspectModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Yeni Kişi
            </button>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Settings size={20} />
              Kategoriler
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowColumnModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Sütun Ekle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          <span>
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Henüz kişi eklenmemiş
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Prospect Modal */}
      {showAddProspectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProspect ? 'Kişi Düzenle' : 'Yeni Kişi Ekle'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddProspectModal(false);
                    setEditingProspect(null);
                    resetProspectForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İsim *
                  </label>
                  <input
                    type="text"
                    value={prospectForm.name}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ad Soyad"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={prospectForm.phone}
                      onChange={(e) =>
                        setProspectForm({ ...prospectForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0555 555 55 55"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={prospectForm.email}
                      onChange={(e) =>
                        setProspectForm({ ...prospectForm, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={prospectForm.category_id}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, category_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Kategori Seç</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puan
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={32}
                        className={`cursor-pointer transition-colors ${
                          star <= prospectForm.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        onClick={() =>
                          setProspectForm({ ...prospectForm, rating: star })
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Fields */}
                {customColumns.map((col) => (
                  <div key={col.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {col.column_name}
                      {col.is_required && ' *'}
                    </label>
                    {col.column_type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={prospectForm.custom_fields[col.column_name] || false}
                        onChange={(e) =>
                          setProspectForm({
                            ...prospectForm,
                            custom_fields: {
                              ...prospectForm.custom_fields,
                              [col.column_name]: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5"
                      />
                    ) : (
                      <input
                        type={
                          col.column_type === 'number'
                            ? 'number'
                            : col.column_type === 'date'
                            ? 'date'
                            : 'text'
                        }
                        value={prospectForm.custom_fields[col.column_name] || ''}
                        onChange={(e) =>
                          setProspectForm({
                            ...prospectForm,
                            custom_fields: {
                              ...prospectForm.custom_fields,
                              [col.column_name]: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required={col.is_required}
                      />
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notlar
                  </label>
                  <textarea
                    value={prospectForm.notes}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Notlarınızı buraya yazın..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddProspectModal(false);
                    setEditingProspect(null);
                    resetProspectForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={editingProspect ? handleUpdateProspect : handleAddProspect}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingProspect ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Kategorileri Yönet
                </h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Add Category Form */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Yeni Kategori Ekle</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    placeholder="Kategori Adı"
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, icon: e.target.value })
                    }
                    placeholder="İkon (emoji)"
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
                <button
                  onClick={handleAddCategory}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                >
                  Kategori Ekle
                </button>
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Column Management Modal (Admin Only) */}
      {showColumnModal && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Sütunları Yönet
                </h2>
                <button
                  onClick={() => setShowColumnModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Add Column Form */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Yeni Sütun Ekle</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={columnForm.column_name}
                    onChange={(e) =>
                      setColumnForm({ ...columnForm, column_name: e.target.value })
                    }
                    placeholder="Sütun Adı (örn: Şirket)"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={columnForm.column_type}
                    onChange={(e) =>
                      setColumnForm({ ...columnForm, column_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="text">Metin</option>
                    <option value="number">Sayı</option>
                    <option value="date">Tarih</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={columnForm.is_required}
                      onChange={(e) =>
                        setColumnForm({
                          ...columnForm,
                          is_required: e.target.checked,
                        })
                      }
                    />
                    <span>Zorunlu Alan</span>
                  </label>
                </div>
                <button
                  onClick={handleAddColumn}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full"
                >
                  Sütun Ekle
                </button>
              </div>

              {/* Columns List */}
              <div className="space-y-2">
                <h3 className="font-semibold mb-2">Mevcut Sütunlar</h3>
                {customColumns.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Henüz özel sütun eklenmemiş
                  </p>
                ) : (
                  customColumns.map((col) => (
                    <div
                      key={col.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{col.column_name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({col.column_type})
                          {col.is_required && ' - Zorunlu'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteColumn(col.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProspectsPage;
