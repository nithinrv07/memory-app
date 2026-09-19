import React from 'react';
import { Star, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';

interface WhatEngineersAskProps {
  onSelectQuery: (query: string) => void;
}

export const WhatEngineersAsk: React.FC<WhatEngineersAskProps> = ({ onSelectQuery }) => {
  const testimonials = [
    {
      name: 'Elena Rostova',
      role: 'Staff Infrastructure Lead',
      avatar: 'ER',
      avatarBg: 'bg-indigo-100 text-indigo-700',
      question: 'Why did we switch from MongoDB to PostgreSQL 16?',
      quote:
        'Instead of digging through 80 Slack channels, the lineage platform traced back to INCIDENT-309, showing the exact ledger inconsistency that motivated Sarah Chen and Marcus Vance to sign off on Cloud SQL PostgreSQL.',
      tag: 'Database Architecture'
    },
    {
      name: 'Alex Rivera',
      role: 'Principal Security Architect',
      avatar: 'AR',
      avatarBg: 'bg-emerald-100 text-emerald-700',
      question: 'Who approved the asymmetric RS256 JWT redesign?',
      quote:
        'Auditors required evidence of who approved the deprecation of centralized Redis session cookies. The graph showed the exact sign-off by CISO Lisa Gomez in ADR-058 with sub-millisecond Envoy validation.',
      tag: 'Security & Auth'
    },
    {
      name: 'David Kim',
      role: 'Staff Site Reliability Engineer',
      avatar: 'DK',
      avatarBg: 'bg-amber-100 text-amber-700',
      question: 'What caused the Q3 2024 payment cascade failure?',
      quote:
        'When onboarding new on-call SREs, we no longer need to explain the Stripe timeout cascade. The synthesized lineage shows the unbounded connection pool root cause and Resilience4j circuit breaker mitigation.',
      tag: 'Incident Resilience'
    }
  ];

  return (
    <section className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What Engineers & Architects Ask!
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Every architectural crossroad has a paper trail. Click any scenario to run live synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-300"
            >
              <div>
                {/* User Info Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${item.avatarBg}`}>
                    {item.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{item.name}</h4>
                    <p className="text-[11px] text-slate-500">{item.role}</p>
                  </div>
                </div>

                {/* Rating stars matching image.png */}
                <div className="flex items-center gap-1 mb-3 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                  <span className="text-[10px] font-bold text-slate-400 ml-1.5 uppercase tracking-wider">
                    {item.tag}
                  </span>
                </div>

                {/* Inquired Question */}
                <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 mb-3 text-xs font-bold text-indigo-900">
                  "{item.question}"
                </div>

                {/* Testimonial Quote */}
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-5 border-t border-slate-100">
                <button
                  onClick={() => onSelectQuery(item.question)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 font-semibold text-xs transition-all cursor-pointer group"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Execute This Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
