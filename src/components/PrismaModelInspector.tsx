'use client';

import React, { useState, useEffect } from 'react';
import { Database, Table, GitFork, Activity, Code, RefreshCw } from 'lucide-react';
import { fetchSchemaInspector } from '../services/apiClient';

export default function PrismaModelInspector() {
  const [schemaData, setSchemaData] = useState<any>(null);
  const [activeTable, setActiveTable] = useState<string>('Order');
  const [activeTab, setActiveTab] = useState<'tables' | 'erd' | 'events'>('tables');
  const [loading, setLoading] = useState<boolean>(false);

  const loadSchema = async () => {
    setLoading(true);
    try {
      const data = await fetchSchemaInspector();
      setSchemaData(data);
    } catch (err) {
      console.error('Failed to load schema inspector data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchema();
  }, []);

  return (
    <div className="glass-panel rounded-3xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Prisma PostgreSQL Schema Inspector
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                Postgres / SQLite
              </span>
            </h2>
            <p className="text-xs text-slate-400">Live Relational Data Model • Keys • Foreign Relations • Audit Log</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'tables' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Table className="w-4 h-4" /> Live Tables
          </button>
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'erd' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <GitFork className="w-4 h-4" /> ERD Architecture
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'events' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" /> State Delta Logs
          </button>
          <button
            onClick={loadSchema}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all"
            title="Refresh Schema Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab 1: Live Tables Inspector */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          {/* Table Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {schemaData?.tables &&
              Object.keys(schemaData.tables).map(tableName => (
                <button
                  key={tableName}
                  onClick={() => setActiveTable(tableName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
                    activeTable === tableName
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{tableName}</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-cyan-300">
                    {schemaData.tables[tableName].count}
                  </span>
                </button>
              ))}
          </div>

          {/* Table Data View */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto max-h-[380px]">
            {schemaData?.tables?.[activeTable]?.rows?.length > 0 ? (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                  <tr>
                    {Object.keys(schemaData.tables[activeTable].rows[0]).map(key => (
                      <th key={key} className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {schemaData.tables[activeTable].rows.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-900/50 transition-all">
                      {Object.values(row).map((val: any, colIdx: number) => (
                        <td key={colIdx} className="px-4 py-2.5 max-w-[200px] truncate">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No rows currently recorded in <code>{activeTable}</code> table
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: ERD Diagram */}
      {activeTab === 'erd' && (
        <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {schemaData?.erdSchema?.models?.map((model: any) => (
              <div
                key={model.name}
                className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-bold text-cyan-400 font-mono text-sm">
                  <span>{model.name}</span>
                  <Table className="w-4 h-4 text-slate-500" />
                </div>
                <ul className="mt-3 space-y-1.5 text-xs font-mono text-slate-300">
                  {model.fields.map((f: string, idx: number) => (
                    <li key={idx} className="flex items-center justify-between text-[11px]">
                      <span className={f.includes('(FK)') ? 'text-amber-400' : f === 'id' ? 'text-cyan-300 font-bold' : ''}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Foreign Key Relationships (Prisma ORM):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              {schemaData?.erdSchema?.relations?.map((rel: any, idx: number) => (
                <div key={idx} className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-cyan-300">{rel.from}</span>
                  <span className="text-slate-500 text-[10px]">--[{rel.type} (FK: {rel.fk})]--&gt;</span>
                  <span className="text-amber-300">{rel.to}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Order Events Log */}
      {activeTab === 'events' && (
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 max-h-[380px] overflow-y-auto space-y-2 font-mono text-xs">
          {schemaData?.tables?.OrderEventLog?.rows?.map((event: any) => (
            <div key={event.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className={`font-bold px-2 py-0.5 rounded ${
                  event.speaker === 'USER' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {event.speaker}
                </span>
                <span className="text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-slate-200">"{event.utterance}"</p>
              <div className="text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded overflow-x-auto">
                <span className="text-amber-400 font-bold">Action: {event.actionType}</span> | Delta: {event.stateDeltaJson}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
