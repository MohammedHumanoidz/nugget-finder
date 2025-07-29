import { cookies } from "next/headers";

/**
 * Server-side tRPC client for making authenticated requests
 */
class ServerTRPCClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_SERVER_URL || '';
  }

  private async makeRequest(path: string, input?: any) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;
    
    const url = new URL(`/trpc/${path}`, this.baseURL);
    
    if (input) {
      url.searchParams.set('input', JSON.stringify(input));
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionToken ? `better-auth.session_token=${sessionToken}` : '',
      },
      cache: 'no-store', // Always get fresh data
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result?.data;
  }

  async getSavedIdeas() {
    return this.makeRequest('ideas.getSavedIdeas');
  }

  async getClaimedIdeas() {
    return this.makeRequest('ideas.getClaimedIdeas');
  }

  async getUserLimits() {
    return this.makeRequest('ideas.getLimits');
  }

  async getActivityTrends() {
    return this.makeRequest('ideas.getActivityTrends');
  }
}

export const serverTRPC = new ServerTRPCClient();