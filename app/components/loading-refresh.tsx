import { ActivityIndicator, Text, View } from "react-native";

interface LoadingRefreshProps {
    isLoading?: boolean;
}

export default function LoadingRefresh({ isLoading }: LoadingRefreshProps) {
    return (
        isLoading ? (
            <View style={{ alignItems: 'center', marginVertical: 12 }}>
                <ActivityIndicator size="small" color="#1976D2" />
                <Text style={{ color: '#1976D2', marginTop: 4 }}>Refreshing...</Text>
            </View>
        ) : null
    );
}