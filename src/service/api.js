const API_URL = "http://localhost:8080/api/v1"; // mettre ip du py

export async function getHealth() {
    const response = await fetch(`${API_URL}/health`);

    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return await response.json();
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
