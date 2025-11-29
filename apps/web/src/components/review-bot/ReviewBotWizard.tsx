import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, 
  MessageSquare, 
  Layout, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  X,
  Building2
} from 'lucide-react';
import { ReviewBotWizardConfig, SurveyType, WidgetPosition } from '@/types/review-bot';
import { StripeIcon, WooCommerceIcon, ShopifyIcon, GoogleIcon } from '@/components/icons';

interface ReviewBotWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: ReviewBotWizardConfig) => Promise<void>;
}

const STEPS = [
  { id: 1, title: 'Business Info', icon: Building2 },
  { id: 2, title: 'Integration', icon: Store },
  { id: 3, title: 'Messages', icon: MessageSquare },
  { id: 4, title: 'Widget', icon: Layout },
];

const INITIAL_CONFIG: ReviewBotWizardConfig = {
  businessName: '',
  googlePlaceId: '',
  googleReviewUrl: '',
  ecommercePlatform: '',
  stripeWebhookSecret: '',
  wooUrl: '',
  wooConsumerKey: '',
  wooConsumerSecret: '',
  shopifyDomain: '',
  shopifyAccessToken: '',
  thankYouMessage: '🎉 Grazie per il tuo acquisto!',
  surveyQuestion: 'Come valuteresti la tua esperienza?',
  positiveMessage: 'Fantastico! Ti andrebbe di condividere la tua opinione su Google?',
  negativeMessage: 'Grazie per il feedback! Cosa possiamo migliorare?',
  completedMessage: 'Grazie mille per il tuo tempo! ❤️',
  surveyType: 'EMOJI',
  positiveThreshold: 4,
  widgetColor: '#6366f1',
  widgetPosition: 'bottom-right',
  delaySeconds: 2,
};

