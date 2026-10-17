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

export async function uploadDatasetFile(formData) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = {};
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        const res = await fetch(`${API_BASE_URL}/api/datasets/upload`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || 'Upload failed');
        }
        return await res.json();
    } catch (err) {
        console.error('[API] Failed to upload dataset file:', err);
        throw err;
    }
}

export async function uploadNewVersion(datasetId, formData) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = {};
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        const res = await fetch(`${API_BASE_URL}/api/datasets/${datasetId}/versions`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || 'Version upload failed');
        }
        return await res.json();
    } catch (err) {
        console.error('[API] Failed to upload new version:', err);
        throw err;
    }
}

export async function compareDatasetVersions(datasetId, baseVersion, targetVersion) {
    const params = new URLSearchParams();
    if (baseVersion) params.append('base', baseVersion);
    if (targetVersion) params.append('target', targetVersion);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/api/datasets/${datasetId}/compare${queryString}`);
}

export async function syncTrackingBatch(payload) {
    return await apiRequest('/api/tracking/sync', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function toggleTrackingSession(sessionId, status) {
    return await apiRequest(`/api/tracking/session/toggle?session_id=${sessionId}&status=${status}`, {
        method: 'POST',
    });
}

export async function fetchSettings() {
    return await apiRequest('/api/settings');
}

export async function saveSettings(payload) {
    return await apiRequest('/api/settings', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

