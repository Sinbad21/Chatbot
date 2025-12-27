'use client';

import { useState } from 'react';
import { X, Save, Trash2, AlertTriangle } from 'lucide-react';

interface ReviewBotSettingsProps {
 reviewBot: any;
 onClose: () => void;
 onSave: (updated: any) => void;
}

export function ReviewBotSettings({ reviewBot, onClose, onSave }: ReviewBotSettingsProps) {
 const [settings, setSettings] = useState({
  isActive: reviewBot?.isActive ?? true,
  delaySeconds: reviewBot?.delaySeconds ?? 2,
  autoCloseSeconds: reviewBot?.autoCloseSeconds ?? null,
  positiveThreshold: reviewBot?.positiveThreshold ?? 4,
  
  // Messages
  thankYouMessage: reviewBot?.thankYouMessage ?? 'ðŸŽ‰ Grazie per il tuo acquisto!',
  positiveMessage: reviewBot?.positiveMessage ?? 'Fantastico! Ti andrebbe di condividere la tua opinione su Google?',
  negativeMessage: reviewBot?.negativeMessage ?? 'Grazie per il feedback! Cosa possiamo migliorare?',
  completedMessage: reviewBot?.completedMessage ?? 'Grazie mille per il tuo tempo! â¤ï¸',
  
  // Widget
  widgetColor: reviewBot?.widgetColor ?? '#6366f1',
  widgetPosition: reviewBot?.widgetPosition ?? 'bottom-right',
  surveyType: reviewBot?.surveyType ?? 'EMOJI',
 });
 
 const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
 const [saving, setSaving] = useState(false);

 const updateSetting = (key: string, value: any) => {
  setSettings(prev => ({ ...prev, [key]: value }));
 };

 const handleSave = async () => {
  setSaving(true);
  try {
   // TODO: Call API to save settings
   // await fetch(`/api/review-bot/${reviewBot.id}`, {
   //  method: 'PATCH',
   //  body: JSON.stringify(settings),
   // });
   
   // Simulate API call
   await new Promise(resolve => setTimeout(resolve, 500));
   
   onSave({ ...reviewBot, ...settings });
  } catch (error) {
   console.error('Error saving settings:', error);
  } finally {
   setSaving(false);
  }
 };

 const handleDelete = async () => {
  try {
   // TODO: Call API to delete
   // await fetch(`/api/review-bot/${reviewBot.id}`, { method: 'DELETE' });
   
   onClose();
   // Refresh page or redirect
  } catch (error) {
   console.error('Error deleting review bot:', error);
  }
 };

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
   {/* Backdrop */}
   <div 
    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
    onClick={onClose}
   />
   
   {/* Modal */}
   <div className="relative w-full max-w-xl bg-gradient-to-br from-[#1a0b2e] to-[#0f0520] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20">
     <h2 className="text-xl font-bold text-white">Impostazioni Review Bot</h2>
     <button
      onClick={onClose}
      className="p-2 text-purple-300/60 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all"
     >
      <X size={20} />
     </button>
    </div>

    {/* Content */}
    <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
     {/* Status Toggle */}
     <div className="flex items-center justify-between p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
      <div>
       <p className="text-white font-medium">Review Bot Attivo</p>
       <p className="text-purple-300/60 text-sm">Abilita o disabilita il widget</p>
      </div>
      <button
       onClick={() => updateSetting('isActive', !settings.isActive)}
       className={`relative w-14 h-7 rounded-full transition-all ${
        settings.isActive ? 'bg-fuchsia-500' : 'bg-purple-500/30'
       }`}
      >
       <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
        settings.isActive ? 'left-8' : 'left-1'
       }`} />
      </button>
     </div>

     {/* Timing */}
     <div className="space-y-4">
      <h3 className="text-white font-semibold">Timing</h3>
      
      <div className="grid grid-cols-2 gap-4">
       <div>
        <label className="block text-sm text-purple-200 mb-2">
         Ritardo apertura (sec)
        </label>
        <input
         type="number"
         min="0"
         max="60"
         value={settings.delaySeconds}
         onChange={(e) => updateSetting('delaySeconds', parseInt(e.target.value))}
         className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
        />
       </div>
       <div>
        <label className="block text-sm text-purple-200 mb-2">
         Auto-chiusura (sec, vuoto = mai)
        </label>
        <input
         type="number"
         min="0"
         max="300"
         value={settings.autoCloseSeconds || ''}
         onChange={(e) => updateSetting('autoCloseSeconds', e.target.value ? parseInt(e.target.value) : null)}
         placeholder="Mai"
         className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-500/50"
        />
       </div>
      </div>
     </div>

     {/* Survey Settings */}
     <div className="space-y-4">
      <h3 className="text-white font-semibold">Survey</h3>
      
      <div>
       <label className="block text-sm text-purple-200 mb-2">
        Tipo di survey
       </label>
       <select
        value={settings.surveyType}
        onChange={(e) => updateSetting('surveyType', e.target.value)}
        className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
       >
        <option value="EMOJI">Emoji (ðŸ˜ðŸ˜ŠðŸ˜ðŸ˜•ðŸ˜ž)</option>
        <option value="STARS">Stelle (â­â­â­â­â­)</option>
        <option value="NPS">NPS (0-10)</option>
       </select>
      </div>

      <div>
       <label className="block text-sm text-purple-200 mb-2">
        Soglia feedback positivo: {settings.positiveThreshold}+
       </label>
       <input
        type="range"
        min="1"
        max="5"
        value={settings.positiveThreshold}
        onChange={(e) => updateSetting('positiveThreshold', parseInt(e.target.value))}
        className="w-full accent-fuchsia-500"
       />
       <p className="text-purple-400/50 text-xs mt-1">
        Solo rating â‰¥ {settings.positiveThreshold} vedranno il link Google Review
       </p>
      </div>
     </div>

     {/* Messages */}
     <div className="space-y-4">
      <h3 className="text-white font-semibold">Messaggi</h3>
      
      <div>
       <label className="block text-sm text-purple-200 mb-2">
        Messaggio di ringraziamento
       </label>
       <input
        type="text"
        value={settings.thankYouMessage}
        onChange={(e) => updateSetting('thankYouMessage', e.target.value)}
        className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
       />
      </div>

      <div>
       <label className="block text-sm text-purple-200 mb-2">
        Messaggio feedback positivo
       </label>
       <textarea
        value={settings.positiveMessage}
        onChange={(e) => updateSetting('positiveMessage', e.target.value)}
        rows={2}
        className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50 resize-none"
       />
      </div>

      <div>
       <label className="block text-sm text-purple-200 mb-2">
        Messaggio feedback negativo
       </label>
       <textarea
        value={settings.negativeMessage}
        onChange={(e) => updateSetting('negativeMessage', e.target.value)}
        rows={2}
        className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50 resize-none"
       />
      </div>
     </div>

     {/* Widget Appearance */}
     <div className="space-y-4">
      <h3 className="text-white font-semibold">Aspetto Widget</h3>
      
      <div className="grid grid-cols-2 gap-4">
       <div>
        <label className="block text-sm text-purple-200 mb-2">
         Colore
        </label>
        <div className="flex items-center gap-2">
         <input
          type="color"
          value={settings.widgetColor}
          onChange={(e) => updateSetting('widgetColor', e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-purple-500/30"
         />
         <input
          type="text"
          value={settings.widgetColor}
          onChange={(e) => updateSetting('widgetColor', e.target.value)}
          className="flex-1 px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-fuchsia-500/50"
         />
        </div>
       </div>
       <div>
        <label className="block text-sm text-purple-200 mb-2">
         Posizione
        </label>
        <select
         value={settings.widgetPosition}
         onChange={(e) => updateSetting('widgetPosition', e.target.value)}
         className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
        >
         <option value="bottom-right">Basso Destra</option>
         <option value="bottom-left">Basso Sinistra</option>
        </select>
       </div>
      </div>
     </div>

     {/* Danger Zone */}
     <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3">
      <h3 className="text-red-400 font-semibold flex items-center gap-2">
       <AlertTriangle size={18} />
       Zona Pericolosa
      </h3>
      <p className="text-red-300/60 text-sm">
       Eliminando il Review Bot perderai tutte le configurazioni e lo storico delle risposte.
      </p>
      <button
       onClick={() => setShowDeleteConfirm(true)}
       className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-all inline-flex items-center gap-2"
      >
       <Trash2 size={16} />
       Elimina Review Bot
      </button>
     </div>
    </div>

    {/* Footer */}
    <div className="flex justify-end gap-3 px-6 py-4 border-t border-purple-500/20">
     <button
      onClick={onClose}
      className="px-4 py-2 border border-purple-500/30 text-purple-200 rounded-xl hover:bg-purple-500/20 transition-all"
     >
      Annulla
     </button>
     <button
      onClick={handleSave}
      disabled={saving}
      className="px-6 py-2 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-all shadow-lg inline-flex items-center gap-2 disabled:opacity-50"
     >
      {saving ? (
       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
       <Save size={18} />
      )}
      Salva
     </button>
    </div>
   </div>

   {/* Delete Confirmation Modal */}
   {showDeleteConfirm && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
     <div className="bg-[#1a0b2e] border border-red-500/30 rounded-2xl p-6 max-w-md">
      <h3 className="text-xl font-bold text-white mb-2">Conferma Eliminazione</h3>
      <p className="text-purple-300/60 mb-6">
       Sei sicuro di voler eliminare questo Review Bot? Questa azione non puÃ² essere annullata.
      </p>
      <div className="flex justify-end gap-3">
       <button
        onClick={() => setShowDeleteConfirm(false)}
        className="px-4 py-2 border border-purple-500/30 text-purple-200 rounded-xl hover:bg-purple-500/20 transition-all"
       >
        Annulla
       </button>
       <button
        onClick={handleDelete}
        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all inline-flex items-center gap-2"
       >
        <Trash2 size={16} />
        Elimina
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}


