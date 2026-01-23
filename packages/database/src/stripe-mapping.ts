/**
 * Stripe Price ID Mapping - Single Source of Truth
 * 
 * This file centralizes all Stripe Price ID mappings to avoid string-magic
 * and ensure type safety across the billing system.
 * 
 * IMPORTANT: Update these mappings when creating/updating products in Stripe Dashboard
 * 
 * Naming convention:
 * - price_xxx = Monthly price
 * - price_yyy = Yearly price (optional)
 */

import { ADDON_CODES, type AddonCode } from './addon-codes';

// ============================================
// PLAN MAPPINGS
// ============================================

export interface StripePlanMapping {
  planId: string;           // Internal plan ID (from database)
  planName: string;         // Human-readable name
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  stripeProductId: string | null;
}

/**
 * Map internal plan IDs to Stripe Price IDs
 * 
 * TODO: Replace placeholder values with actual Stripe Price IDs from dashboard
 * Format: price_1xxxxxxxxxxxxxx
 */
export const PLAN_TO_STRIPE: Record<string, StripePlanMapping> = {
  free: {
    planId: 'free',
    planName: 'Free',
    stripePriceIdMonthly: null, // Free plan has no Stripe price
    stripePriceIdYearly: null,
    stripeProductId: null,
  },
  starter: {
    planId: 'starter',
    planName: 'Chatbot Starter',
    stripePriceIdMonthly: 'price_TODO_STARTER_MONTHLY', // TODO: Replace with actual Stripe Price ID
    stripePriceIdYearly: 'price_TODO_STARTER_YEARLY',
    stripeProductId: 'prod_TODO_STARTER',
  },
  professional: {
    planId: 'professional',
    planName: 'Chatbot Professional',
    stripePriceIdMonthly: 'price_TODO_PRO_MONTHLY', // TODO: Replace with actual Stripe Price ID
    stripePriceIdYearly: 'price_TODO_PRO_YEARLY',
    stripeProductId: 'prod_TODO_PRO',
  },
  enterprise: {
    planId: 'enterprise',
    planName: 'Chatbot Enterprise',
    stripePriceIdMonthly: 'price_TODO_ENT_MONTHLY', // TODO: Replace with actual Stripe Price ID
    stripePriceIdYearly: 'price_TODO_ENT_YEARLY',
    stripeProductId: 'prod_TODO_ENT',
  },
};

// ============================================
// ADDON MAPPINGS
// ============================================

export interface StripeAddonMapping {
  addonCode: AddonCode;
  addonName: string;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  stripeProductId: string | null;
  isQuantityBased: boolean; // true = can purchase multiple (e.g., extra bot slots)
}

/**
 * Map addon codes to Stripe Price IDs
 * 
 * TODO: Replace placeholder values with actual Stripe Price IDs from dashboard
 */
