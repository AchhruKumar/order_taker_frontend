'use client';

import React, { useState, useEffect } from 'react';
import { Receipt, Clock, CheckCircle2, ShoppingBag, RefreshCw, ChevronDown, ChevronUp, Tag, Trash2 } from 'lucide-react';
import { fetchAllOrders, deleteOrder, deleteAllOrders } from '../services/apiClient';

export default function OrdersHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchAllOrders();
      if (res.orders) setOrders(res.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000); // auto-cancel after 3s
      return;
    }
    try {
      await deleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!confirmClearAll) {
      setConfirmClearAll(true);
      setTimeout(() => setConfirmClearAll(false), 3000); // auto-cancel after 3s
      return;
    }
    try {
      await deleteAllOrders();
      setOrders([]);
      setConfirmClearAll(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = filter === 'ALL'
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div className="glass-panel rounded-3xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Orders History & Real-Time Listing
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {orders.length} Total Orders
              </span>
            </h2>
            {/* <p className="text-xs text-slate-400">PostgreSQL Database Records • Status Tracking • Itemized Breakdown</p> */}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filters */}
          {['ALL', 'CONFIRMED', 'DRAFT'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === st
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
            >
              {st}
            </button>
          ))}

          {orders.length > 0 && (
            <button
              onClick={handleClearAll}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${confirmClearAll
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              title={confirmClearAll ? 'Click again to confirm!' : 'Delete All Orders'}
            >
              <Trash2 className="w-3.5 h-3.5" /> {confirmClearAll ? 'Confirm Clear?' : 'Clear History'}
            </button>
          )}

          <button
            onClick={loadOrders}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders List Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 stroke-1" />
          <p className="text-sm font-medium">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {filteredOrders.map(order => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 space-y-4 transition-all"
              >
                {/* Order Summary Line */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-extrabold text-white text-base bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                      #{order.orderNumber}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${order.status === 'CONFIRMED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                      {order.status}
                    </span>

                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-mono">Total Amount</div>
                      <div className="text-lg font-mono font-extrabold text-emerald-400">
                        ₹{order.totalAmount.toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSingle(order.id, e)}
                      className={`p-2 rounded-xl transition-all text-xs font-bold ${confirmDeleteId === order.id
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                        }`}
                      title={confirmDeleteId === order.id ? 'Click again to delete!' : 'Delete Order'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Itemized Food List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex justify-between items-start text-xs">
                      <div>
                        <span className="font-bold text-white">{item.quantity}x {item.menuItem?.name}</span>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.modifiers.map((m: any) => (
                              <span key={m.id} className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                                {m.optionName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-mono text-slate-300 font-semibold">₹{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Expanded Details: Financial Breakdown & Logs */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800 space-y-3 text-xs bg-slate-950/40 p-4 rounded-xl">
                    <div className="flex justify-between text-slate-400 font-mono">
                      <span>Subtotal: ₹{order.subtotal.toFixed(2)}</span>
                      <span>Tax (8.875%): ₹{order.taxAmount.toFixed(2)}</span>
                      <span>Tip: ₹{order.tipAmount.toFixed(2)}</span>
                      <span className="text-emerald-400 font-bold">Grand Total: ₹{order.totalAmount.toFixed(2)}</span>
                    </div>

                    {order.eventsLog && order.eventsLog.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-slate-800/60">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          Utterance Event Audit Trail ({order.eventsLog.length} events):
                        </div>
                        {order.eventsLog.map((ev: any) => (
                          <div key={ev.id} className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                            <span>[{ev.speaker}] "{ev.utterance}"</span>
                            <span className="text-amber-400/80">{ev.actionType}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
