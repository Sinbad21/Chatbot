'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface PlanData {
  planName: string;
  bots: { used: number; limit: number };
  conversations: { used: number; limit: number };
}

export default function PlanBadge() {
  const { t } = useTranslation();
  const [plan, setPlan] = useState<PlanData | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch('/api/v1/plan-usage', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setPlan(data);
        }
      } catch (e) {
        console.error('Failed to fetch plan:', e);
      }
    };
    fetchPlan();
  }, []);

  if (!plan) return null;

  const isFree = plan.planName === 'Free';
  const isNearLimit = plan.bots.used >= plan.bots.limit || 
                      plan.conversations.used >= plan.conversations.limit * 0.9;

  return (
    <div className="mt-4 pt-4 border-t border-silver-200">
      <div className={`rounded-lg p-3 ${isFree ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          {isFree ? (
            <Sparkles size={14} className="text-amber-600" />
          ) : (
            <Crown size={14} className="text-emerald-600" />
          )}
          <span className={`text-xs font-bold uppercase tracking-wide ${isFree ? 'text-amber-700' : 'text-emerald-700'}`}>
            {plan.planName}
          </span>
        </div>
        
        {/* Usage bars */}
        <div className="space-y-1.5">
          <div>
            <div className="flex justify-between text-[10px] text-silver-600 mb-0.5">
              <span>Bots</span>
              <span>{plan.bots.used}/{plan.bots.limit}</span>
            </div>
            <div className="h-1.5 bg-silver-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${plan.bots.used >= plan.bots.limit ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (plan.bots.used / plan.bots.limit) * 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-[10px] text-silver-600 mb-0.5">
              <span>Msgs</span>
              <span>{plan.conversations.used}/{plan.conversations.limit}</span>
            </div>
            <div className="h-1.5 bg-silver-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${plan.conversations.used >= plan.conversations.limit ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (plan.conversations.used / plan.conversations.limit) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Upgrade link for free users */}
        {isFree && (
          <Link 
            href="/dashboard/settings?tab=billing"
            className="mt-2 block text-center text-[10px] font-medium text-amber-700 hover:text-amber-800 underline"
          >
            {t('planUsage.upgrade') || 'Upgrade'}
          </Link>
        )}
        
        {/* Warning for near limit */}
        {!isFree && isNearLimit && (
          <p className="mt-2 text-[10px] text-amber-600 text-center">
            {t('planUsage.nearLimit') || 'Near limit'}
          </p>
        )}
      </div>
    </div>
  );
}
