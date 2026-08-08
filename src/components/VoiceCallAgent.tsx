'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneCall, PhoneOff, Sparkles, Volume2, MessageSquare, AlertCircle, X } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import { speechController } from '../services/speechService';
import { sendVoiceCommand } from '../services/apiClient';

interface Props {
  onOrderUpdated: (newOrder: any) => void;
  apiKey?: string;
}

export default function VoiceCallAgent({ onOrderUpdated, apiKey }: Props) {
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [callState, setCallState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState<Array<{ speaker: 'user' | 'agent'; text: string }>>([
    { speaker: 'agent', text: "Hello! Welcome to FoodCraft. I'm your AI order assistant. What can I get started for you today?" }
  ]);
  const [currentUtterance, setCurrentUtterance] = useState<string>('');
  const [rateLimited, setRateLimited] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, currentUtterance]);

  const toggleCall = () => {
    if (isCallActive) {
      speechController.stopListening();
      speechController.cancelSpeech();
      setIsCallActive(false);
      setCallState('idle');
    } else {
      setIsCallActive(true);
      startVoiceListening();
    }
  };

  const startVoiceListening = () => {
    if (!speechController.isSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    setCallState('listening');
    speechController.startListening(
      (text, isFinal) => {
        setCurrentUtterance(text);
        if (isFinal && text.trim().length > 0) {
          handleUserUtterance(text);
        }
      },
      () => {
        if (isCallActive && callState === 'listening') {
          // Restart if still active
          setTimeout(() => startVoiceListening(), 300);
        }
      },
      (err) => {
        console.warn('STT Error:', err);
      }
    );
  };

  const handleUserUtterance = async (text: string) => {
    speechController.stopListening();
    setCallState('processing');
    setCurrentUtterance('');

    setTranscript(prev => [...prev, { speaker: 'user', text }]);

    try {
      const response = await sendVoiceCommand(text, apiKey);

      // Check for rate limit flag from backend
      if (response.aiResponse?.__rateLimited) {
        setRateLimited(true);
        const limitMsg = 'Your Groq API key limit has been exceeded. Please update your API key in Settings.';
        setTranscript(prev => [...prev, { speaker: 'agent', text: limitMsg }]);
        setCallState('idle');
        speechController.speak(limitMsg, () => setCallState('idle'));
        return;
      }

      if (response.order) {
        onOrderUpdated(response.order);
      }

      const agentText = response.aiResponse?.spokenResponse || "I've updated your order. Anything else?";

      setTranscript(prev => [...prev, { speaker: 'agent', text: agentText }]);

      setCallState('speaking');
      speechController.speak(agentText, () => {
        if (isCallActive) {
          startVoiceListening();
        } else {
          setCallState('idle');
        }
      });
    } catch (err: any) {
      console.error('Command processing failed:', err);
      setTranscript(prev => [...prev, { speaker: 'agent', text: "Sorry, I had trouble processing that. Please try again." }]);
      setCallState('listening');
      startVoiceListening();
    }
  };

  const executePresetPrompt = (text: string) => {
    if (!isCallActive) {
      setIsCallActive(true);
    }
    handleUserUtterance(text);
  };

  return (
    <div className="glass-panel-glow rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[580px]">

      {/* Rate Limit Banner */}
      {rateLimited && (
        <div className="mb-4 flex items-start gap-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 px-4 py-3 rounded-2xl text-xs font-semibold">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-rose-400" />
          <div className="flex-1">
            <div className="font-bold text-rose-400 text-sm mb-1">⚠️ Groq API Key Limit Exceeded</div>
            <p>Your Groq API quota has been exhausted. Please get a new key from{' '}
              <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="underline text-rose-300 hover:text-white">
                console.groq.com
              </a>{' '}and update it in the Settings (⚙️ icon).
            </p>
          </div>
          <button onClick={() => setRateLimited(false)} className="text-rose-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Call Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-2xl ${isCallActive ? 'bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse' : 'bg-slate-800'}`}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Voice Order Taker
              {/* <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono font-medium border border-orange-500/30">
                V1 Realtime AI
              </span> */}
            </h2>
            <p className="text-xs text-slate-400">Natural Speech</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${callState === 'listening' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            callState === 'speaking' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              callState === 'processing' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                'bg-slate-800 text-slate-400'
            }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${callState === 'listening' ? 'bg-emerald-400 animate-ping' :
              callState === 'speaking' ? 'bg-amber-400 animate-ping' :
                callState === 'processing' ? 'bg-purple-400 animate-spin' :
                  'bg-slate-500'
              }`} />
            {callState === 'listening' ? 'Listening...' :
              callState === 'speaking' ? 'Agent Speaking...' :
                callState === 'processing' ? 'Groq Processing...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Audio Visualizer */}
      <AudioVisualizer
        isActive={isCallActive}
        mode={callState === 'listening' ? 'listening' : callState === 'speaking' ? 'speaking' : 'idle'}
      />

      {/* Transcript Chat Log */}
      <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 px-2 py-4 my-2 border-y border-slate-800/80">
        {transcript.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium ${msg.speaker === 'user'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-br-none shadow-md'
                : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-bl-none'
                }`}
            >
              <div className="text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">
                {msg.speaker === 'user' ? '👤 Customer Voice' : '🤖 Groq Order Taker'}
              </div>
              {msg.text}
            </div>
          </div>
        ))}

        {currentUtterance && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-orange-950/60 text-orange-200 border border-orange-500/40 animate-pulse">
              <div className="text-[10px] font-mono text-orange-400 mb-1 uppercase">Transcribing...</div>
              {currentUtterance}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Voice Presets Chips */}
      <div className="py-2">
        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
          <span>⚡ Try Quick Voice Test Prompts:</span>
          <span className="text-[10px] text-slate-500">Click to simulate spoken order</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "Order 1 Smash Cheeseburger with crispy bacon and a Diet Coke",
            "Change cheeseburger cheese to Extra Cheddar and make fries Large",
            "Remove the Diet Coke from my order",
            "What options do you have on the menu?",
            "Start over and clear cart"
          ].map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => executePresetPrompt(promptText)}
              className="text-xs bg-slate-800/80 hover:bg-orange-500/20 text-slate-300 hover:text-orange-300 border border-slate-700/60 hover:border-orange-500/40 px-3 py-1.5 rounded-xl transition-all text-left"
            >
              "{promptText}"
            </button>
          ))}
        </div>
      </div>

      {/* Call Control Footer */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-400 flex items-center space-x-1.5">
          <MessageSquare className="w-4 h-4 text-orange-400" />
          <span>Speak naturally or click preset chips above</span>
        </div>

        <button
          onClick={toggleCall}
          className={`flex items-center space-x-3 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl ${isCallActive
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/40 ring-4 ring-rose-500/20'
            : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold shadow-orange-500/25 ring-4 ring-orange-500/20'
            }`}
        >
          {isCallActive ? (
            <>
              <PhoneOff className="w-5 h-5" />
              <span>End Voice Call</span>
            </>
          ) : (
            <>
              <PhoneCall className="w-5 h-5 animate-bounce" />
              <span>Start Voice Order Call</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