export default function ReviewBotWizard({ isOpen, onClose, onComplete }: ReviewBotWizardProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ReviewBotWizardConfig>(INITIAL_CONFIG);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(config);
    } catch (error) {
      console.error('Error submitting wizard:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateConfig = (key: keyof ReviewBotWizardConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1a0b2e] border border-purple-500/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-purple-500/10 flex justify-between items-center bg-[#130725]">
          <div>
            <h2 className="text-2xl font-bold text-white">Setup Review Bot</h2>
            <p className="text-purple-300/60 text-sm">Configure your automated review collection system</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-purple-300/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-[#16092a] border-b border-purple-500/10">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-purple-500/10 -z-10" />
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isCompleted = s.id < step;

              return (
                <div key={s.id} className="flex flex-col items-center gap-2 bg-[#16092a] px-2">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                        : isCompleted
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-purple-500/20 bg-[#1a0b2e] text-purple-500/40'
                    }`}
                  >
                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-purple-300/40'
                  }`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-medium text-purple-200 mb-1 block">Business Name</span>
                      <input
                        type="text"
                        value={config.businessName}
                        onChange={(e) => updateConfig('businessName', e.target.value)}
                        className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="e.g. Acme Corp"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-purple-200 mb-1 block">Google Place ID</span>
                      <div className="relative">
                        <input
                          type="text"
                          value={config.googlePlaceId}
                          onChange={(e) => updateConfig('googlePlaceId', e.target.value)}
                          className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors pl-10"
                          placeholder="ChIJ..."
                        />
                        <GoogleIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                      </div>
                      <p className="text-xs text-purple-300/40 mt-1">
                        You can find this in your Google Business Profile settings or using the Place ID Finder.
                      </p>
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-purple-200 mb-1 block">Google Review URL</span>
                      <input
                        type="text"
                        value={config.googleReviewUrl}
                        onChange={(e) => updateConfig('googleReviewUrl', e.target.value)}
                        className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="https://g.page/r/..."
                      />
                    </label>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'stripe', name: 'Stripe', icon: StripeIcon },
                      { id: 'woocommerce', name: 'WooCommerce', icon: WooCommerceIcon },
                      { id: 'shopify', name: 'Shopify', icon: ShopifyIcon },
                    ].map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => updateConfig('ecommercePlatform', platform.id)}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                          config.ecommercePlatform === platform.id
                            ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.2)]'
                            : 'bg-[#0f0518] border-purple-500/10 text-purple-300/40 hover:border-purple-500/30 hover:bg-purple-500/5'
                        }`}
                      >
                        <platform.icon size={32} />
                        <span className="font-medium">{platform.name}</span>
                      </button>
                    ))}
                  </div>

                  {config.ecommercePlatform === 'stripe' && (
                    <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 space-y-4">
                      <label className="block">
                        <span className="text-sm font-medium text-purple-200 mb-1 block">Stripe Webhook Secret</span>
                        <input
                          type="password"
                          value={config.stripeWebhookSecret}
                          onChange={(e) => updateConfig('stripeWebhookSecret', e.target.value)}
                          className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                          placeholder="whsec_..."
                        />
                      </label>
                    </div>
                  )}

                  {config.ecommercePlatform === 'woocommerce' && (
                    <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 space-y-4">
                      <label className="block">
                        <span className="text-sm font-medium text-purple-200 mb-1 block">Store URL</span>
                        <input
                          type="text"
                          value={config.wooUrl}
                          onChange={(e) => updateConfig('wooUrl', e.target.value)}
                          className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                          placeholder="https://yourstore.com"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                          <span className="text-sm font-medium text-purple-200 mb-1 block">Consumer Key</span>
                          <input
                            type="text"
                            value={config.wooConsumerKey}
                            onChange={(e) => updateConfig('wooConsumerKey', e.target.value)}
                            className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="ck_..."
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-medium text-purple-200 mb-1 block">Consumer Secret</span>
                          <input
                            type="password"
                            value={config.wooConsumerSecret}
                            onChange={(e) => updateConfig('wooConsumerSecret', e.target.value)}
                            className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="cs_..."
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {config.ecommercePlatform === 'shopify' && (
                    <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 space-y-4">
                      <label className="block">
                        <span className="text-sm font-medium text-purple-200 mb-1 block">Shop Domain</span>
                        <input
                          type="text"
                          value={config.shopifyDomain}
                          onChange={(e) => updateConfig('shopifyDomain', e.target.value)}
                          className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                          placeholder="your-store.myshopify.com"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-purple-200 mb-1 block">Access Token</span>
                        <input
                          type="password"
                          value={config.shopifyAccessToken}
                          onChange={(e) => updateConfig('shopifyAccessToken', e.target.value)}
                          className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                          placeholder="shpat_..."
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <label className="block">
                      <span className="text-sm font-medium text-purple-200 mb-1 block">Thank You Message</span>
                      <p className="text-xs text-purple-300/40 mb-2">Sent immediately after purchase</p>
                      <textarea
                        value={config.thankYouMessage}
                        onChange={(e) => updateConfig('thankYouMessage', e.target.value)}
                        className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors h-20 resize-none"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-purple-200 mb-1 block">Survey Question</span>
                      <input
                        type="text"
                        value={config.surveyQuestion}
                        onChange={(e) => updateConfig('surveyQuestion', e.target.value)}
                        className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-sm font-medium text-green-400 mb-1 block">Positive Feedback Message</span>
                        <p className="text-xs text-purple-300/40 mb-2">Shown when rating is high (asks for Google Review)</p>
                        <textarea
                          value={config.positiveMessage}
                          onChange={(e) => updateConfig('positiveMessage', e.target.value)}
                          className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors h-24 resize-none"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-orange-400 mb-1 block">Negative Feedback Message</span>
                        <p className="text-xs text-purple-300/40 mb-2">Shown when rating is low (internal feedback only)</p>
                        <textarea
                          value={config.negativeMessage}
                          onChange={(e) => updateConfig('negativeMessage', e.target.value)}
                          className="w-full bg-[#0f0518] border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors h-24 resize-none"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <label className="block">
                        <span className="text-sm font-medium text-purple-200 mb-1 block">Survey Type</span>
                        <div className="grid grid-cols-3 gap-2">
                          {['EMOJI', 'STARS', 'NPS'].map((type) => (
                            <button
                              key={type}
                              onClick={() => updateConfig('surveyType', type)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                                config.surveyType === type
                                  ? 'bg-purple-600 text-white border-purple-500'
                                  : 'bg-[#0f0518] text-purple-300/60 border-purple-500/20 hover:bg-purple-500/10'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-purple-200 mb-1 block">Positive Threshold</span>
                        <p className="text-xs text-purple-300/40 mb-2">Minimum rating to ask for Google Review</p>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={config.positiveThreshold}
                          onChange={(e) => updateConfig('positiveThreshold', parseInt(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                        <div className="flex justify-between text-xs text-purple-300/40 mt-1">
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                          <span>4</span>
                          <span>5</span>
                        </div>
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-purple-200 mb-1 block">Widget Color</span>
                        <div className="flex gap-2 mt-2">
                          {['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'].map((color) => (
                            <button
                              key={color}
                              onClick={() => updateConfig('widgetColor', color)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                config.widgetColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                          <input
                            type="color"
                            value={config.widgetColor}
                            onChange={(e) => updateConfig('widgetColor', e.target.value)}
                            className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-0 p-0"
                          />
                        </div>
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-purple-200 mb-1 block">Position</span>
                        <div className="grid grid-cols-2 gap-2">
                          {['bottom-right', 'bottom-left'].map((pos) => (
                            <button
                              key={pos}
                              onClick={() => updateConfig('widgetPosition', pos)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                                config.widgetPosition === pos
                                  ? 'bg-purple-600 text-white border-purple-500'
                                  : 'bg-[#0f0518] text-purple-300/60 border-purple-500/20 hover:bg-purple-500/10'
                              }`}
                            >
                              {pos.replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      </label>
                    </div>

                    {/* Preview */}
                    <div className="bg-white/5 rounded-xl border border-purple-500/10 p-6 flex items-center justify-center relative min-h-[300px]">
                      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                      
                      {/* Widget Preview */}
                      <div 
                        className={`absolute p-4 rounded-xl shadow-2xl max-w-[280px] w-full bg-white text-gray-900`}
                        style={{ 
                          [config.widgetPosition.includes('right') ? 'right' : 'left']: '20px',
                          bottom: '20px',
                          borderLeft: `4px solid ${config.widgetColor}`
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm">{config.businessName || 'Business Name'}</h4>
                          <button className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{config.surveyQuestion}</p>
                        <div className="flex justify-center gap-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <button key={i} className="text-xl hover:scale-110 transition-transform">
                              {config.surveyType === 'EMOJI' ? ['😠', '🙁', '😐', '🙂', '😍'][i-1] : '⭐'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-purple-500/10 flex justify-between bg-[#130725]">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
              step === 1
                ? 'opacity-0 pointer-events-none'
                : 'text-purple-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ChevronLeft size={18} />
            Back
          </button>

          <button
            onClick={step === 4 ? handleSubmit : handleNext}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              'Creating...'
            ) : step === 4 ? (
              <>Complete Setup <Check size={18} /></>
            ) : (
              <>Next Step <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
