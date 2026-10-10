import React, { useState } from 'react';
import { PeerInfo, coop } from '../utils/coop';
import { Users, Copy, Check, Sparkles, X, Share2, Radio, UserCheck, Shield } from 'lucide-react';
import { playClick, playCheersClink } from '../utils/audio';

interface CoopModalProps {
  isOpen: boolean;
  onClose: () => void;
  peers: PeerInfo[];
  isConnected: boolean;
  currentRoom: string;
  userName: string;
  onUpdateUser: (name: string) => void;
  onUpdateRoom: (room: string) => void;
  onTriggerCheers: (msg?: string) => void;
  lang: 'sv' | 'en';
}

export const CoopModal: React.FC<CoopModalProps> = ({
  isOpen,
  onClose,
  peers,
  isConnected,
  currentRoom,
  userName,
  onUpdateUser,
  onUpdateRoom,
  onTriggerCheers,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempRoom, setTempRoom] = useState(currentRoom);
  const [cheersMsg, setCheersMsg] = useState('');

  if (!isOpen) return null;

  const handleCopyLink = () => {
    playClick();
    const shareUrl = coop.getShareUrl();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateUser(tempName.trim());
      playClick();
    }
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempRoom.trim()) {
      onUpdateRoom(tempRoom.trim().toUpperCase());
      playClick();
    }
  };

  const handleSendCheers = () => {
    onTriggerCheers(cheersMsg);
    setCheersMsg('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-brew-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md shadow-amber-500/20">
              🍻
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{lang === 'sv' ? 'Co-op Bryggning' : 'Co-op Brewing'}</span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isConnected ? (lang === 'sv' ? 'Ansluten' : 'Connected') : (lang === 'sv' ? 'Kopplar upp...' : 'Connecting...')}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'sv'
                  ? 'Brygg tillsammans i realtid – klicka Skål för att fira på båda skärmarna!'
                  : 'Brew together in real time – hit Cheers to toast across screens!'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-brew-850 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Share Card */}
        <div className="bg-brew-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              {lang === 'sv' ? 'Ditt Bryggrum (Dela länk)' : 'Brew Room (Share Link)'}
            </span>
            <span className="text-xs font-mono font-black text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              {currentRoom}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={coop.getShareUrl()}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 select-all truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-stone-950'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (lang === 'sv' ? 'Kopierad!' : 'Copied!') : (lang === 'sv' ? 'Kopiera' : 'Copy')}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            {lang === 'sv'
              ? 'Skicka länken till din bror-i-lag på WhatsApp eller SMS för att brygga tillsammans.'
              : 'Send this link to your brewing partner to collaborate together.'}
          </p>
        </div>

        {/* Connected Brewers List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{lang === 'sv' ? 'Bryggare i rummet' : 'Brewers in room'}</span>
            </span>
            <span className="text-slate-400 font-mono">
              {peers.length > 0 ? `${peers.length} aktiva` : '1 aktiv (du)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* You */}
            <div className="p-3 rounded-xl bg-brew-950/70 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">🧑‍🍳</span>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{userName}</div>
                  <div className="text-[10px] text-amber-400 font-medium">
                    {lang === 'sv' ? 'Du (denna enhet)' : 'You (this device)'}
                  </div>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Other peers */}
            {peers
              .filter((p) => p.name.toLowerCase() !== userName.toLowerCase())
              .map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="p-3 rounded-xl bg-brew-950/70 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">🍺</span>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{p.name}</div>
                      <div className="text-[10px] text-emerald-400 font-medium">
                        {lang === 'sv' ? 'Ansluten partner' : 'Connected partner'}
                      </div>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
              ))}

            {peers.filter((p) => p.name.toLowerCase() !== userName.toLowerCase()).length === 0 && (
              <div className="p-3 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500 text-center">
                {lang === 'sv'
                  ? 'Väntar på att din partner ska ansluta...'
                  : 'Waiting for partner to join...'}
              </div>
            )}
          </div>
        </div>

        {/* Change Name or Room */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <form onSubmit={handleSaveName} className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {lang === 'sv' ? 'Ditt Visningsnamn' : 'Your Display Name'}
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="T.ex. Viktor"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                {lang === 'sv' ? 'Spara' : 'Save'}
              </button>
            </div>
          </form>

          <form onSubmit={handleSaveRoom} className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {lang === 'sv' ? 'Byt Rumskod' : 'Change Room Code'}
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={tempRoom}
                onChange={(e) => setTempRoom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-amber-500"
                placeholder="T.ex. BROR"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                {lang === 'sv' ? 'Byt' : 'Switch'}
              </button>
            </div>
          </form>
        </div>

        {/* Big Cheers Trigger in Modal */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex gap-2">
            <input
              type="text"
              value={cheersMsg}
              onChange={(e) => setCheersMsg(e.target.value)}
              placeholder={lang === 'sv' ? 'Valfri skål-hälsning (t.ex. "Skål för IPA:n!")...' : 'Optional toast message...'}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSendCheers}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5"
            >
              <span>🍻</span>
              <span>{lang === 'sv' ? 'SKÅL TILLSAMMANS!' : 'CHEERS TOGETHER!'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
