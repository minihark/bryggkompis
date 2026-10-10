import { Recipe } from '../types';

export interface PeerInfo {
  id: string;
  name: string;
}

export interface CheersEvent {
  user: string;
  senderId?: string;
  message?: string;
  timestamp: number;
}

type CheersListener = (event: CheersEvent) => void;
type PeersListener = (peers: PeerInfo[]) => void;
type RecipeListener = (recipe: Recipe, fromUser: string) => void;
type StepToggleListener = (stepId: string, completed: boolean, fromUser: string) => void;
type StatusListener = (connected: boolean) => void;

class CoopManager {
  private ws: WebSocket | null = null;
  private bc: BroadcastChannel | null = null;
  private reconnectTimer: any = null;
  private pingInterval: any = null;

  public roomId: string = 'BROR';
  public userName: string = 'Viktor';
  public isConnected: boolean = false;
  public peers: PeerInfo[] = [];

  private cheersListeners = new Set<CheersListener>();
  private peersListeners = new Set<PeersListener>();
  private recipeListeners = new Set<RecipeListener>();
  private stepListeners = new Set<StepToggleListener>();
  private statusListeners = new Set<StatusListener>();

  constructor() {
    if (typeof window === 'undefined') return;

    // Load saved username
    try {
      const savedName = localStorage.getItem('bryggkompis_user_name');
      if (savedName) this.userName = savedName;
      else {
        // Default to Viktor on first visit, or prompt
        this.userName = 'Viktor';
      }
    } catch (e) {}

    // Parse room from URL query
    try {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('room');
      if (r) {
        this.roomId = r.trim().toUpperCase();
      }
    } catch (e) {}

    // Init BroadcastChannel for local/offline cross-tab sync
    try {
      if ('BroadcastChannel' in window) {
        this.bc = new BroadcastChannel(`bryggkompis_coop_${this.roomId}`);
        this.bc.onmessage = (event) => {
          this.handleIncomingMessage(event.data, true);
        };
      }
    } catch (e) {}

    this.connect();
  }

  public setUserName(name: string) {
    this.userName = name.trim() || 'Bryggare';
    try {
      localStorage.setItem('bryggkompis_user_name', this.userName);
    } catch (e) {}
    this.sendJoin();
  }

  public setRoomId(newRoom: string) {
    const clean = newRoom.trim().toUpperCase() || 'BROR';
    if (clean === this.roomId) return;
    this.roomId = clean;

    // Update URL query without reloading
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('room', clean);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}

    // Update BroadcastChannel
    try {
      if (this.bc) this.bc.close();
      if ('BroadcastChannel' in window) {
        this.bc = new BroadcastChannel(`bryggkompis_coop_${this.roomId}`);
        this.bc.onmessage = (event) => {
          this.handleIncomingMessage(event.data, true);
        };
      }
    } catch (e) {}

    this.sendJoin();
  }

  private connect() {
    if (typeof window === 'undefined') return;
    clearTimeout(this.reconnectTimer);

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      // In dev mode (Vite on port 5173), fallback if server isn't on same port
      const wsUrl = `${protocol}//${host}/ws?room=${encodeURIComponent(this.roomId)}&user=${encodeURIComponent(this.userName)}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.notifyStatus(true);
        this.sendJoin();

        // Heartbeat ping
        clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 20000);
      };

      this.ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          this.handleIncomingMessage(data, false);
        } catch (e) {}
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifyStatus(false);
        clearInterval(this.pingInterval);
        // Try reconnecting in 3 seconds
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = () => {
        // Handled in onclose
      };
    } catch (e) {
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    }
  }

  private sendJoin() {
    const payload = {
      type: 'JOIN',
      room: this.roomId,
      user: this.userName,
    };
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private handleIncomingMessage(data: any, fromBroadcast: boolean) {
    if (!data || !data.type) return;

    if (data.type === 'PEERS' && Array.isArray(data.peers)) {
      this.peers = data.peers;
      this.peersListeners.forEach((fn) => fn(this.peers));
    } else if (data.type === 'JOINED' && Array.isArray(data.peers)) {
      this.peers = data.peers;
      this.peersListeners.forEach((fn) => fn(this.peers));
    } else if (data.type === 'CHEERS') {
      const cheers: CheersEvent = {
        user: data.user || 'En bryggare',
        senderId: data.senderId,
        message: data.message,
        timestamp: data.timestamp || Date.now(),
      };
      this.cheersListeners.forEach((fn) => fn(cheers));
    } else if (data.type === 'RECIPE_UPDATE' && data.recipe) {
      this.recipeListeners.forEach((fn) => fn(data.recipe, data.user || 'Bror'));
    } else if (data.type === 'STEP_TOGGLE' && data.stepId) {
      this.stepListeners.forEach((fn) => fn(data.stepId, Boolean(data.completed), data.user || 'Bror'));
    }
  }

  public sendCheers(message: string = '') {
    const payload = {
      type: 'CHEERS',
      room: this.roomId,
      user: this.userName,
      message,
      timestamp: Date.now(),
    };

    // Send over WS
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }

    // Also mirror through BroadcastChannel for same-machine tabs
    try {
      if (this.bc) this.bc.postMessage(payload);
    } catch (e) {}

    // Trigger local listeners immediately
    this.cheersListeners.forEach((fn) =>
      fn({
        user: this.userName,
        message,
        timestamp: Date.now(),
      })
    );
  }

  public broadcastRecipe(recipe: Recipe) {
    const payload = {
      type: 'RECIPE_UPDATE',
      room: this.roomId,
      user: this.userName,
      recipe,
      version: Date.now(),
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }

    try {
      if (this.bc) this.bc.postMessage(payload);
    } catch (e) {}
  }

  public broadcastStepToggle(stepId: string, completed: boolean) {
    const payload = {
      type: 'STEP_TOGGLE',
      room: this.roomId,
      user: this.userName,
      stepId,
      completed,
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }

    try {
      if (this.bc) this.bc.postMessage(payload);
    } catch (e) {}
  }

  public getShareUrl(): string {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('room', this.roomId);
    return url.toString();
  }

  // Event Subscription methods
  public onCheers(listener: CheersListener) {
    this.cheersListeners.add(listener);
    return () => this.cheersListeners.delete(listener);
  }

  public onPeers(listener: PeersListener) {
    this.peersListeners.add(listener);
    return () => this.peersListeners.delete(listener);
  }

  public onRecipe(listener: RecipeListener) {
    this.recipeListeners.add(listener);
    return () => this.recipeListeners.delete(listener);
  }

  public onStep(listener: StepToggleListener) {
    this.stepListeners.add(listener);
    return () => this.stepListeners.delete(listener);
  }

  public onStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatus(status: boolean) {
    this.statusListeners.forEach((fn) => fn(status));
  }
}

export const coop = new CoopManager();
