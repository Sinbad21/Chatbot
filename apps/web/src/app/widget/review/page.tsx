'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

interface WidgetConfig {
  businessName: string;
  googleReviewUrl: string;
  thankYouMessage: string;
  surveyQuestion: string;
  positiveMessage: string;
  negativeMessage: string;
  completedMessage: string;
  surveyType: 'EMOJI' | 'STARS' | 'NPS';
  positiveThreshold: number;
  widgetColor: string;
  widgetPosition: 'bottom-right' | 'bottom-left';
  delaySeconds: number;
}

type Step = 'loading' | 'survey' | 'positive' | 'negative' | 'completed' | 'error' | 'already-responded';

export default function ReviewWidgetPage() {
  const searchParams = useSearchParams();
  const widgetId = searchParams.get('widgetId') || searchParams.get('id');
  
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [step, setStep] = useState<Step>('loading');
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Generate or retrieve session ID
    const storedSession = localStorage.getItem(`rb_session_${widgetId}`);
    if (storedSession) {
      setSessionId(storedSession);
    } else {
      const newSession = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(`rb_session_${widgetId}`, newSession);
      setSessionId(newSession);
    }

    // Check if already responded
    const hasResponded = localStorage.getItem(`rb_responded_${widgetId}`);
    if (hasResponded) {
      setStep('already-responded');
      return;
    }

    // Fetch widget config
    fetchConfig();
  }, [widgetId]);

  const fetchConfig = async () => {
    try {
      // TODO: Replace with actual API call
      // const res = await fetch(`/api/review-widget/${widgetId}`);
      // const data = await res.json();
      
      // Mock config for development
      const mockConfig: WidgetConfig = {
        businessName: 'Demo Business',
        googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJDemo123',
        thankYouMessage: '🎉 Grazie per il tuo acquisto!',
        surveyQuestion: 'Come valuteresti la tua esperienza?',
        positiveMessage: 'Fantastico! Ti andrebbe di condividere la tua opinione su Google? Ci aiuta tantissimo!',
        negativeMessage: 'Grazie per il feedback! Cosa possiamo migliorare?',
        completedMessage: 'Grazie mille per il tuo tempo! ❤️',
        surveyType: 'EMOJI',
        positiveThreshold: 4,
        widgetColor: '#6366f1',
        widgetPosition: 'bottom-right',
        delaySeconds: 2,
      };
      
      setConfig(mockConfig);
      
      // Delay before showing widget
      setTimeout(() => {
        setStep('survey');
        setIsVisible(true);
      }, mockConfig.delaySeconds * 1000);
      
    } catch (error) {
      console.error('Error fetching widget config:', error);
      setStep('error');
    }
  };

  const handleRating = async (value: number) => {
    setRating(value);
    
    try {
      // TODO: Send rating to API
      // await fetch(`/api/review-widget/${widgetId}/respond`, {
      //   method: 'POST',
      //   body: JSON.stringify({ rating: value, sessionId }),
      // });

      const isPositive = value >= (config?.positiveThreshold || 4);
      setStep(isPositive ? 'positive' : 'negative');
      
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleGoogleClick = async () => {
    try {
      // TODO: Track Google click
      // await fetch(`/api/review-widget/${widgetId}/google-click`, {
      //   method: 'POST',
      //   body: JSON.stringify({ sessionId }),
      // });

      // Open Google Review in new tab
      window.open(config?.googleReviewUrl, '_blank');
      
      // Mark as completed
      localStorage.setItem(`rb_responded_${widgetId}`, 'true');
      setStep('completed');
      
      // Notify parent window
      window.parent.postMessage({ type: 'REVIEW_BOT_RESPONDED' }, '*');
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
        window.parent.postMessage({ type: 'REVIEW_BOT_CLOSE' }, '*');
      }, 3000);
      
    } catch (error) {
      console.error('Error tracking Google click:', error);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      // TODO: Send feedback to API
      // await fetch(`/api/review-widget/${widgetId}/feedback`, {
      //   method: 'POST',
      //   body: JSON.stringify({ feedback, sessionId }),
      // });

      localStorage.setItem(`rb_responded_${widgetId}`, 'true');
      setStep('completed');
      
      window.parent.postMessage({ type: 'REVIEW_BOT_RESPONDED' }, '*');
      
      setTimeout(() => {
        setIsVisible(false);
        window.parent.postMessage({ type: 'REVIEW_BOT_CLOSE' }, '*');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`rb_responded_${widgetId}`, 'true');
    setStep('completed');
    
    setTimeout(() => {
      setIsVisible(false);
      window.parent.postMessage({ type: 'REVIEW_BOT_CLOSE' }, '*');
    }, 2000);
  };

  const handleClose = () => {
    setIsVisible(false);
    window.parent.postMessage({ type: 'REVIEW_BOT_CLOSE' }, '*');
  };

  // Don't render if already responded
  if (step === 'already-responded') {
    return null;
  }

  // Loading state
  if (step === 'loading' || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Error state
  if (step === 'error') {
    return null;
  }

  const position = config.widgetPosition === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  return (
    <div className="min-h-screen bg-transparent p-4">
      {/* Widget Container */}
      <div 
        className={`fixed ${position} w-80 max-w-[calc(100vw-2rem)] transition-all duration-500 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div 
            className="p-4 relative"
            style={{ background: `linear-gradient(135deg, ${config.widgetColor}, ${config.widgetColor}dd)` }}
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm transition-all"
            >
              ×
            </button>
            <p className="text-white font-semibold pr-6">{config.thankYouMessage}</p>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Survey Step */}
            {step === 'survey' && (
              <div className="space-y-4">
                <p className="text-gray-700 text-sm text-center">
                  {config.surveyQuestion}
                </p>
                
                {/* Emoji Survey */}
                {config.surveyType === 'EMOJI' && (
                  <div className="flex justify-center gap-2">
                    {[
                      { emoji: '😞', value: 1 },
                      { emoji: '😕', value: 2 },
                      { emoji: '😐', value: 3 },
                      { emoji: '😊', value: 4 },
                      { emoji: '😍', value: 5 },
                    ].map(({ emoji, value }) => (
                      <button
                        key={value}
                        onClick={() => handleRating(value)}
                        className="text-3xl hover:scale-125 transition-transform cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Stars Survey */}
                {config.surveyType === 'STARS' && (
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRating(value)}
                        className="text-3xl hover:scale-110 transition-transform cursor-pointer"
                        onMouseEnter={(e) => {
                          const stars = e.currentTarget.parentElement?.children;
                          if (stars) {
                            for (let i = 0; i < value; i++) {
                              (stars[i] as HTMLElement).innerText = '⭐';
                            }
                          }
                        }}
                        onMouseLeave={(e) => {
                          const stars = e.currentTarget.parentElement?.children;
                          if (stars) {
                            for (let i = 0; i < 5; i++) {
                              (stars[i] as HTMLElement).innerText = '☆';
                            }
                          }
                        }}
                      >
                        ☆
                      </button>
                    ))}
                  </div>
                )}

                {/* NPS Survey */}
                {config.surveyType === 'NPS' && (
                  <div className="space-y-2">
                    <div className="flex justify-center gap-1 flex-wrap">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
                        let bgColor = 'bg-red-100 hover:bg-red-200 text-red-700';
                        if (value >= 7) bgColor = 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700';
                        if (value >= 9) bgColor = 'bg-green-100 hover:bg-green-200 text-green-700';
                        
                        // Map NPS (0-10) to 1-5 scale for threshold comparison
                        const mappedValue = Math.ceil((value / 10) * 5);
                        
                        return (
                          <button
                            key={value}
                            onClick={() => handleRating(mappedValue)}
                            className={`w-7 h-7 rounded text-sm font-medium transition-all ${bgColor}`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 px-1">
                      <span>Per niente</span>
                      <span>Molto probabile</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Positive Feedback Step */}
            {step === 'positive' && (
              <div className="space-y-4 text-center">
                <p className="text-gray-700 text-sm">
                  {config.positiveMessage}
                </p>
                <button
                  onClick={handleGoogleClick}
                  className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ background: config.widgetColor }}
                >
                  <ExternalLink size={18} />
                  Lascia una recensione su Google
                </button>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
                >
                  No grazie, magari dopo
                </button>
              </div>
            )}

            {/* Negative Feedback Step */}
            {step === 'negative' && (
              <div className="space-y-4">
                <p className="text-gray-700 text-sm text-center">
                  {config.negativeMessage}
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Il tuo feedback ci aiuta a migliorare..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-purple-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-2 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition-all"
                  >
                    Salta
                  </button>
                  <button
                    onClick={handleFeedbackSubmit}
                    className="flex-1 py-2 text-white rounded-xl text-sm transition-all hover:opacity-90"
                    style={{ background: config.widgetColor }}
                  >
                    Invia
                  </button>
                </div>
              </div>
            )}

            {/* Completed Step */}
            {step === 'completed' && (
              <div className="text-center py-4">
                <p className="text-4xl mb-2">❤️</p>
                <p className="text-gray-700 text-sm">
                  {config.completedMessage}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 pb-3">
            <p className="text-center text-xs text-gray-300">
              Powered by Chatbot Studio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
