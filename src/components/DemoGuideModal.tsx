'use client';

import React from 'react';
import { X, Video, Database, CheckCircle, Lightbulb, Clock, Mic } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoGuideModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-xl font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">4–6 Minute Video Demo Guide</h3>
              <p className="text-xs text-slate-400">Take-Home Submission Video Structure & Talking Points</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Section 1: Video Outline */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-orange-400 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recommended 4–6 Min Video Agenda:
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-orange-400 font-mono">0:00 - 1:30</span>
                <span><strong>Live Demo:</strong> Start voice call, speak an order with item modifiers ("Cheeseburger with extra cheddar and bacon, large fries, Coke").</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-orange-400 font-mono">1:30 - 2:30</span>
                <span><strong>Mid-Order Modification Demo:</strong> Voice edit mid-stream ("Change the cheeseburger cheese to Swiss and make fries large"). Highlight running total updates in real-time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-cyan-400 font-mono">2:30 - 4:00</span>
                <span><strong>Data Model Walkthrough (#1 Scored Element):</strong> Switch to <em>Prisma Schema Inspector</em> tab. Explain Postgres tables (`Order`, `OrderItem`, `OrderItemModifier`, `OrderEventLog`), foreign keys, and how state deltas are logged.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 font-mono">4:00 - 5:30</span>
                <span><strong>Key Decisions & Faked vs Built:</strong> Built full Express TypeScript backend, Prisma ORM schema, Grok AI integration, and Web Speech STT/TTS. Faked payment processing simulation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-400 font-mono">5:30 - 6:00</span>
                <span><strong>Future Roadmap:</strong> What you'd do with another week (WebSocket multi-agent stream, noise cancellation filters, kitchen display integration).</span>
              </li>
            </ul>
          </div>

          {/* Section 2: Data Model Highlights */}
          <div className="bg-cyan-950/40 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
            <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              Why This Data Model Wins:
            </h4>
            <p className="text-cyan-200/80 leading-relaxed">
              Separates base menu catalog (`MenuItem`) from order state (`OrderItem`) and nested modifier option selections (`OrderItemModifier`). Every voice utterance produces an immutable entry in `OrderEventLog` storing `actionType` and JSON state deltas.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Got It, Let's Record!
          </button>
        </div>
      </div>
    </div>
  );
}
