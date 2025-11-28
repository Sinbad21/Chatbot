'use client';

import { useState, useEffect } from 'react';
import { 
  Star, 
  Plus, 
  Settings, 
  BarChart3, 
  Link2, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MousePointer
} from 'lucide-react';
import { ReviewBotWizard } from '@/components/dashboard/wizards/ReviewBotWizard';
import { ReviewBotSettings } from '@/components/dashboard/review-bot/ReviewBotSettings';
import { WidgetSnippet } from '@/components/dashboard/review-bot/WidgetSnippet';
import { 
  WhatsAppIcon, 
  StripeIcon, 
  brandColors 
} from '@/components/icons/BrandIcons';

// Shopify and WooCommerce icons
const ShopifyIcon = ({ size = 24, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
    <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104zm-2.71-17.636c0-.076-.006-.137-.006-.2 0-.625-.164-1.089-.428-1.452l-2.065 17.78 4.918-1.034-2.006-14.655c-.157-.205-.315-.37-.413-.439zM9.653 5.165c-.157-.068-.319-.107-.488-.107-.058 0-.117.005-.176.012-.08.01-.161.024-.245.041-.147.03-.314.066-.495.108-.088.021-.181.044-.28.07-.055.014-.115.03-.18.05-.103.03-.216.066-.336.11a12.045 12.045 0 00-.697.27l-.252.109c-.112.05-.228.104-.35.164-.086.042-.176.087-.268.135l-.31.168c-.052.028-.104.058-.157.089-.276.159-.558.337-.84.536l-.132.096c-.07.051-.14.104-.21.158-.138.107-.276.22-.413.34-.17.148-.34.306-.505.474-.056.057-.111.116-.166.176a8.97 8.97 0 00-.593.713c-.057.075-.113.152-.168.23-.088.123-.173.25-.255.38l-.092.147c-.056.092-.11.186-.162.28-.117.212-.225.43-.32.654l-.063.155a6.812 6.812 0 00-.193.556l-.038.131c-.044.163-.082.328-.113.496l-.018.099c-.024.138-.043.277-.057.418l-.007.072a5.27 5.27 0 00-.018.452c0 .114.005.227.015.34.003.03.006.06.01.09.014.119.033.237.058.354.003.016.007.032.011.048.027.117.06.233.098.347.005.016.011.031.017.047.04.115.086.228.138.34l.024.052c.054.113.114.224.18.332l.034.056c.068.11.143.217.222.322l.042.054c.083.107.172.21.266.31l.043.046c.1.104.206.204.317.3l.039.032c.118.099.242.193.372.281l.011.008c.14.094.287.18.44.26.073.038.148.074.224.108l.024.01c.065.029.13.056.197.082l.04.015c.07.027.141.052.213.075l.038.012c.075.024.152.046.23.065l.028.007c.085.021.172.039.259.054h.002c.1.017.202.03.305.038l.018.001c.097.008.195.013.294.013.256 0 .509-.025.758-.072l.022-.004c.088-.017.175-.037.262-.059l.03-.008c.083-.022.165-.047.246-.074l.038-.013c.079-.026.156-.055.233-.086l.043-.017c.075-.031.149-.064.222-.1l.046-.022c.072-.035.142-.073.212-.113l.048-.027c.069-.041.136-.084.202-.128l.046-.031c.067-.046.132-.094.196-.143l.043-.034c.066-.052.13-.106.193-.162l.036-.031c.068-.062.133-.126.197-.192l.022-.023c.07-.074.137-.15.201-.228l.006-.007a4.53 4.53 0 00.35-.493l.025-.042c.048-.082.093-.166.135-.252l.032-.064c.04-.083.077-.167.111-.253l.028-.07c.033-.086.063-.174.09-.263l.02-.065c.027-.093.05-.188.07-.284l.01-.049c.02-.103.036-.208.048-.314l.003-.027a4.07 4.07 0 00.023-.408c0-.071-.002-.142-.007-.213l-.002-.04a3.923 3.923 0 00-.034-.324l-.006-.043a3.742 3.742 0 00-.062-.323l-.01-.041a3.658 3.658 0 00-.09-.316l-.016-.048a3.568 3.568 0 00-.117-.304l-.023-.053c-.044-.1-.093-.197-.147-.292l-.032-.057c-.054-.094-.114-.185-.179-.273l-.042-.058c-.065-.089-.136-.175-.212-.257l-.052-.058c-.076-.082-.158-.161-.245-.236l-.063-.055c-.087-.075-.18-.147-.28-.214l-.073-.051c-.099-.067-.205-.13-.316-.189l-.08-.044a4.386 4.386 0 00-.352-.166l-.083-.034c-.12-.048-.247-.091-.38-.128l-.075-.022a4.62 4.62 0 00-.412-.094l-.047-.008a4.994 4.994 0 00-.45-.056l-.004-.001a5.636 5.636 0 00-.458-.016c-.083 0-.166.002-.248.007l-.059.003c-.077.005-.153.012-.228.02l-.064.007c-.071.009-.142.019-.212.032l-.065.011c-.067.012-.133.026-.199.041l-.061.014c-.064.016-.127.033-.189.052l-.054.016c-.061.02-.121.04-.18.063l-.044.017c-.058.024-.115.05-.171.077l-.03.015c-.055.027-.109.056-.162.087l-.016.009a2.891 2.891 0 00-.294.196l-.063.05c-.042.034-.083.07-.123.108l-.052.05c-.038.037-.075.077-.11.117l-.04.047c-.035.04-.067.082-.098.125l-.028.039c-.03.043-.059.088-.085.134l-.016.028c-.026.046-.05.093-.072.141l-.006.014c-.022.049-.042.1-.06.15l.001-.003c-.017.05-.032.102-.045.154l.002-.008a1.597 1.597 0 00-.047.312v.006c-.002.053-.002.107 0 .16v.008c.003.054.009.107.018.16l.002.01c.01.053.022.106.037.158l.004.012c.016.052.035.104.057.154l.006.014c.023.051.049.1.078.149l.01.016c.03.049.063.096.099.141l.013.017c.037.046.078.09.121.132l.017.016c.045.043.093.083.144.121l.02.014c.053.039.11.074.168.107l.022.012c.061.033.124.063.19.09l.02.008c.07.028.142.052.217.072l.012.003c.081.021.165.037.25.048l.025.003c.084.01.17.016.257.016a2.26 2.26 0 00.282-.018l.027-.004c.089-.012.177-.03.263-.053l.022-.007c.084-.024.167-.053.248-.087l.016-.007c.08-.034.158-.073.234-.116l.01-.006c.075-.044.147-.093.217-.145l.012-.01c.067-.052.132-.109.194-.17l.006-.006c.065-.063.126-.131.184-.202l.013-.016c.055-.07.107-.145.154-.222l.011-.018c.047-.079.09-.16.128-.244l.008-.017c.038-.085.071-.173.099-.264l.005-.016c.028-.092.05-.187.067-.283l.002-.013c.016-.099.027-.2.032-.302v-.007c.004-.104.002-.21-.006-.316l-.002-.015a3.247 3.247 0 00-.045-.316z"/>
  </svg>
);

const WooCommerceIcon = ({ size = 24, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
    <path d="M2.227 4.857A2.228 2.228 0 000 7.094v7.457c0 1.236 1.001 2.237 2.237 2.237h4.558l-1.26 3.27 4.116-3.27h12.122A2.227 2.227 0 0024 14.551V7.094a2.227 2.227 0 00-2.227-2.237H2.227zm1.078 1.932c.378-.008.753.166.968.549.501.857.96 2.063 1.393 3.593.433 1.521.65 2.702.65 3.534 0 .436-.076.805-.21 1.095-.143.299-.354.455-.629.455-.271 0-.568-.174-.882-.524-.667-.743-1.257-1.963-1.77-3.662-.513-1.707-.77-3.107-.77-4.196 0-.394.073-.676.215-.848.134-.162.348-.253.631-.253.134 0 .272.019.404.057v-.001zm5.904.065c.394-.008.786.123 1.047.467.298.391.445.961.445 1.707 0 1.139-.31 2.449-.938 3.93-.622 1.462-1.391 2.577-2.318 3.341-.429.352-.831.525-1.19.525-.328 0-.6-.144-.81-.436-.206-.286-.311-.676-.311-1.171 0-.553.098-1.043.286-1.472.181-.409.547-.959 1.098-1.657.558-.706.925-1.246 1.099-1.624.177-.382.266-.794.266-1.237 0-.271-.038-.489-.11-.645-.07-.152-.176-.227-.319-.227-.34 0-.809.448-1.405 1.34-.597.894-1.073 1.895-1.43 3.003-.055.175-.128.26-.212.26-.081 0-.155-.077-.214-.237-.248-.673-.37-1.315-.37-1.923 0-1.201.323-2.359.968-3.478.648-1.123 1.42-1.891 2.328-2.298.297-.132.609-.197.939-.197l.051.028zm7.607-.028c.39-.008.783.123 1.044.467.298.391.445.961.445 1.707 0 1.139-.31 2.449-.934 3.93-.626 1.462-1.395 2.577-2.318 3.341-.433.352-.835.525-1.194.525-.328 0-.596-.144-.806-.436-.206-.286-.311-.676-.311-1.171 0-.553.094-1.043.286-1.472.177-.409.543-.959 1.094-1.657.558-.706.929-1.246 1.103-1.624.177-.382.266-.794.266-1.237 0-.271-.042-.489-.114-.645-.066-.152-.172-.227-.315-.227-.344 0-.813.448-1.409 1.34-.593.894-1.069 1.895-1.426 3.003-.059.175-.128.26-.216.26-.077 0-.151-.077-.21-.237-.252-.673-.374-1.315-.374-1.923 0-1.201.323-2.359.972-3.478.644-1.123 1.416-1.891 2.324-2.298.297-.132.609-.197.943-.197l.05.028zm5.483.152c.546 0 .99.31 1.329.934.344.628.512 1.472.512 2.534 0 1.316-.269 2.551-.81 3.707-.545 1.163-1.234 2.044-2.066 2.646-.403.29-.786.436-1.144.436-.403 0-.735-.181-.994-.545-.256-.361-.382-.839-.382-1.435 0-.432.047-.814.143-1.142.1-.332.311-.771.638-1.321.332-.554.559-.98.684-1.277.127-.302.189-.634.189-.997 0-.504-.148-.756-.437-.756-.374 0-.794.398-1.263 1.189-.465.786-.848 1.724-1.144 2.808-.059.215-.143.323-.252.323-.106 0-.181-.112-.227-.336-.155-.756-.231-1.375-.231-1.852 0-1.089.264-2.143.79-3.157.526-1.018 1.165-1.756 1.921-2.217.378-.227.752-.342 1.123-.342.479 0 .865.194 1.161.583.298.386.445.894.445 1.528 0 .56-.108 1.146-.319 1.764-.215.613-.534 1.293-.96 2.037-.185.319-.278.605-.278.857 0 .256.085.483.256.68.172.194.378.29.621.29.396 0 .81-.252 1.242-.756.432-.508.782-1.134 1.051-1.879.269-.748.404-1.459.404-2.133 0-.462-.072-.86-.214-1.196-.142-.332-.342-.499-.6-.499z"/>
  </svg>
);

interface ReviewBotStats {
  totalRequests: number;
  totalResponses: number;
  responseRate: number;
  positiveRate: number;
  googleClicks: number;
  googleClickRate: number;
}

export default function ReviewBotPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSnippet, setShowSnippet] = useState(false);
  const [reviewBot, setReviewBot] = useState<any>(null);
  const [stats, setStats] = useState<ReviewBotStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewBot();
  }, []);

  const fetchReviewBot = async () => {
    try {
      // TODO: Replace with actual API call
      // const res = await fetch('/api/review-bot');
      // const data = await res.json();
      
      // Mock data for now
      setTimeout(() => {
        setReviewBot(null); // Set to null to show empty state, or mock data to show dashboard
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching review bot:', error);
      setLoading(false);
    }
  };

  const handleWizardComplete = (config: any) => {
    console.log('Review Bot configured:', config);
    setShowWizard(false);
    setReviewBot(config);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  // Empty state - no Review Bot configured
  if (!reviewBot && !showWizard) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Review Bot</h1>
            <p className="text-purple-300/60 mt-1">Raccogli recensioni Google automaticamente</p>
          </div>
        </div>

        {/* Empty State Card */}
        <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 border border-purple-500/20 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/30 flex items-center justify-center">
            <Star size={40} className="text-yellow-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            Inizia a raccogliere recensioni
          </h2>
          <p className="text-purple-300/60 max-w-md mx-auto mb-8">
            Configura il tuo Review Bot per contattare automaticamente i clienti dopo ogni acquisto 
            e ottenere più recensioni su Google.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-sm text-purple-200">Survey veloce post-acquisto</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-2xl mb-2">⭐</div>
              <p className="text-sm text-purple-200">Link diretto Google Review</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm text-purple-200">Analytics e metriche</p>
            </div>
          </div>

          {/* Supported Platforms */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-purple-300/60">
              <StripeIcon size={20} className="text-[#635BFF]" />
              <span className="text-sm">Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-purple-300/60">
              <WooCommerceIcon size={20} className="text-[#96588a]" />
              <span className="text-sm">WooCommerce</span>
            </div>
            <div className="flex items-center gap-2 text-purple-300/60">
              <ShopifyIcon size={20} className="text-[#96bf48]" />
              <span className="text-sm">Shopify</span>
            </div>
          </div>

          <button
            onClick={() => setShowWizard(true)}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-purple-500/25 inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Configura Review Bot
          </button>
        </div>

        {/* Wizard Modal */}
        {showWizard && (
          <ReviewBotWizard
            onClose={() => setShowWizard(false)}
            onComplete={handleWizardComplete}
          />
        )}
      </div>
    );
  }

  // Dashboard with Review Bot configured
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Review Bot</h1>
          <p className="text-purple-300/60 mt-1">
            {reviewBot?.businessName || 'Il tuo business'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 border border-purple-500/30 text-purple-200 rounded-xl hover:bg-purple-500/20 transition-all inline-flex items-center gap-2"
          >
            <Settings size={18} />
            Impostazioni
          </button>
          <button
            onClick={() => setShowSnippet(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-purple-500/25 inline-flex items-center gap-2"
          >
            <Link2 size={18} />
            Copia Widget
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Richieste Inviate"
          value={reviewBot?.totalRequests || 0}
          icon={MessageSquare}
          color="purple"
          trend={+12}
        />
        <StatCard
          label="Risposte"
          value={reviewBot?.totalResponses || 0}
          icon={ThumbsUp}
          color="fuchsia"
          trend={+8}
          subtitle={`${((reviewBot?.totalResponses / reviewBot?.totalRequests) * 100 || 0).toFixed(1)}% response rate`}
        />
        <StatCard
          label="Feedback Positivi"
          value={reviewBot?.totalPositive || 0}
          icon={Star}
          color="yellow"
          trend={+15}
          subtitle={`${((reviewBot?.totalPositive / reviewBot?.totalResponses) * 100 || 0).toFixed(1)}% positivi`}
        />
        <StatCard
          label="Click Google Review"
          value={reviewBot?.totalGoogleClicks || 0}
          icon={MousePointer}
          color="emerald"
          trend={+22}
          subtitle={`${((reviewBot?.totalGoogleClicks / reviewBot?.totalPositive) * 100 || 0).toFixed(1)}% conversion`}
        />
      </div>

      {/* Connections & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* eCommerce Connections */}
        <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 border border-purple-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Link2 size={20} className="text-fuchsia-400" />
            Connessioni eCommerce
          </h2>
          
          <div className="space-y-3">
            <ConnectionItem 
              icon={StripeIcon}
              name="Stripe"
              color="#635BFF"
              status="connected"
              lastSync="2 min fa"
            />
            <ConnectionItem 
              icon={WooCommerceIcon}
              name="WooCommerce"
              color="#96588a"
              status="disconnected"
            />
            <ConnectionItem 
              icon={ShopifyIcon}
              name="Shopify"
              color="#96bf48"
              status="disconnected"
            />
          </div>

          <button className="mt-4 w-full py-2 border border-purple-500/30 text-purple-200 rounded-xl hover:bg-purple-500/20 transition-all text-sm">
            + Aggiungi Connessione
          </button>
        </div>

        {/* Recent Reviews */}
        <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 border border-purple-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-fuchsia-400" />
            Attività Recente
          </h2>

          <div className="space-y-3">
            <ActivityItem
              rating={5}
              name="Marco R."
              time="5 min fa"
              clickedGoogle={true}
            />
            <ActivityItem
              rating={4}
              name="Laura B."
              time="23 min fa"
              clickedGoogle={true}
            />
            <ActivityItem
              rating={3}
              name="Giuseppe M."
              time="1h fa"
              clickedGoogle={false}
              feedback="Consegna un po' lenta"
            />
            <ActivityItem
              rating={5}
              name="Anna S."
              time="2h fa"
              clickedGoogle={true}
            />
          </div>

          <button className="mt-4 w-full py-2 border border-purple-500/30 text-purple-200 rounded-xl hover:bg-purple-500/20 transition-all text-sm">
            Vedi tutto
          </button>
        </div>
      </div>

      {/* Widget Preview */}
      <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 border border-purple-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ExternalLink size={20} className="text-fuchsia-400" />
          Anteprima Widget
        </h2>
        
        <div className="bg-[#0a0a0f] rounded-xl p-8 flex items-center justify-center min-h-[300px] relative">
          <p className="text-purple-300/40 text-sm">Anteprima widget in arrivo...</p>
          
          {/* Mini widget preview */}
          <div className="absolute bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-fuchsia-600">
              <p className="text-white font-semibold">🎉 Grazie per il tuo acquisto!</p>
            </div>
            <div className="p-4">
              <p className="text-gray-700 text-sm mb-3">Come valuteresti la tua esperienza?</p>
              <div className="flex justify-center gap-2 text-2xl">
                <span className="cursor-pointer hover:scale-125 transition-transform">😍</span>
                <span className="cursor-pointer hover:scale-125 transition-transform">😊</span>
                <span className="cursor-pointer hover:scale-125 transition-transform">😐</span>
                <span className="cursor-pointer hover:scale-125 transition-transform">😕</span>
                <span className="cursor-pointer hover:scale-125 transition-transform">😞</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showWizard && (
        <ReviewBotWizard
          onClose={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
          editMode={true}
          initialData={reviewBot}
        />
      )}

      {showSettings && (
        <ReviewBotSettings
          reviewBot={reviewBot}
          onClose={() => setShowSettings(false)}
          onSave={(updated) => {
            setReviewBot(updated);
            setShowSettings(false);
          }}
        />
      )}

      {showSnippet && (
        <WidgetSnippet
          widgetId={reviewBot?.widgetId || 'demo-widget'}
          businessName={reviewBot?.businessName}
          onClose={() => setShowSnippet(false)}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  trend,
  subtitle 
}: { 
  label: string; 
  value: number; 
  icon: any; 
  color: string;
  trend?: number;
  subtitle?: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: 'text-purple-400',
    fuchsia: 'text-fuchsia-400',
    yellow: 'text-yellow-400',
    emerald: 'text-emerald-400',
  };

  return (
    <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 border border-purple-500/20 rounded-2xl p-5 hover:border-fuchsia-500/40 transition-all">
      <div className="flex items-start justify-between mb-2">
        <Icon size={20} className={colorClasses[color]} />
        {trend !== undefined && (
          <span className={`text-xs flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}> 
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}> 
        {value.toLocaleString()}
      </p>
      <p className="text-purple-300/60 text-sm">{label}</p>
      {subtitle && (
        <p className="text-purple-400/40 text-xs mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// Connection Item Component
function ConnectionItem({ 
  icon: Icon, 
  name, 
  color, 
  status, 
  lastSync 
}: { 
  icon: any; 
  name: string; 
  color: string; 
  status: 'connected' | 'disconnected';
  lastSync?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-purple-500/10 last:border-0">
      <div className="flex items-center gap-3">
        <div 
          className="p-2 rounded-lg"
          style={{ background: `${color}20` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <p className="text-white font-medium">{name}</p>
          {lastSync && (
            <p className="text-purple-300/40 text-xs">Sync: {lastSync}</p>
          )}
        </div>
      </div>
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
        status === 'connected'
          ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30'
          : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
      }`}> 
        {status === 'connected' ? 'Connesso' : 'Non connesso'}
      </span>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ 
  rating, 
  name, 
  time, 
  clickedGoogle, 
  feedback 
}: { 
  rating: number; 
  name: string; 
  time: string;
  clickedGoogle: boolean;
  feedback?: string;
}) {
  const emojis = ['😞', '😕', '😐', '😊', '😍'];
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-purple-500/10 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emojis[rating - 1]}</span>
        <div>
          <p className="text-white font-medium">{name}</p>
          {feedback && (
            <p className="text-purple-300/50 text-xs">&quot;{feedback}&quot;</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-purple-300/40 text-xs">{time}</p>
        {clickedGoogle && (
          <span className="text-xs text-emerald-400">✓ Google Review</span>
        )}
      </div>
    </div>
  );
}