'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Crown, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface PlanData {
  plan: {
    name: string;
    features: Record<string, boolean>;
  };
  usage: {
    bots: { current: number; max: number; percentage: number };
    conversations: { current: number; max: number; percentage: number; resetsAt: string };
  };
  subscription: {
    status: string;
    currentPeriodEnd: string;
  } | null;
}

export default function PlanBadge() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [data, setData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${apiUrl}/api/v1/plan-usage`, {
        credentials: 'include',
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (e) {
      console.error('Failed to fetch plan:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data on route change
  useEffect(() => {
    fetchPlan();
  }, [pathname, fetchPlan]);
  const planName = data?.plan?.name || 'Free';
  const botsUsed = data?.usage?.bots?.current || 0;
  const botsLimit = data?.usage?.bots?.max || 1;
  const convsUsed = data?.usage?.conversations?.current || 0;
  const convsLimit = data?.usage?.conversations?.max || 1000;

  const isFree = planName === 'Free';
  const isNearLimit = botsUsed >= botsLimit || convsUsed >= convsLimit * 0.9;

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
            {loading ? '...' : planName}
          </span>
        </div>
        
        {/* Usage bars */}
        <div className="space-y-1.5">
          <div>
            <div className="flex justify-between text-[10px] text-silver-600 mb-0.5">
              <span>Bots</span>
              <span>{botsUsed}/{botsLimit}</span>
            </div>
            <div className="h-1.5 bg-silver-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${botsUsed >= botsLimit ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (botsUsed / botsLimit) * 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-[10px] text-silver-600 mb-0.5">
              <span>Msgs</span>
              <span>{convsUsed}/{convsLimit}</span>
            </div>
            <div className="h-1.5 bg-silver-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${convsUsed >= convsLimit ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (convsUsed / convsLimit) * 100)}%` }}
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
