import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function getAuthHeader() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            return {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
            };
        }
    } catch {
        // ignore
    }
    return { 'Content-Type': 'application/json' };
}

async function apiRequest(endpoint, options = {}) {
    try {
        const headers = await getAuthHeader();
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...(options.headers || {}),
            },
        });

        if (!res.ok) {
            // Handle HTTP errors
            return null;
        }

        return await res.json();
    } catch (err) {
        // Backend offline or network error — fail gracefully
        console.warn(`[API] Failed to fetch ${endpoint}:`, err.message);
        return null;
    }
}

// ── Exported API Methods ─────────────────────────────────────────────────────

export async function fetchDashboard() {
    return await apiRequest('/api/dashboard');
}

export async function fetchProjects() {
    const data = await apiRequest('/api/projects');
    return Array.isArray(data) ? data : [];
}

export async function fetchProject(id) {
    return await apiRequest(`/api/projects/${id}`);
}

export async function createProject(payload) {
    return await apiRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function fetchDatasets() {
    const data = await apiRequest('/api/datasets');
    return Array.isArray(data) ? data : [];
}

export async function fetchDataset(id) {
    return await apiRequest(`/api/datasets/${id}`);
}

export async function createDataset(payload) {
    return await apiRequest('/api/datasets', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function fetchExperiments() {
    const data = await apiRequest('/api/experiments');
    return Array.isArray(data) ? data : [];
}

export async function fetchExperiment(id) {
    return await apiRequest(`/api/experiments/${id}`);
}

export async function createExperiment(payload) {
    return await apiRequest('/api/experiments', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function fetchLineage() {
    const data = await apiRequest('/api/lineage');
    return data || { nodes: [], edges: [] };
}

export async function fetchResults() {
    const data = await apiRequest('/api/results');
    return Array.isArray(data) ? data : [];
}

export async function fetchTracking() {
    const data = await apiRequest('/api/tracking');
    return Array.isArray(data) ? data : [];
}
