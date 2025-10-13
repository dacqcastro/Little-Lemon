import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState, useCallback } from "react";

export default function Navbar(props) {
  const navigation = useNavigation();
  const [canGoBack, setCanGoBack] = useState(false);

  // Update navigation state only when screen focuses/changes
  useFocusEffect(
    useCallback(() => {
      const updateNavigationState = () => {
        const newCanGoBack = navigation.canGoBack();

        setCanGoBack(newCanGoBack);
      };

      updateNavigationState();

      const unsubscribe = navigation.addListener(
        "state",
        updateNavigationState
      );

      return unsubscribe;
    }, [navigation])
  );

  return (
    <View style={styles.navbar}>
      <TouchableOpacity
        disabled={!canGoBack}
        onPress={() => {
          if (canGoBack) navigation.goBack();
        }}
        style={[canGoBack ? styles.backBtn : { opacity: 0 }]}
      >
        <Image
          style={styles.backBtnImage}
          resizeMode="contain"
          source={require("../assets/arrow.png")}
        />
      </TouchableOpacity>

      <Image
        style={styles.logo}
        resizeMode="center"
        source={require("../assets/logo.jpg")}
      />

      <TouchableOpacity
        style={styles.userImageContainer}
        onPress={() => navigation.navigate("Profile")}
      >
        {props.profileImage ? (
          <Image
            style={styles.userImage}
            resizeMode="contain"
            source={{ uri: props.profileImage }}
          />
        ) : (
          <View style={styles.userImage}>
            <Text style={styles.userImageInitials}>{props.initials}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    backgroundColor: "#EDEFEE",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnImage: {
    width: 30,
    height: 30,
  },
  logo: {
    width: 140,
    height: 50,
  },
  userImageContainer: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    overflow: "hidden",
  },
  userImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    backgroundColor: "#EDEFEE",
  },
  userImageInitials: {
    alignSelf: "center",
    fontWeight: "500",
  },
});
