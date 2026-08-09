'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, ShieldCheck, CheckCircle2, AlertTriangle, Loader2, Activity, RefreshCw, Zap } from 'lucide-react';
import { updateGroqApiKey, fetchGroqQuota, fetchGroqKeyStatus } from '../services/apiClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

interface QuotaInfo {
  limitRequestsPerDay: number | null;
  remainingRequests: number | null;
  limitTokensPerDay: number | null;
  remainingTokens: number | null;
  resetRequestsAt: string | null;
  resetTokensAt: string | null;
  lastUpdated: string | null;
}

function QuotaBar({ label, used, total, color }: { label: string; used: number | null; total: number | null; color: string }) {
  if (total === null || used === null) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>{label}</span>
          <span>No data yet — make a voice order to see quota</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-0 bg-slate-700 rounded-full" />
        </div>
      </div>
    );
  }
  const pct = Math.max(0, Math.min(100, (used / total) * 100));
  const statusColor = pct > 80 ? 'text-rose-400' : pct > 50 ? 'text-amber-400' : 'text-emerald-400';
  const barColor = pct > 80 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-500' : color;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[11px] font-mono">
        <span className="text-slate-400">{label}</span>
        <span className={`font-bold ${statusColor}`}>
          {used.toLocaleString()} / {total.toLocaleString()} remaining ({pct.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function SettingsModal({ isOpen, onClose, apiKey, onSaveApiKey }: Props) {
  const [inputKey, setInputKey] = useState<string>(apiKey);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [quotaLoading, setQuotaLoading] = useState<boolean>(false);

  const loadQuota = async () => {
    setQuotaLoading(true);
    try {
      const res = await fetchGroqQuota();
      if (res.quota) setQuota(res.quota);
    } catch {
      // ignore
    } finally {
      setQuotaLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const currentKey = apiKey || (typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') : '') || '';
      setInputKey(currentKey);
      setSaveState('idle');
      loadQuota();

      if (!currentKey) {
        fetchGroqKeyStatus().then(res => {
          if (res.apiKey) {
            setInputKey(res.apiKey);
            onSaveApiKey(res.apiKey);
          }
        }).catch(() => {});
      }
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const trimmed = inputKey.trim();
    setSaveState('saving');
    setErrorMsg('');

    try {
      await updateGroqApiKey(trimmed);
      onSaveApiKey(trimmed);
      setSaveState('success');
      setTimeout(() => {
        setSaveState('idle');
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update key');
      setSaveState('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 sm:space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Engine & Groq Cloud Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Key Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-orange-400" />
            Groq Cloud API Key
          </label>
          <input
            type="text"
            value={inputKey}
            onChange={(e) => { setInputKey(e.target.value); setSaveState('idle'); }}
            placeholder="gsk_..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-orange-500"
          />
          <p className="text-xs text-slate-500 mt-1.5">
            Get your free key at{' '}
            <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-orange-400 underline hover:text-orange-300">
              console.groq.com
            </a>. Updates backend & frontend instantly.
          </p>
        </div>

        {/* Save Feedback */}
        {saveState === 'success' && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            API key updated successfully on backend & frontend!
          </div>
        )}
        {saveState === 'error' && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Live Quota Panel */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800/80 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Activity className="w-4 h-4 text-orange-400" />
              Live Groq API Quota
            </div>
            <button
              onClick={loadQuota}
              disabled={quotaLoading}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
              title="Refresh quota"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${quotaLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {quota?.lastUpdated ? (
            <div className="space-y-4">
              <QuotaBar
                label="🔢 Requests Remaining"
                used={quota.remainingRequests}
                total={quota.limitRequestsPerDay}
                color="bg-orange-500"
              />
              <QuotaBar
                label="🧠 Tokens Remaining"
                used={quota.remainingTokens}
                total={quota.limitTokensPerDay}
                color="bg-blue-500"
              />
              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono text-slate-500">
                {quota.resetRequestsAt && (
                  <div className="bg-slate-900 px-3 py-2 rounded-lg">
                    <span className="text-slate-400">Requests reset in:</span>
                    <div className="text-orange-400 font-bold mt-0.5">{quota.resetRequestsAt}</div>
                  </div>
                )}
                {quota.resetTokensAt && (
                  <div className="bg-slate-900 px-3 py-2 rounded-lg">
                    <span className="text-slate-400">Tokens reset in:</span>
                    <div className="text-blue-400 font-bold mt-0.5">{quota.resetTokensAt}</div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-600 font-mono">
                Last checked: {new Date(quota.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs text-slate-500 py-2">
              <Zap className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Quota data will appear here after you make your first voice order. Data is read from Groq API response headers in real-time.</span>
            </div>
          )}
        </div>

        {/* Dual-Engine Info */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <span>Powered by Groq Cloud (llama-3.3-70b-versatile). Falls back to local NLP engine if quota runs out.</span>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 pt-2 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 text-slate-950 hover:bg-orange-400 transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {saveState === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saveState === 'saving' ? 'Saving...' : 'Save & Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
