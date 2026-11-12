
import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function App() {
    const [counter, setCounter] = useState(0);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mon compteur</Text>

            <Text style={styles.counter}>{counter}</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => setCounter(counter + 1)}
            >
                <Text style={styles.buttonText}>Incrémenter</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    counter: {
        fontSize: 60,
        fontWeight: 'bold',
        color: '#2563eb',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#2563eb',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
