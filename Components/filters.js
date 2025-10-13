import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function Filters({ onChange, selections, sections }) {
  return (
    <View style={styles.filtersContainer}>
      {sections.map((section, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            onChange(index);
          }}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
            padding: 16,
            marginRight: 15,
            backgroundColor: selections[index] ? "#555555ff" : "#EDEFEE",
            borderWidth: 1,
            borderColor: "white",
          }}
        >
          <View>
            <Text style={{ color: selections[index] ? "white" : "black" }}>
              {section}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
});
