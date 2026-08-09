'use client';

import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Edit2, Trash2, X, Check, DollarSign, Tag } from 'lucide-react';
import { fetchMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/apiClient';

interface Props {
  onSelectItem?: (item: any) => void;
}

const DEFAULT_CATEGORIES = [
  { id: 'cat-burgers', name: 'Burgers', items: [] },
  { id: 'cat-pizza', name: 'Pizza', items: [] },
  { id: 'cat-sides', name: 'Sides & Fries', items: [] },
  { id: 'cat-drinks', name: 'Beverages', items: [] },
  { id: 'cat-desserts', name: 'Desserts', items: [] }
];

export default function MenuCatalog({ onSelectItem }: Props) {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const availableCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    isAvailable: true
  });

  const loadMenu = async () => {
    try {
      const data = await fetchMenu();
      if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Ensure formData.categoryId is valid whenever availableCategories or modal state updates
  useEffect(() => {
    if (availableCategories.length > 0) {
      if (!formData.categoryId || !availableCategories.some(c => c.id === formData.categoryId)) {
        setFormData(prev => ({ ...prev, categoryId: availableCategories[0].id }));
      }
    }
  }, [categories, isModalOpen]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      basePrice: '199.00',
      categoryId: availableCategories[0]?.id || 'cat-burgers',
      isAvailable: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      basePrice: item.basePrice.toString(),
      categoryId: item.categoryId || availableCategories[0]?.id || '',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMenuItem(itemId);
      await loadMenu();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.basePrice || !formData.categoryId) return;

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        categoryId: formData.categoryId,
        isAvailable: formData.isAvailable
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, payload);
      } else {
        await createMenuItem(payload);
      }

      setIsModalOpen(false);
      await loadMenu();
    } catch (err) {
      console.error('Failed to save menu item:', err);
    }
  };

  const sortNewestFirst = (items: any[]) =>
    [...items].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const filteredItems = sortNewestFirst(
    activeCategory === 'all'
      ? availableCategories.flatMap(c => c.items || [])
      : availableCategories.find(c => c.id === activeCategory)?.items || []
  );

  return (
    <div className="glass-panel rounded-3xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Digital Food Catalogue & Modifiers
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {filteredItems.length} Dishes
              </span>
            </h2>
            <p className="text-xs text-slate-400">Add, Edit, and Manage Menu Items & Customizations</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add New Dish
          </button>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[460px] overflow-y-auto pr-1">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                  {item.name}
                </h3>

                <div className="flex items-center space-x-2">
                  <span className="font-mono font-extrabold text-amber-400 text-sm bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    ₹{item.basePrice?.toFixed(2)}
                  </span>
                  {/* Edit / Delete Actions */}
                  <button
                    onClick={(e) => openEditModal(item, e)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                    title="Edit Dish"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Delete Dish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.description}</p>

              {/* Modifier Groups Preview */}
              {item.modifierGroups && item.modifierGroups.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Available Customizations:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.modifierGroups.map((mg: any) => (
                      <span
                        key={mg.id}
                        className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono"
                      >
                        {mg.name} ({mg.options?.length || 0} options)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                  <Utensils className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? 'Edit Dish Item' : 'Add New Dish Item'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Double Bacon Avocado Burger"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.basePrice}
                    onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="199.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {availableCategories.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white py-1">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Fresh ingredients, house sauce, toasted brioche..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="isAvailable" className="text-slate-300 font-semibold cursor-pointer">
                  Available in Restaurant Menu
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md"
                >
                  {editingItem ? 'Save Changes' : 'Create Dish Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
