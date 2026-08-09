'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Utensils, Database, Settings, Video, Receipt } from 'lucide-react';
import VoiceCallAgent from '../components/VoiceCallAgent';
import RunningCart from '../components/RunningCart';
import PrismaModelInspector from '../components/PrismaModelInspector';
import MenuCatalog from '../components/MenuCatalog';
import OrdersHistory from '../components/OrdersHistory';
import SettingsModal from '../components/SettingsModal';
import DemoGuideModal from '../components/DemoGuideModal';
import { fetchCurrentOrder, fetchGroqKeyStatus } from '../services/apiClient';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'voice' | 'menu' | 'orders' | 'schema'>('voice');
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);

  useEffect(() => {
    // 1. Restore key from localStorage immediately if present
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('groq_api_key');
      if (savedKey) {
        setApiKey(savedKey);
      }
    }

    // 2. Fetch Groq API key status from backend
    fetchGroqKeyStatus()
      .then(res => {
        if (res.apiKey) {
          setApiKey(res.apiKey);
          if (typeof window !== 'undefined') {
            localStorage.setItem('groq_api_key', res.apiKey);
          }
        }
      })
      .catch(err => console.warn('Could not fetch Groq key status:', err));

    fetchCurrentOrder()
      .then(res => {
        if (res.order) setCurrentOrder(res.order);
      })
      .catch(err => console.warn('Could not fetch initial order:', err));
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    if (typeof window !== 'undefined') {
      if (newKey) {
        localStorage.setItem('groq_api_key', newKey);
      } else {
        localStorage.removeItem('groq_api_key');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-3 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Navigation Header */}
      <header className="glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:px-6 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 border border-slate-800 shadow-2xl">
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2.5 sm:p-3 bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 rounded-2xl shadow-lg shadow-orange-500/20 text-slate-950 font-black">
              <Utensils className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                FOODCRAFT
              </h1>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
              title="Groq AI Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation View Switcher */}
        <div className="w-full md:w-auto overflow-x-auto flex items-center justify-start sm:justify-center gap-1 bg-slate-950/80 p-1 sm:p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('voice')}
            className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${activeTab === 'voice'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Voice Order Agent
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${activeTab === 'menu'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Menu Catalog
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${activeTab === 'orders'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Orders History
          </button>
        </div>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
            title="Groq AI Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'voice' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <VoiceCallAgent
                onOrderUpdated={setCurrentOrder}
                apiKey={apiKey}
              />
            </div>
            <div className="lg:col-span-5">
              <RunningCart
                order={currentOrder}
                onOrderUpdated={setCurrentOrder}
              />
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <MenuCatalog />
        )}

        {activeTab === 'orders' && (
          <OrdersHistory />
        )}

        {activeTab === 'schema' && (
          <PrismaModelInspector />
        )}
      </main>

      {/* Footer */}
      <footer className="pt-4 border-t border-slate-900 text-xs text-slate-500 flex flex-wrap justify-between items-center gap-2 font-mono">
        {/* <div>Code Brew Labs</div> */}
        {/* <div>Data Schema: PostgreSQL / Prisma ORM • Realtime Web Speech STT/TTS</div> */}
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
      />
    </div>
  );
}