export const ADDON_TO_STRIPE: Record<AddonCode, StripeAddonMapping> = {
  [ADDON_CODES.WHITE_LABEL]: {
    addonCode: ADDON_CODES.WHITE_LABEL,
    addonName: 'White Label',
    stripePriceIdMonthly: 'price_TODO_WHITE_LABEL_MONTHLY',
    stripePriceIdYearly: 'price_TODO_WHITE_LABEL_YEARLY',
    stripeProductId: 'prod_TODO_WHITE_LABEL',
    isQuantityBased: false,
  },
  [ADDON_CODES.EXTRA_BOT_SLOTS]: {
    addonCode: ADDON_CODES.EXTRA_BOT_SLOTS,
    addonName: 'Extra Bot Slots',
    stripePriceIdMonthly: 'price_TODO_EXTRA_BOT_MONTHLY',
    stripePriceIdYearly: 'price_TODO_EXTRA_BOT_YEARLY',
    stripeProductId: 'prod_TODO_EXTRA_BOT',
    isQuantityBased: true,
  },
  [ADDON_CODES.UNLIMITED_CONVERSATIONS]: {
    addonCode: ADDON_CODES.UNLIMITED_CONVERSATIONS,
    addonName: 'Unlimited Conversations',
    stripePriceIdMonthly: 'price_TODO_UNLIMITED_CONV_MONTHLY',
    stripePriceIdYearly: 'price_TODO_UNLIMITED_CONV_YEARLY',
    stripeProductId: 'prod_TODO_UNLIMITED_CONV',
    isQuantityBased: false,
  },
  [ADDON_CODES.BYOK]: {
    addonCode: ADDON_CODES.BYOK,
    addonName: 'BYOK (Bring Your Own Key)',
    stripePriceIdMonthly: 'price_TODO_BYOK_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_BYOK',
    isQuantityBased: false,
  },
  [ADDON_CODES.SSO_SAML]: {
    addonCode: ADDON_CODES.SSO_SAML,
    addonName: 'SSO SAML',
    stripePriceIdMonthly: 'price_TODO_SSO_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_SSO',
    isQuantityBased: false,
  },
  [ADDON_CODES.AUDIT_LOG]: {
    addonCode: ADDON_CODES.AUDIT_LOG,
    addonName: 'Audit Log',
    stripePriceIdMonthly: 'price_TODO_AUDIT_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_AUDIT',
    isQuantityBased: false,
  },
  [ADDON_CODES.CUSTOM_REPORTING]: {
    addonCode: ADDON_CODES.CUSTOM_REPORTING,
    addonName: 'Custom Reporting',
    stripePriceIdMonthly: 'price_TODO_REPORTING_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_REPORTING',
    isQuantityBased: false,
  },
  [ADDON_CODES.EXTRA_WORKSPACE]: {
    addonCode: ADDON_CODES.EXTRA_WORKSPACE,
    addonName: 'Extra Workspace',
    stripePriceIdMonthly: 'price_TODO_EXTRA_WS_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_EXTRA_WS',
    isQuantityBased: true,
  },
  [ADDON_CODES.VOICE_RECEPTIONIST]: {
    addonCode: ADDON_CODES.VOICE_RECEPTIONIST,
    addonName: 'Voice Receptionist',
    stripePriceIdMonthly: 'price_TODO_VOICE_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_VOICE',
    isQuantityBased: false,
  },
  [ADDON_CODES.REVIEW_BOT]: {
    addonCode: ADDON_CODES.REVIEW_BOT,
    addonName: 'Review Bot',
    stripePriceIdMonthly: 'price_TODO_REVIEW_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_REVIEW',
    isQuantityBased: false,
  },
  [ADDON_CODES.PRIORITY_SUPPORT]: {
    addonCode: ADDON_CODES.PRIORITY_SUPPORT,
    addonName: 'Priority Support',
    stripePriceIdMonthly: 'price_TODO_PRIORITY_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_PRIORITY',
    isQuantityBased: false,
  },
  [ADDON_CODES.CUSTOM_DOMAIN]: {
    addonCode: ADDON_CODES.CUSTOM_DOMAIN,
    addonName: 'Custom Domain',
    stripePriceIdMonthly: 'price_TODO_DOMAIN_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_DOMAIN',
    isQuantityBased: false,
  },
  // Channel addons
  [ADDON_CODES.WHATSAPP_CHANNEL]: {
    addonCode: ADDON_CODES.WHATSAPP_CHANNEL,
    addonName: 'WhatsApp Channel',
    stripePriceIdMonthly: 'price_TODO_WHATSAPP_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_WHATSAPP',
    isQuantityBased: false,
  },
  [ADDON_CODES.TELEGRAM_CHANNEL]: {
    addonCode: ADDON_CODES.TELEGRAM_CHANNEL,
    addonName: 'Telegram Channel',
    stripePriceIdMonthly: 'price_TODO_TELEGRAM_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_TELEGRAM',
    isQuantityBased: false,
  },
  [ADDON_CODES.SLACK_CHANNEL]: {
    addonCode: ADDON_CODES.SLACK_CHANNEL,
    addonName: 'Slack Channel',
    stripePriceIdMonthly: 'price_TODO_SLACK_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_SLACK',
    isQuantityBased: false,
  },
  [ADDON_CODES.DISCORD_CHANNEL]: {
    addonCode: ADDON_CODES.DISCORD_CHANNEL,
    addonName: 'Discord Channel',
    stripePriceIdMonthly: 'price_TODO_DISCORD_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_DISCORD',
    isQuantityBased: false,
  },
  // Integration addons
  [ADDON_CODES.STRIPE_INTEGRATION]: {
    addonCode: ADDON_CODES.STRIPE_INTEGRATION,
    addonName: 'Stripe Integration',
    stripePriceIdMonthly: 'price_TODO_STRIPE_INT_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_STRIPE_INT',
    isQuantityBased: false,
  },
  [ADDON_CODES.WOOCOMMERCE_INTEGRATION]: {
    addonCode: ADDON_CODES.WOOCOMMERCE_INTEGRATION,
    addonName: 'WooCommerce Integration',
    stripePriceIdMonthly: 'price_TODO_WOO_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_WOO',
    isQuantityBased: false,
  },
  [ADDON_CODES.SHOPIFY_INTEGRATION]: {
    addonCode: ADDON_CODES.SHOPIFY_INTEGRATION,
    addonName: 'Shopify Integration',
    stripePriceIdMonthly: 'price_TODO_SHOPIFY_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_SHOPIFY',
    isQuantityBased: false,
  },
  [ADDON_CODES.GOOGLE_CALENDAR_INTEGRATION]: {
    addonCode: ADDON_CODES.GOOGLE_CALENDAR_INTEGRATION,
    addonName: 'Google Calendar Integration',
    stripePriceIdMonthly: 'price_TODO_GCAL_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_GCAL',
    isQuantityBased: false,
  },
  // AI addons
  [ADDON_CODES.EXTRA_AI_CREDITS_10K]: {
    addonCode: ADDON_CODES.EXTRA_AI_CREDITS_10K,
    addonName: 'Extra AI Credits (10K)',
    stripePriceIdMonthly: 'price_TODO_AI_10K_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_AI_10K',
    isQuantityBased: true,
  },
  [ADDON_CODES.GPT4_ACCESS]: {
    addonCode: ADDON_CODES.GPT4_ACCESS,
    addonName: 'GPT-4 Access',
    stripePriceIdMonthly: 'price_TODO_GPT4_MONTHLY',
    stripePriceIdYearly: null,
    stripeProductId: 'prod_TODO_GPT4',
    isQuantityBased: false,
  },
};

