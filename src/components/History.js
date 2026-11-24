import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

// Transforme un nombre de secondes en texte : "1 h", "50 min", "30 s", "Maint."
const formatAge = (seconds) => {
    if (seconds <= 0) return "Maint.";
    if (seconds < 60) return `${Math.round(seconds)} s`;

    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h} h` : `${h} h ${m}`;
};

export default function History({
                                         title,
                                         values,
                                         unit,
                                         color = "96, 165, 250", // RGB, en texte
                                         stepSeconds = 60,       // temps entre deux mesures
                                         maxPoints = 60,         // nombre de points affichés
                                         labelCount = 5,         // nombre de repères sur l'axe du bas
                                     }) {
    const { width } = useWindowDimensions();

    const data = (values ?? []).filter((v) => Number.isFinite(v)).slice(-maxPoints);
    const n = data.length;

    // On place `labelCount` repères répartis sur toute la courbe
    const labels = data.map(() => "");
    if (n >= 2) {
        for (let k = 0; k < labelCount; k++) {
            const index = Math.round((k * (n - 1)) / (labelCount - 1));
            const ageSeconds = (n - 1 - index) * stepSeconds;
            labels[index] = formatAge(ageSeconds);
        }
    }

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>{title}</Text>

            {n < 2 ? (
                <Text style={styles.empty}>Pas encore assez de données</Text>
            ) : (
                <LineChart
                    data={{ labels, datasets: [{ data }] }}
                    width={width - 40}
                    height={190}
                    yAxisSuffix={` ${unit}`}
                    withDots={false}
                    bezier
                    chartConfig={{
                        backgroundGradientFrom: "#1F2937",
                        backgroundGradientTo: "#1F2937",
                        decimalPlaces: 1,
                        color: (opacity = 1) => `rgba(${color}, ${opacity})`,
                        labelColor: () => "#9CA3AF",
                        propsForBackgroundLines: { stroke: "#374151" },
                        propsForLabels: { fontSize: 10 },
                    }}
                    style={styles.chart}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "#1F2937",
        borderRadius: 12,
        paddingTop: 15,
        paddingBottom: 8,
        marginBottom: 15,
        overflow: "hidden",
    },
    title: { color: "white", fontSize: 18, fontWeight: "bold", marginLeft: 20, marginBottom: 10 },
    chart: { borderRadius: 12 },
    empty: { color: "#9CA3AF", margin: 20 },
});