const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://node-backend-host/api/v1';

export const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  // Chat endpoints
  chat: {
    completions: (data) => apiClient.request('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    models: () => apiClient.request('/models'),
  },

  // Media endpoints
  media: {
    upload: (formData) => apiClient.request('/media/assets', {
      method: 'POST',
      body: formData,
    }),
    list: () => apiClient.request('/media/assets'),
  },

  // Analytics endpoints
  analytics: {
    events: (data) => apiClient.request('/analytics/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    aggregates: (params) => apiClient.request(`/analytics/aggregates?${new URLSearchParams(params)}`),
  },

  // Stream endpoints
  streams: {
    list: () => apiClient.request('/streams'),
    get: (id) => apiClient.request(`/streams/${id}`),
  },
};
