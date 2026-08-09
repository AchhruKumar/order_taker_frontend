export const getApiBase = (customEnvUrl?: string) => {
  let envUrl = (customEnvUrl !== undefined ? customEnvUrl : (process.env.NEXT_PUBLIC_API_URL || '')).trim();
  
  if (!envUrl || (!envUrl.startsWith('http://') && !envUrl.startsWith('https://'))) {
    envUrl = 'https://order-taker-backend.onrender.com';
  }

  const cleanUrl = envUrl.replace(/\/$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_BASE = getApiBase();

export async function fetchMenu() {
  const res = await fetch(`${API_BASE}/menu`);
  if (!res.ok) throw new Error('Failed to fetch menu');
  return await res.json();
}

export async function createMenuItem(itemData: any) {
  const res = await fetch(`${API_BASE}/menu/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });
  if (!res.ok) throw new Error('Failed to create menu item');
  return await res.json();
}

export async function updateMenuItem(id: string, itemData: any) {
  const res = await fetch(`${API_BASE}/menu/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });
  if (!res.ok) throw new Error('Failed to update menu item');
  return await res.json();
}

export async function deleteMenuItem(id: string) {
  const res = await fetch(`${API_BASE}/menu/items/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete menu item');
  return await res.json();
}

export async function fetchCurrentOrder() {
  const res = await fetch(`${API_BASE}/order/current`);
  if (!res.ok) throw new Error('Failed to fetch order');
  return await res.json();
}

export async function sendVoiceCommand(utterance: string, apiKey?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers['x-groq-api-key'] = apiKey;
  }

  const res = await fetch(`${API_BASE}/order/voice-command`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ utterance })
  });

  if (!res.ok) throw new Error('Failed to send voice command');
  return await res.json();
}

export async function resetOrder() {
  const res = await fetch(`${API_BASE}/order/reset`, {
    method: 'POST'
  });

  if (!res.ok) throw new Error('Failed to reset order');
  return await res.json();
}

export async function confirmOrder(tipAmount: number) {
  const res = await fetch(`${API_BASE}/order/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipAmount })
  });

  if (!res.ok) throw new Error('Failed to confirm order');
  return await res.json();
}

export async function fetchAllOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return await res.json();
}

export async function deleteOrder(id: string) {
  const res = await fetch(`${API_BASE}/order/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete order');
  return await res.json();
}

export async function deleteAllOrders() {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to clear order history');
  return await res.json();
}

export async function fetchSchemaInspector() {
  const res = await fetch(`${API_BASE}/schema`);
  if (!res.ok) throw new Error('Failed to fetch schema inspector');
  return await res.json();
}

export async function fetchGroqKeyStatus() {
  const res = await fetch(`${API_BASE}/config/groq-key`);
  if (!res.ok) throw new Error('Failed to fetch Groq key status');
  return await res.json();
}

export async function fetchGroqQuota() {
  const res = await fetch(`${API_BASE}/config/groq-quota`);
  if (!res.ok) throw new Error('Failed to fetch Groq quota');
  return await res.json();
}

export async function updateGroqApiKey(apiKey: string) {
  const res = await fetch(`${API_BASE}/config/groq-key`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  if (!res.ok) throw new Error('Failed to update Groq API key');
  return await res.json();
}
