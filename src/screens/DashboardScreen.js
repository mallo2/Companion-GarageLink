import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

import { getHealth, getTemperature, getTemperatureHistory } from "../service/api";

const Card = ({ title, value }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
    </View>
);

export default function DashboardScreen() {
    const [health, setHealth] = useState(null);
    const [temperature, setTemperature] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const refresh = async () => {
            try {
                // les 3 requêtes partent en parallèle
                const [h, t, hist] = await Promise.all([
                    getHealth(),
                    getTemperature(),
                    getTemperatureHistory(),
                ]);

                if (mounted) {
                    setHealth(h);
                    setTemperature(t);
                    setHistory(hist);
                    setError(null);
                }
            } catch (err) {
                if (mounted) setError("Impossible de contacter le serveur.");
            }
        };

        refresh();
        const interval = setInterval(refresh, 2000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>GarageLink</Text>
            <Text style={styles.subtitle}>État de votre garage</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            {!temperature ? (
                <Text style={styles.loading}>Chargement des capteurs...</Text>
            ) : (
                <>
                    <Card title="Serveur" value={health?.status ?? "—"} />
                    <Card title="Température" value={`${temperature.value} °C`} />

                    <Text style={styles.section}>Historique</Text>
                    {history.slice(-10).reverse().map((item, i) => (
                        <Text key={i} style={styles.historyItem}>
                            {item.timestamp} : {item.value} °C
                        </Text>
                    ))}
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#101827", padding: 20 },
    title: { color: "white", fontSize: 30, fontWeight: "bold", marginTop: 40 },
    subtitle: { color: "#9CA3AF", marginBottom: 25 },
    card: { backgroundColor: "#1F2937", padding: 20, borderRadius: 12, marginBottom: 15 },
    cardTitle: { color: "#9CA3AF", fontSize: 15 },
    cardValue: { color: "white", fontSize: 24, fontWeight: "bold", marginTop: 8 },
    section: { color: "white", fontSize: 20, fontWeight: "bold", marginTop: 10, marginBottom: 10 },
    historyItem: { color: "#9CA3AF", marginBottom: 4 },
    error: { color: "#F87171", marginBottom: 15 },
    loading: { color: "white" },
});