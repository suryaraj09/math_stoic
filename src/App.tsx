/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Bot, User, Brain, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // object URL for display
};

export default function App() {
  const [userName, setUserName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    if (trimmedName) {
      setUserName(trimmedName);
      setMessages([
        {
          id: 'init',
          role: 'model',
          text: `Hello ${trimmedName}! I'm your Socratic math tutor. I'm here to help you work through complex algebra or calculus problems. Upload a photo of a problem, and we'll tackle it together, step-by-step.`,
        },
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result as string;
        // Strip out the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = encoded.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || isLoading) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage.trim(),
      image: previewUrl || undefined,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    setIsLoading(true);

    const currentImage = selectedImage;
    clearImage(); // Clear input for next message

    try {
      let imageBase64 = undefined;
      let mimeType = undefined;

      if (currentImage) {
        imageBase64 = await getBase64(currentImage);
        mimeType = currentImage.type;
      }

      // Convert messages to history format expected by the API
      const history = messages
        .filter((m) => m.id !== 'init') // Skip initial greeting in API context
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history,
          message: newUserMsg.text,
          imageBase64,
          mimeType,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch response');
      }

      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: data.text,
        },
      ]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: `I'm sorry, I encountered an error: ${error.message || 'Unknown error'}. Could we try again?`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!userName) {
    return (
      <div className="flex flex-col h-screen bg-[#0A0A0C] text-slate-200 font-sans overflow-hidden items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0F0F12] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mb-6 shadow-[0_0_24px_rgba(79,70,229,0.4)]">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif tracking-wide text-slate-200 mb-2 text-center">Socratic Math</h1>
          <p className="text-slate-400 text-center mb-8 text-sm">Please enter your name to begin your personalized session.</p>
          
          <form onSubmit={handleNameSubmit} className="w-full">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-[#1A1A1E] border border-white/5 rounded-xl focus:outline-none focus:border-indigo-500/50 shadow-sm transition-all text-slate-200 placeholder:text-slate-600 mb-6 text-center text-lg font-serif"
              autoFocus
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Start Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0C] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-[#0F0F12] border-b border-white/10 px-6 py-4 flex items-center shadow-sm z-10 shrink-0">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-4 shrink-0">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-serif tracking-wide text-slate-200">Socratic Math Tutor</h1>
          <p className="text-sm text-slate-500">Patient, step-by-step guidance</p>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-4xl mx-auto flex flex-col gap-6 bg-[#0A0A0C]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "flex max-w-[85%] sm:max-w-[75%] gap-4",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className="shrink-0 pt-1">
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs text-slate-300">
                    You
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-900 border border-indigo-400/30 flex items-center justify-center font-serif italic text-indigo-200">
                    S
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={cn(
                  "flex flex-col gap-2 rounded-2xl px-5 py-3.5 shadow-sm overflow-hidden",
                  msg.role === 'user'
                    ? "bg-white/5 border border-white/5 text-slate-300 rounded-tr-none"
                    : "bg-indigo-500/10 border border-indigo-500/20 text-slate-100 font-serif italic rounded-tl-none"
                )}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Uploaded problem"
                    className="max-w-full h-auto rounded-lg mb-2 border border-slate-200 shadow-sm max-h-[300px] object-contain bg-white"
                  />
                )}
                
                {msg.text && (
                  <div className={cn(
                    "prose prose-sm sm:prose-base max-w-none break-words prose-invert leading-relaxed",
                    msg.role === 'user' ? "text-slate-300" : "text-slate-100"
                  )}>
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.text}</Markdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="flex gap-4 flex-row">
              <div className="shrink-0 pt-1">
                <div className="w-8 h-8 rounded-full bg-indigo-900 border border-indigo-400/30 flex items-center justify-center font-serif italic text-indigo-200">
                  S
                </div>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-3 text-indigo-300">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                <span className="text-sm font-medium animate-pulse font-serif italic">Thinking deeply...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-px" />
      </main>

      {/* Input Area */}
      <div className="bg-[#0F0F12] border-t border-white/10 px-4 py-4 sm:px-6 z-10 shrink-0">
        <div className="max-w-4xl mx-auto">
          {previewUrl && (
            <div className="mb-3 relative inline-block">
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-20 w-auto rounded-lg border border-slate-200 object-cover shadow-sm"
                />
                <button
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 shadow-md hover:bg-slate-700 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="relative flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="shrink-0 cursor-pointer p-3 rounded-full text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors bg-white/5 border border-white/10 shadow-sm"
              title="Upload math problem"
            >
              <ImageIcon className="w-5 h-5" />
            </label>

            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message or ask a question..."
                className="w-full pl-4 pr-24 py-3.5 bg-[#1A1A1E] border border-white/5 rounded-xl focus:outline-none focus:border-indigo-500/50 shadow-sm transition-all text-slate-200 placeholder:text-slate-600"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Send
              </button>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-slate-400">
              Uses Gemini 3.1 Pro for complex mathematical reasoning
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
