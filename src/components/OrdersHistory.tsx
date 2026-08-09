'use client';

import React, { useState, useEffect } from 'react';
import { Receipt, Clock, CheckCircle2, ShoppingBag, RefreshCw, ChevronDown, ChevronUp, Tag, Trash2 } from 'lucide-react';
import { fetchAllOrders, deleteOrder, deleteAllOrders } from '../services/apiClient';

export default function OrdersHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchAllOrders();
      if (res.orders) {
        // Filter strictly for confirmed orders only
        const confirmedOnly = res.orders.filter((o: any) => o.status === 'CONFIRMED');
        setOrders(confirmedOnly);
      }
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

  const confirmedOrders = orders.filter(o => o.status === 'CONFIRMED');

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Confirmed Orders History
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {confirmedOrders.length} Confirmed
              </span>
            </h2>
            <p className="text-xs text-slate-400">Viewing Placed & Confirmed Customer Orders Only</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
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
      {confirmedOrders.length === 0 ? (
        <div className="text-center py-12 sm:py-16 text-slate-500">
          <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30 stroke-1" />
          <p className="text-sm font-medium">No confirmed orders found</p>
          <p className="text-xs text-slate-600 mt-1">Confirmed voice and cart orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {confirmedOrders.map(order => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 transition-all"
              >
                {/* Order Summary Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-mono font-extrabold text-white text-sm sm:text-base bg-slate-800 px-2.5 sm:px-3 py-1 rounded-xl border border-slate-700">
                      #{order.orderNumber}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      CONFIRMED
                    </span>

                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4 pt-1 sm:pt-0 border-t sm:border-0 border-slate-800/80">
                    <div className="text-left sm:text-right">
                      <div className="text-[11px] text-slate-400 font-mono">Total Amount</div>
                      <div className="text-base sm:text-lg font-mono font-extrabold text-emerald-400">
                        ₹{order.totalAmount.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
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
                </div>

                {/* Itemized Food List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="bg-slate-950/60 p-2.5 sm:p-3 rounded-xl border border-slate-800/60 flex justify-between items-start text-xs">
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
                      <span className="font-mono text-slate-300 font-semibold shrink-0 ml-2">₹{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Expanded Details: Financial Breakdown & Logs */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800 space-y-3 text-xs bg-slate-950/40 p-3.5 sm:p-4 rounded-xl">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400 font-mono text-[11px] sm:text-xs">
                      <div>Subtotal: <span className="text-slate-200">₹{order.subtotal.toFixed(2)}</span></div>
                      <div>Tax (8.875%): <span className="text-slate-200">₹{order.taxAmount.toFixed(2)}</span></div>
                      <div>Tip: <span className="text-slate-200">₹{order.tipAmount.toFixed(2)}</span></div>
                      <div className="text-emerald-400 font-bold col-span-2 sm:col-span-1">Grand Total: ₹{order.totalAmount.toFixed(2)}</div>
                    </div>

                    {order.eventsLog && order.eventsLog.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-slate-800/60">
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          Utterance Event Audit Trail ({order.eventsLog.length} events):
                        </div>
                        {order.eventsLog.map((ev: any) => (
                          <div key={ev.id} className="text-[10px] sm:text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-1">
                            <span className="break-all">[{ev.speaker}] "{ev.utterance}"</span>
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
