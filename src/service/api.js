const API_URL = "http://localhost:8080"; // mettre ip du py

export async function getHealth() {
    const response = await fetch(`${API_URL}/health`);

    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return await response.text();
}

export async function getTemperature() {
    const response = await fetch(`${API_URL}/temperature`);

    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return await response.json();
}

export async function getTemperatureHistory() {
    const response = await fetch(`${API_URL}/temperature/history`);

    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return await response.json();
}

export async function getParticles() {
    const response = await fetch(`${API_URL}/particles`);

    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return await response.json();
}

export async function getParticlesHistory() {
    const response = await fetch(`${API_URL}/particles/history`);

    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return await response.json();
}

export async function getTools() {
    const response = await fetch(`${API_URL}/tools`);

    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return await response.json();
}

