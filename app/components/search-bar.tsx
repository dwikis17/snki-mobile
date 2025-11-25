import { StyleSheet, TextInput, View } from "react-native";

interface SearchBarProps {
    search: string;
    setSearch: (text: string) => void;
}

export default function SearchBar({ search, setSearch }: SearchBarProps) {
    return (
        <View style={styles.searchBarContainer}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search PR number or creator"
                value={search}
                placeholderTextColor={'gray'}
                onChangeText={setSearch}
                clearButtonMode="while-editing"
            />
            {/* Filter icon placeholder */}
            <View style={styles.filterIcon} />
        </View>
    );
}

const styles = StyleSheet.create({
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    searchBar: {
        flex: 1,
        height: 40,
        fontSize: 16,
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: 8,
        color: 'black',
    },
    filterIcon: {
        width: 24,
        height: 24,
        marginLeft: 8,
    },
});