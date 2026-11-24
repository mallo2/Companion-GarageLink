import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";

import {
    getHealth,
    getTemperature,
    getTemperatureHistory,
    getParticles,
    getParticlesHistory,
    getTools,
} from "../service/api";
import History from "../components/History";

// 1 point d'historique = 1 minute (en démo comme en réel)
// À adapter si ton back enregistre à un autre rythme
const STEP_SECONDS = 60;
const MAX_POINTS = 60;

// ---------- Données du mode démo ----------
const MOCK_HEALTH = "ok";
const MOCK_TEMPERATURE = { value: 22.4 };
const MOCK_PARTICLES = { pm25: 12 };
const MOCK_TOOLS = {
    tools: [
        { name: "Visseuse", present: false },
        { name: "Marteau", present: true },
        { name: "Tournevis", present: true },
    ],
};

// Génère un historique qui varie doucement (comme une vraie mesure)
const makeMockHistory = (start, variation, min, max, n = MAX_POINTS) => {
    const out = [];
    let v = start;
    for (let i = 0; i < n; i++) {
        v = Math.min(max, Math.max(min, v + (Math.random() - 0.5) * variation));
        out.push(+v.toFixed(1));
    }
    return out;
};

// ---------- Composants d'affichage ----------
const Card = ({ title, value }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
    </View>
);

// Carte qui prend la moitié de la largeur (ligne température + PM2.5)
const HalfCard = ({ title, value, unit }) => (
    <View style={[styles.card, styles.halfCard]}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>
            {value}
            <Text style={styles.cardUnit}> {unit}</Text>
        </Text>
    </View>
);

// Une ligne par outil : "Marteau" ........ ● présent
const ToolRow = ({ name, present }) => (
    <View style={styles.toolRow}>
        <Text style={styles.toolName}>{name}</Text>
        <View style={styles.toolStatus}>
            <View
                style={[
                    styles.dot,
                    { backgroundColor: present ? "#34D399" : "#F87171" },
                ]}
            />
            <Text
                style={[
                    styles.toolStatusText,
                    { color: present ? "#34D399" : "#F87171" },
                ]}
            >
                {present ? "présent" : "non présent"}
            </Text>
        </View>
    </View>
);

