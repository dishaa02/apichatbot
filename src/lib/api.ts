// API service for communicating with the FastAPI backend

const API_BASE_URL = 'http://localhost:8000'; // Update this to match your FastAPI server port

export interface PromptInput {
  prompt: string;
  model: string;
}

export interface ApiResponse {
  model: string;
  response: string;
}

export interface ChainRequest {
  prompt: string;
  models: string[];
}

export interface ChainResponse {
  responses: Array<{
    model: string;
    response: string;
  }>;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Single model request
  async askModel(prompt: string, model: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
  }

  // Health check to verify backend connectivity
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export the class for testing or custom instances
export { ApiService };

export async function chainModelsAPI(prompt: string, models: string[]) {
  const response = await fetch(`${API_BASE_URL}/chain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, models }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function uploadFilesAPI(files: File[]) {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
} 