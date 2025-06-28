export interface MCPServer {
  id: string;
  name: string;
  description?: string;
  url: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  capabilities?: string[];
  config: MCPServerConfig;
}

export interface MCPServerConfig {
  name: string;
  url: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface MCPConnection {
  id: string;
  server: MCPServer;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastPing?: Date;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
  timestamp: Date;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  serverId: string;
}
