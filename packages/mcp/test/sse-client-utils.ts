import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport, SSEClientTransportOptions } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport, StreamableHTTPClientTransportOptions } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export interface SSEMCPClientOptions {
  /** The SSE endpoint URL */
  url: string;
  /** Client information */
  clientInfo: {
    name: string;
    version: string;
  };
  /** SSE transport options */
  transportOptions?: SSEClientTransportOptions;
}

export interface StreamHTTPMCPClientOptions {
  /** The StreamHTTP endpoint URL */
  url: string;
  /** Client information */
  clientInfo: {
    name: string;
    version: string;
  };
  /** StreamHTTP transport options */
  transportOptions?: StreamableHTTPClientTransportOptions;
  /** Authorization token for requests */
  authorization?: string;
}

/**
 * Creates an MCP client with SSE transport
 * @param options SSE MCP client configuration options
 * @returns Promise that resolves to connected MCP client
 */
export async function createSSEMCPClient(options: SSEMCPClientOptions): Promise<Client> {
  const transport = new SSEClientTransport(new URL(options.url), options.transportOptions);

  const client = new Client(options.clientInfo);
  
  await client.connect(transport);
  
  return client;
}

/**
 * Creates an MCP client with StreamHTTP transport
 * @param options StreamHTTP MCP client configuration options
 * @returns Promise that resolves to connected MCP client
 */
export async function createStreamHTTPMCPClient(options: StreamHTTPMCPClientOptions): Promise<Client> {
  const transportOptions = {
    ...options.transportOptions,
  };

  // Add authorization header if provided
  if (options.authorization) {
    if (!transportOptions.requestInit) {
      transportOptions.requestInit = {};
    }
    if (!transportOptions.requestInit.headers) {
      transportOptions.requestInit.headers = {};
    }
    transportOptions.requestInit.headers = {
      ...transportOptions.requestInit.headers,
      'Authorization': options.authorization
    };
  }

  const transport = new StreamableHTTPClientTransport(new URL(options.url), transportOptions);

  const client = new Client(options.clientInfo);

  await client.connect(transport);

  return client;
}

/**
 * Creates a test StreamHTTP MCP client with default configuration for testing
 * @param url The StreamHTTP endpoint URL
 * @param clientName Optional client name (defaults to 'test-client')
 * @param authorization Optional authorization token
 * @returns Promise that resolves to connected MCP client
 */
export async function createTestStreamHTTPMCPClient(
  url: string,
  clientName: string = 'test-client',
  authorization?: string
): Promise<Client> {
  return createStreamHTTPMCPClient({
    url,
    clientInfo: {
      name: clientName,
      version: '1.0.0'
    },
    authorization
  });
}

/**
 * Creates a test SSE MCP client with default configuration for testing
 * @param url The SSE endpoint URL
 * @param clientName Optional client name (defaults to 'test-client')
 * @returns Promise that resolves to connected MCP client
 */
export async function createTestSSEMCPClient(
  url: string, 
  clientName: string = 'test-client'
): Promise<Client> {
  return createSSEMCPClient({
    url,
    clientInfo: {
      name: clientName,
      version: '1.0.0'
    }
  });
}

/**
 * Utility class for managing MCP client lifecycle in tests (supports both SSE and StreamHTTP)
 */
export class SSEMCPClientManager {
  private clients: Client[] = [];

  /**
   * Creates and tracks an SSE MCP client
   */
  async createClient(options: SSEMCPClientOptions): Promise<Client> {
    const client = await createSSEMCPClient(options);
    this.clients.push(client);
    return client;
  }

  /**
   * Creates and tracks a StreamHTTP MCP client
   */
  async createStreamHTTPClient(options: StreamHTTPMCPClientOptions): Promise<Client> {
    const client = await createStreamHTTPMCPClient(options);
    this.clients.push(client);
    return client;
  }

  /**
   * Creates and tracks a test SSE MCP client
   */
  async createTestClient(url: string, clientName?: string): Promise<Client> {
    const client = await createTestSSEMCPClient(url, clientName);
    this.clients.push(client);
    return client;
  }

  /**
   * Creates and tracks a test StreamHTTP MCP client
   */
  async createTestStreamHTTPClient(url: string, clientName?: string, authorization?: string): Promise<Client> {
    const client = await createTestStreamHTTPMCPClient(url, clientName, authorization);
    this.clients.push(client);
    return client;
  }

  /**
   * Closes all tracked clients with proper cleanup
   */
  async closeAllClients(): Promise<void> {
    // Close all clients and wait for them to properly disconnect
    await Promise.allSettled(this.clients.map(async client => {
      try {
        await client.close();
      } catch (error) {
        // Ignore close errors as the client might already be closed
        console.warn('Client close error (ignoring):', error.message);
      }
    }));
    this.clients = [];
    
    // Add a small delay to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Gets all tracked clients
   */
  getClients(): Client[] {
    return [...this.clients];
  }
}