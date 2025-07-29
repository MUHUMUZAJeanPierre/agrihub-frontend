import { View, Text, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native'
import React from 'react'

const ios = Platform.OS == 'ios';
export default function CustomKeyboardView({ children, inChat }) {
    let kavConfig = {};
    let scrollViewConfig = {};
    if (inChat) {
        kavConfig = { keyboardVerticalOffset: 90 };
        scrollViewConfig = { contentContainerStyle: styles.scrollViewContent };
    }
    return (
        <KeyboardAvoidingView
            behavior={ios ? 'padding' : 'height'}
            style={styles.flex}
            {...kavConfig}
        >
            <ScrollView
                style={styles.flex}
                bounces={false}
                showsVerticalScrollIndicator={false}
                {...scrollViewConfig}
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    scrollViewContent: {
        flex: 1,
    },
});