// ============================================
// LOOKUP FUNCTIONS
// ============================================

/**
 * Get Stripe Price ID from plan ID
 */
export function getStripePriceIdForPlan(
  planId: string,
  interval: 'monthly' | 'yearly' = 'monthly'
): string | null {
  const mapping = PLAN_TO_STRIPE[planId.toLowerCase()];
  if (!mapping) return null;
  return interval === 'monthly' 
    ? mapping.stripePriceIdMonthly 
    : mapping.stripePriceIdYearly;
}

/**
 * Get Stripe Price ID from addon code
 */
export function getStripePriceIdForAddon(
  addonCode: AddonCode,
  interval: 'monthly' | 'yearly' = 'monthly'
): string | null {
  const mapping = ADDON_TO_STRIPE[addonCode];
  if (!mapping) return null;
  return interval === 'monthly'
    ? mapping.stripePriceIdMonthly
    : mapping.stripePriceIdYearly;
}

/**
 * Reverse lookup: Get plan ID from Stripe Price ID
 */
export function getPlanIdFromStripePriceId(stripePriceId: string): string | null {
  for (const [planId, mapping] of Object.entries(PLAN_TO_STRIPE)) {
    if (
      mapping.stripePriceIdMonthly === stripePriceId ||
      mapping.stripePriceIdYearly === stripePriceId
    ) {
      return planId;
    }
  }
  return null;
}

/**
 * Reverse lookup: Get addon code from Stripe Price ID
 */
export function getAddonCodeFromStripePriceId(stripePriceId: string): AddonCode | null {
  for (const [addonCode, mapping] of Object.entries(ADDON_TO_STRIPE)) {
    if (
      mapping.stripePriceIdMonthly === stripePriceId ||
      mapping.stripePriceIdYearly === stripePriceId
    ) {
      return addonCode as AddonCode;
    }
  }
  return null;
}

/**
 * Check if a Stripe Price ID is for a plan (vs addon)
 */
export function isPlanPriceId(stripePriceId: string): boolean {
  return getPlanIdFromStripePriceId(stripePriceId) !== null;
}

/**
 * Check if a Stripe Price ID is for an addon
 */
export function isAddonPriceId(stripePriceId: string): boolean {
  return getAddonCodeFromStripePriceId(stripePriceId) !== null;
}
