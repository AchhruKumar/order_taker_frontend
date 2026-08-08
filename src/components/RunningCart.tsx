'use client';

import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, Tag, CheckCircle2, RotateCcw, DollarSign } from 'lucide-react';
import { resetOrder, confirmOrder } from '../services/apiClient';

interface Props {
  order: any;
  onOrderUpdated: (newOrder: any) => void;
}

export default function RunningCart({ order, onOrderUpdated }: Props) {
  const [tipPercentage, setTipPercentage] = useState<number>(15);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [confirmedDetails, setConfirmedDetails] = useState<any>(null);

  const handleReset = async () => {
    try {
      const res = await resetOrder();
      setConfirmedDetails(null);
      onOrderUpdated(res.order);
    } catch (e) {
      console.error(e);
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // stop any ongoing speech first
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    // Prefer a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && v.localService);
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };

  const handleConfirm = async () => {
    if (!order?.items || order.items.length === 0) return;
    setIsConfirming(true);
    try {
      const res = await confirmOrder(tipAmount);
      if (res.success) {
        setConfirmedDetails(res.confirmedOrder);
        onOrderUpdated(res.newOrder);
        const total = (res.confirmedOrder?.totalAmount || grandTotal).toFixed(2);
        speakText(
          `Your order has been confirmed! Your total is ${total} Rupees. Thank you for dining with us. We'll have your food ready shortly!`
        );
      }
    } catch (e) {
      console.error('Confirmation error:', e);
    } finally {
      setIsConfirming(false);
    }
  };

  const subtotal = order?.subtotal || 0;
  const taxAmount = order?.taxAmount || 0;
  const tipAmount = Math.round(subtotal * (tipPercentage / 100) * 100) / 100;
  const grandTotal = Math.round((subtotal + taxAmount + tipAmount) * 100) / 100;

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between h-full min-h-[580px]">
      <div>
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Running Order Cart
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  #{order?.orderNumber || 1001}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Live Itemized Receipt & Dynamic Tax/Total</p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
            title="Reset Cart"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="py-4 space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {(!order?.items || order.items.length === 0) ? (
            <div className="text-center py-12 text-slate-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 stroke-1" />
              <p className="text-sm font-medium">Your cart is currently empty</p>
              <p className="text-xs text-slate-600 mt-1">Start a voice call or tap a voice prompt to add food</p>
            </div>
          ) : (
            order.items.map((item: any) => (
              <div
                key={item.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="bg-orange-500/20 text-orange-400 font-bold text-xs px-2.5 py-1 rounded-lg border border-orange-500/30">
                      {item.quantity}x
                    </span>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{item.menuItem?.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Base: ₹{item.unitPrice.toFixed(2)}
                      </p>

                      {/* Modifiers Badges */}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.modifiers.map((mod: any) => (
                            <span
                              key={mod.id}
                              className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 font-mono flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5 text-orange-400" />
                              {mod.optionName}
                              {mod.priceDelta > 0 && ` (+₹${mod.priceDelta.toFixed(2)})`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-orange-400 text-sm">
                      ₹{item.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="pt-4 border-t border-slate-800 space-y-2.5">
        {/* Tip Selector */}
        <div className="flex items-center justify-between text-xs py-1">
          <span className="text-slate-400 font-medium">Add Tip:</span>
          <div className="flex space-x-1.5">
            {[0, 10, 15, 20].map(pct => (
              <button
                key={pct}
                onClick={() => setTipPercentage(pct)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-all ${
                  tipPercentage === pct
                    ? 'bg-orange-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between text-xs text-slate-400">
          <span>Subtotal</span>
          <span className="font-mono text-slate-200">₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-xs text-slate-400">
          <span>Estimated Tax (8.875%)</span>
          <span className="font-mono text-slate-200">₹{taxAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-xs text-slate-400">
          <span>Tip Amount</span>
          <span className="font-mono text-slate-200">₹{tipAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center text-lg font-extrabold text-white pt-2 border-t border-slate-800">
          <span>Running Total</span>
          <span className="font-mono text-orange-400 text-xl">₹{grandTotal.toFixed(2)}</span>
        </div>

        {/* Confirm Order Button */}
        <button
          onClick={handleConfirm}
          disabled={isConfirming || !order?.items || order.items.length === 0}
          className={`w-full mt-3 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            !order?.items || order.items.length === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold shadow-emerald-500/20 active:scale-[0.98]'
          }`}
        >
          {isConfirming ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              Processing Confirmation...
            </span>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm & Place Order (₹{grandTotal.toFixed(2)})</span>
            </>
          )}
        </button>

        {confirmedDetails && (
          <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 space-y-1 animate-pulse">
            <div className="font-bold flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Order #{confirmedDetails.orderNumber} Confirmed!
            </div>
            <p className="text-[11px] text-emerald-300/80">
              Total ₹{confirmedDetails.totalAmount.toFixed(2)} sent to kitchen. A new cart has been prepared.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