// ---------- Écran ----------
export default function DashboardScreen() {
    const [demoMode, setDemoMode] = useState(false);
    const [health, setHealth] = useState(null);
    const [temperature, setTemperature] = useState(null);
    const [particles, setParticles] = useState(null);
    const [tempHistory, setTempHistory] = useState([]);
    const [pmHistory, setPmHistory] = useState([]);
    const [tools, setTools] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // ---------- MODE DÉMO ----------
        if (demoMode) {
            setError(null);
            setHealth(MOCK_HEALTH);
            setTemperature(MOCK_TEMPERATURE);
            setParticles(MOCK_PARTICLES);
            setTempHistory(makeMockHistory(22, 0.6, 18, 28));
            setPmHistory(makeMockHistory(12, 6, 3, 60));
            setTools(MOCK_TOOLS.tools);

            // Accéléré : toutes les 2 s, on simule 1 minute qui passe
            const interval = setInterval(() => {
                const t = +(20 + Math.random() * 5).toFixed(1);
                const p = Math.round(5 + Math.random() * 40);

                setTemperature({ value: t });
                setParticles({ pm25: p });
                setTempHistory((prev) => [...prev, t].slice(-MAX_POINTS));
                setPmHistory((prev) => [...prev, p].slice(-MAX_POINTS));

                // un outil change d'état au hasard pour tester l'affichage
                setTools((prev) =>
                    prev.map((tool) =>
                        Math.random() < 0.2
                            ? { ...tool, present: !tool.present }
                            : tool
                    )
                );
            }, 2000);

            return () => clearInterval(interval);
        }

        // ---------- MODE RÉEL ----------
        // On repart de zéro pour retrouver "Chargement..." si le back est éteint
        setHealth(null);
        setTemperature(null);
        setParticles(null);
        setTempHistory([]);
        setPmHistory([]);
        setTools([]);

        let mounted = true;

        const refresh = async () => {
            try {
                // les 6 requêtes partent en parallèle
                const [h, t, p, tHist, pHist, toolsData] = await Promise.all([
                    getHealth(),
                    getTemperature(),
                    getParticles(),
                    getTemperatureHistory(),
                    getParticlesHistory(),
                    getTools(),
                ]);

                if (mounted) {
                    setHealth(h);
                    setTemperature(t);
                    setParticles(p);
                    setTempHistory(tHist.values);
                    setPmHistory(pHist.values);
                    setTools(toolsData.tools);
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
    }, [demoMode]);

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            >
            <Text style={styles.title}>GarageLink</Text>
            <Text style={styles.subtitle}>État de votre garage</Text>

            {/* Bouton visible uniquement en développement */}
            {__DEV__ && (
                <TouchableOpacity
                    style={[styles.demoButton, demoMode && styles.demoButtonActive]}
                    onPress={() => setDemoMode((d) => !d)}
                >
                    <Text style={styles.demoButtonText}>
                        {demoMode ? "Quitter le mode démo" : "Activer le mode démo"}
                    </Text>
                </TouchableOpacity>
            )}

            {demoMode && <Text style={styles.demoBadge}>MODE DÉMO : données simulées</Text>}

            {error && <Text style={styles.error}>{error}</Text>}

            {!temperature || !particles ? (
                <Text style={styles.loading}>Chargement des capteurs...</Text>
            ) : (
                <>
                    {/* Première ligne : température + PM2.5 */}
                    <View style={styles.row}>
                        <HalfCard title="Température" value={temperature.value} unit="°C" />
                        <HalfCard title="PM2.5" value={particles.pm25} unit="µg/m³" />
                    </View>

                    {/* Outils (badges RFID) */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Outils</Text>
                        {tools.map((tool) => (
                            <ToolRow
                                key={tool.name}
                                name={tool.name}
                                present={tool.present}
                            />
                        ))}
                    </View>

                    <History
                        title="Température"
                        values={tempHistory}
                        unit="°C"
                        color="96, 165, 250"
                        stepSeconds={STEP_SECONDS}
                        maxPoints={MAX_POINTS}
                    />

                    <History
                        title="Particules PM2.5"
                        values={pmHistory}
                        unit="µg/m³"
                        color="251, 191, 36"
                        stepSeconds={STEP_SECONDS}
                        maxPoints={MAX_POINTS}
                    />

                    <Card title="Serveur" value={health ?? "—"} />
                </>
            )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#101827", padding: 20 },
    title: { color: "white", fontSize: 30, fontWeight: "bold", marginTop: 40 },
    subtitle: { color: "#9CA3AF", marginBottom: 25 },
    row: { flexDirection: "row", gap: 15, marginBottom: 15 },
    card: { backgroundColor: "#1F2937", padding: 20, borderRadius: 12, marginBottom: 15 },
    halfCard: { flex: 1, marginBottom: 0 },
    cardTitle: { color: "#9CA3AF", fontSize: 15 },
    cardValue: { color: "white", fontSize: 24, fontWeight: "bold", marginTop: 8 },
    cardUnit: { color: "#9CA3AF", fontSize: 14, fontWeight: "normal" },
    error: { color: "#F87171", marginBottom: 15 },
    loading: { color: "white" },
    demoButton: {
        backgroundColor: "#374151",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 15,
    },
    demoButtonActive: { backgroundColor: "#2563EB" },
    demoButtonText: { color: "white", fontWeight: "600" },
    demoBadge: { color: "#FBBF24", marginBottom: 15, fontWeight: "600" },

    // Outils
    toolRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#374151",
    },
    toolName: { color: "white", fontSize: 18, fontWeight: "600" },
    toolStatus: { flexDirection: "row", alignItems: "center", gap: 8 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    toolStatusText: { fontSize: 16, fontWeight: "600" },
});