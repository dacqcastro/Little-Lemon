import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import HomeScreen from "./Screens/HomeScreen";
import LoadingScreen from "./Screens/LoadingScreen";
import Onboarding from "./Screens/Onboarding";
import Profile from "./Screens/Profile";
import { UserContext } from "./context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardAvoidingView, Platform } from "react-native";

const Stack = createNativeStackNavigator();

export default function App() {
  const [userInfo, setUserInfo] = useState({
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const results = await AsyncStorage.getItem("userData");
        if (results !== null) {
          const userData = JSON.parse(results);
          setUserInfo((currentForm) => ({
            ...currentForm,
            ...userData,
          }));
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading == true) return <LoadingScreen />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserContext.Provider value={{ userInfo, setUserInfo }}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
              <NavigationContainer>
                <Stack.Navigator
                  key={
                    userInfo.isOnboardingComplete
                      ? "authenticated"
                      : "onboarding"
                  }
                  screenOptions={{ headerShown: false }}
                >
                  {userInfo.isOnboardingComplete === true ? (
                    <>
                      <Stack.Screen name="Home" component={HomeScreen} />
                      <Stack.Screen name="Profile" component={Profile} />
                    </>
                  ) : (
                    <Stack.Screen name="Onboarding" component={Onboarding} />
                  )}
                </Stack.Navigator>
              </NavigationContainer>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
      </UserContext.Provider>
    </GestureHandlerRootView>
  );
}
