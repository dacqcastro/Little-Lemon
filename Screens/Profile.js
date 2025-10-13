import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { MaskedTextInput } from "react-native-mask-text";
import Navbar from "../Components/navbar";
import { UserContext } from "../context";

export default function Profile() {
  const { userInfo, setUserInfo } = useContext(UserContext);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      handleChange("profileImage", result.assets[0].uri);
      console.log(result.assets[0].uri);
    }
  };

  const handleChange = (key, value) => {
    setUserInfo((currentInfo) => ({
      ...currentInfo,
      [key]: typeof value === "undefined" ? !currentInfo[key] : value,
    }));
  };

  const saveUserData = async () => {
    const userData = {
      ...userInfo,
    };

    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      console.log("user data saved");
    } catch (error) {
      console.log(error);
    }
  };

  const logoutUser = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      setUserInfo({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        profileImage: "",
        initials: "",
        orderStatus: false,
        passwordChanges: false,
        specialOffers: false,
        newsletter: false,
        isOnboardingComplete: false,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fi = (userInfo.firstName || "").trim().charAt(0).toUpperCase() || "";
    const li = (userInfo.lastName || "").trim().charAt(0).toUpperCase() || "";
    const initials = fi + li;
    if (userInfo.initials !== initials)
      setUserInfo((prev) => ({ ...prev, initials }));
  }, [userInfo.firstName, userInfo.lastName]);

  return (
    <View style={styles.container}>
      <Navbar
        initials={userInfo.initials}
        profileImage={userInfo.profileImage}
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.subHeaderText}>Personal Information</Text>
        </View>
        <View style={styles.inputBlock}>
          <Text style={styles.labelText}>Avatar</Text>
          <View style={styles.avatarIcons}>
            <View style={styles.avatarUserImageContainer}>
              {userInfo.profileImage ? (
                <Image
                  style={styles.userImage}
                  resizeMode="contain"
                  source={{ uri: userInfo.profileImage }}
                />
              ) : (
                <View style={styles.userImage}>
                  <Text style={styles.userImageInitials}>
                    {userInfo.initials}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarChangeBtn}
            >
              <Text style={styles.avatarChangeBtnText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarRemoveBtn}>
              <Text style={styles.avatarRemoveBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.inputBlock}>
            <Text style={styles.labelText}>First Name</Text>
            <TextInput
              value={userInfo.firstName}
              onChangeText={(value) => handleChange("firstName", value)}
              style={styles.inputField}
            />
          </View>
          <View style={styles.inputBlock}>
            <Text style={styles.labelText}>Last Name</Text>
            <TextInput
              value={userInfo.lastName}
              onChangeText={(value) => handleChange("lastName", value)}
              style={styles.inputField}
            />
          </View>
          <View style={styles.inputBlock}>
            <Text style={styles.labelText}>Email</Text>
            <TextInput
              value={userInfo.email}
              style={styles.inputField}
              onChangeText={(value) => handleChange("email", value)}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputBlock}>
            <Text style={styles.labelText}>Phone Number</Text>
            <MaskedTextInput
              value={userInfo.phoneNumber}
              onChangeText={(value) => handleChange("phoneNumber", value)}
              mask="(999) 999-9999"
              style={styles.inputField}
              keyboardType="phone-pad"
            />
          </View>
        </View>
        <View>
          <Text style={styles.subHeaderText}>Email Notifications</Text>
          <BouncyCheckbox
            onPress={(value) => handleChange("orderStatus", value)}
            isChecked={userInfo.orderStatus}
            innerIconStyle={{ borderWidth: 2 }}
            textStyle={styles.checkbox}
            fillColor="#aaaaaaff"
            text="Order statuses"
          />
          <BouncyCheckbox
            onPress={(value) => handleChange("passwordChanges", value)}
            isChecked={userInfo.passwordChanges}
            innerIconStyle={{ borderWidth: 2 }}
            textStyle={styles.checkbox}
            fillColor="#aaaaaaff"
            text="Password changes"
          />
          <BouncyCheckbox
            onPress={(value) => handleChange("specialOffers", value)}
            isChecked={userInfo.specialOffers}
            innerIconStyle={{ borderWidth: 2 }}
            textStyle={styles.checkbox}
            fillColor="#aaaaaaff"
            text="Special offers"
          />
          <BouncyCheckbox
            onPress={(value) => handleChange("newsletter", value)}
            isChecked={userInfo.newsletter}
            innerIconStyle={{ borderWidth: 2 }}
            textStyle={styles.checkbox}
            fillColor="#aaaaaaff"
            text="Newsletter"
          />
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={logoutUser} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Log out</Text>
          </TouchableOpacity>
          <View style={styles.innerBtns}>
            <TouchableOpacity style={styles.avatarRemoveBtn}>
              <Text style={styles.avatarRemoveBtnText}>Discard changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarChangeBtn}
              onPress={saveUserData}
            >
              <Text style={styles.avatarChangeBtnText}>Save changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  userImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    backgroundColor: "#EDEFEE",
  },
  userImageInitials: {
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "500",
  },
  labelText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#8d8d8dff",
    marginBottom: 5,
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  avatarIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarUserImageContainer: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    overflow: "hidden",
  },
  avatarChangeBtn: {
    padding: 16,
    backgroundColor: "#495E57",
    borderRadius: 12,
    marginHorizontal: 20,
  },
  avatarChangeBtnText: {
    color: "#C8CDCB",
    fontWeight: "900",
  },
  avatarRemoveBtn: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#B6BFBC",
  },
  avatarRemoveBtnText: {
    color: "#B6BFBC",
    fontWeight: "900",
  },
  inputField: {
    padding: 10,
    borderWidth: 1.5,
    borderColor: "#cacacaff",
    borderRadius: 8,
    fontWeight: "900",
    color: "#8d8d8dff",
  },
  inputBlock: {
    marginVertical: 10,
  },
  userInfo: {
    paddingBottom: 10,
  },
  checkbox: {
    textDecorationLine: "none",
    marginVertical: 10,
    fontSize: 13,
    fontWeight: "900",
    color: "#8d8d8dff",
  },
  buttons: {
    marginVertical: 20,
  },
  logoutBtn: {
    paddingVertical: 10,
    backgroundColor: "#F4CE14",
    borderWidth: 3,
    borderColor: "#ebc713ff",
    borderRadius: 10,
    marginBottom: 30,
  },
  logoutBtnText: {
    textAlign: "center",
    fontWeight: "bold",
  },
  innerBtns: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
