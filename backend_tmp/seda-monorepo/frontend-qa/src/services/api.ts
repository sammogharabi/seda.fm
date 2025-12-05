// API Service for sedā.fm QA Testing

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.loadToken();
  }

  private loadToken() {
    const user = localStorage.getItem('seda_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.token = userData.token;
      } catch (error) {
        console.error('Error loading user token:', error);
      }
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Chat API Methods
  async createRoom(roomData: { name: string; description?: string; isPrivate?: boolean }) {
    return this.request('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  }

  async joinRoom(roomId: string) {
    return this.request(`/chat/rooms/${roomId}/join`, {
      method: 'POST',
    });
  }

  async leaveRoom(roomId: string) {
    return this.request(`/chat/rooms/${roomId}/leave`, {
      method: 'POST',
    });
  }

  async sendMessage(roomId: string, messageData: { text: string; type?: string }) {
    return this.request(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getMessages(roomId: string, options: { limit?: number; cursor?: string; direction?: string } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.cursor) params.append('cursor', options.cursor);
    if (options.direction) params.append('direction', options.direction);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/chat/rooms/${roomId}/messages${query}`);
  }

  async addReaction(messageId: string, emoji: string) {
    return this.request(`/chat/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  }

  async removeReaction(messageId: string, emoji: string) {
    return this.request(`/chat/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`, {
      method: 'DELETE',
    });
  }

  async getReactions(messageId: string) {
    return this.request(`/chat/messages/${messageId}/reactions`);
  }

  async sendTrackCard(roomId: string, trackData: {
    id: string;
    title: string;
    artist: string;
    album?: string;
    artworkUrl?: string;
    provider: string;
    uri?: string;
    duration?: number;
    previewUrl?: string;
  }) {
    return this.request(`/chat/rooms/${roomId}/track-card`, {
      method: 'POST',
      body: JSON.stringify(trackData),
    });
  }

  // Auth Methods (for demo)
  async mockLogin(userData: any) {
    // For QA testing, we'll use mock authentication
    const mockUser = {
      id: 'test-user-123',
      email: 'test@seda.fm',
      username: 'qauser',
      token: 'mock-jwt-token-for-testing',
      ...userData,
    };
    
    localStorage.setItem('seda_user', JSON.stringify(mockUser));
    this.token = mockUser.token;
    return mockUser;
  }

  logout() {
    localStorage.removeItem('seda_user');
    this.token = null;
  }

  setToken(token: string) {
    this.token = token;
  }
}

// WebSocket Service for real-time chat
export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();

  connect(token?: string) {
    const wsUrl = `${WS_URL}/socket.io/?transport=websocket${token ? `&token=${token}` : ''}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔗 WebSocket connected');
        this.emit('connected');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.event || 'message', data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.emit('disconnected');
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(event: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler?: Function) {
    if (handler) {
      const handlers = this.eventHandlers.get(event) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private emit(event: string, data?: any) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  // Chat-specific methods
  joinRoom(roomId: string) {
    this.send('join_room', { roomId });
  }

  leaveRoom(roomId: string) {
    this.send('leave_room', { roomId });
  }

  sendMessage(roomId: string, message: string) {
    this.send('send_message', { roomId, message });
  }

  addReaction(messageId: string, emoji: string) {
    this.send('add_reaction', { messageId, emoji });
  }

  removeReaction(messageId: string, emoji: string) {
    this.send('remove_reaction', { messageId, emoji });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export const chatWebSocket = new ChatWebSocket();