import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { UserContext } from "../context";
import { KeyboardAvoidingView, Platform } from "react-native";

export default function Onboarding() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showFirstNameError, setShowFirstNameError] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);

  const getInitials = (name) => {
    const trimmed = (name || "").trim();
    return trimmed.length ? trimmed[0].toUpperCase() : "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name) => {
    const nameRegex = /^[A-Za-z]+$/;
    return nameRegex.test(name);
  };

  const validateData = () => {
    const isNameValid = validateName(firstName);
    const isEmailValid = validateEmail(email);
    const isFormValid =
      isNameValid && isEmailValid && firstName.length > 0 && email.length > 0;

    setButtonDisabled(!isFormValid);

    if (isEmailValid === false && email.length > 0) {
      setShowEmailError(true);
    } else {
      setShowEmailError(false);
    }

    if (isNameValid === false && firstName.length > 0) {
      setShowFirstNameError(true);
    } else {
      setShowFirstNameError(false);
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
  };

  const handleFirstName = (text) => {
    setFirstName(text);
  };

  useEffect(() => {
    validateData();
  }, [email, firstName]);

  const saveUserData = async () => {
    const userData = {
      firstName: firstName,
      lastName: userInfo.lastName,
      email: email,
      isOnboardingComplete: true,
      initials: getInitials(firstName),
      profileImage: "",
      phoneNumber: "",
      orderStatus: false,
      passwordChanges: false,
      specialOffers: false,
      newsletter: false,
    };

    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      setUserInfo(userData);
      console.log("user saved");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : -40}
    >
      <View style={styles.container}>
        <View style={styles.logo}>
          <Image
            style={styles.logoImage}
            resizeMode="contain"
            source={require("../assets/logo.jpg")}
          />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.contentSubHeader}>Let us get to know you</Text>
          <View style={styles.contentItem}>
            <Text style={styles.inputText}>First Name</Text>
            <TextInput
              value={firstName}
              onChangeText={handleFirstName}
              style={styles.inputField}
            />
            <Text
              style={[showFirstNameError ? styles.inputError : { opacity: 0 }]}
            >
              first name is invalid!
            </Text>
          </View>
          <View style={styles.contentItem}>
            <Text style={styles.inputText}>Email</Text>
            <TextInput
              keyboardType="email-address"
              value={email}
              onChangeText={handleEmailChange}
              style={styles.inputField}
            />
            <Text style={[showEmailError ? styles.inputError : { opacity: 0 }]}>
              Enter a valid email!
            </Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, buttonDisabled && styles.buttonDisabled]}
            disabled={buttonDisabled}
            onPress={saveUserData}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  logo: {
    height: "15%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    height: 60,
    width: 200,
  },
  contentContainer: {
    height: "60%",
    paddingHorizontal: 40,
    backgroundColor: "#ebebebff",
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: 30,
  },
  contentItem: {
    width: "100%",
  },
  contentSubHeader: {
    fontSize: 26,
    fontWeight: "400",
    color: "#4b4b4bff",
  },
  inputError: {
    color: "red",
  },
  inputText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#4b4b4bff",
    paddingBottom: 10,
  },
  inputField: {
    borderColor: "#4b4b4bff",
    borderWidth: 3,
    borderRadius: 10,
    width: "100%",
    paddingLeft: 10,
  },
  buttonContainer: {
    height: "25%",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 120,
    height: 60,
    justifyContent: "center",
    backgroundColor: "#F4CE14",
    borderWidth: 3,
    borderColor: "#ebc713ff",
    borderRadius: 30,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: "#ebebebff",
    borderColor: "#7e7e7eff",
  },
  buttonText: {
    color: "#4b4b4bff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
});
