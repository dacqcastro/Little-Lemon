import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Animated, Dimensions } from "react-native";
import * as SQLite from "expo-sqlite";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Navbar from "../Components/navbar";
import UserContext from "../context";
import { TextInput } from "react-native-gesture-handler";
import Filters from "../Components/filters";
import debounce from "lodash.debounce";

const screenWidth = Dimensions.get("window").width;
const sections = ["Starters", "Mains", "Desserts"];

export default function HomeScreen() {
  const heroContainerWidth = screenWidth - 40;
  const { userInfo } = useContext(UserContext);
  const [menu, setMenu] = useState([]);
  const [db, setDb] = useState();
  const [showInput, setShowInput] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchBarText, setSearchBarText] = useState("");
  const [searchWidth] = useState(new Animated.Value(50));
  const URL =
    "https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json";

  const [filterSelections, setFilterSelections] = useState(
    sections.map(() => false)
  );

  const toggleSearch = () => {
    if (showInput) {
      setShowInput(false);
      Animated.timing(searchWidth, {
        toValue: 50,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(searchWidth, {
        toValue: heroContainerWidth,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setShowInput(true));
    }
  };

  const saveMenuToDatabase = async (data) => {
    if (!db || !data || !Array.isArray(data)) return;

    try {
      await db.withTransactionAsync(async () => {
        await db.execAsync("DELETE FROM Menu");

        for (const item of data) {
          await db.runAsync(
            "INSERT INTO Menu(Name, Price, Description, Image, Category) VALUES (?, ?, ?, ?, ?)",
            [item.name, item.price, item.description, item.image, item.category]
          );
        }
      });
      console.log("Menu saved to database successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const handleFiltersChange = async (index) => {
    const arrayCopy = [...filterSelections];
    arrayCopy[index] = !filterSelections[index];
    setFilterSelections(arrayCopy);
  };

  const getMenu = async () => {
    if (!db) {
      console.log("Database not ready yet");
      return;
    }

    try {
      const result = await db.getAllAsync("SELECT * FROM Menu");
      if (result !== null && result.length > 0) {
        setMenu(result);
      } else {
        console.log("No data in database, fetching from API...");
        const menu = await fetchMenu();
        if (menu !== null) {
          saveMenuToDatabase(menu);
          setMenu(menu);
        }
      }
    } catch (error) {
      console.log("Database error:", error);
    }
  };

  const fetchMenu = async () => {
    try {
      console.log("Fetching menu from API");
      const response = await fetch(URL);

      if (response.ok) {
        const result = await response.json();
        return result.menu;
      } else {
        return null;
      }
    } catch (error) {
      console.log("Fetch error:", error);
      return null;
    }
  };

  const filteredSearch = async () => {
    try {
      const activeCategories = sections.filter((s, i) => {
        if (filterSelections.every((item) => item === false)) {
          return true;
        }
        return filterSelections[i];
      });
      const categoryString = `('${activeCategories.join("','")}')`;
      console.log(categoryString.toLowerCase());
      const result = await db.getAllAsync(
        `SELECT * FROM Menu WHERE Name LIKE ? AND Category IN ${categoryString.toLowerCase()}`,
        [`%${searchInput}%`]
      );
      console.log(result);
      setMenu(result);
    } catch (error) {
      console.log(error);
    }
  };

  const delaySearchInput = useCallback((text) => {
    setSearchInput(text);
  }, []);

  const delaySearch = useMemo(
    () => debounce(delaySearchInput, 500),
    [delaySearchInput]
  );

  const handleSearch = (text) => {
    setSearchBarText(text);
    delaySearch(text);
  };

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const database = await SQLite.openDatabaseAsync("little_lemon");
        await database.runAsync(
          "CREATE TABLE IF NOT EXISTS Menu(Name nvarchar(100), Price DECIMAL(10, 2), Description nvarchar(300), Image nvarchar(100), Category NVARCHAR(50))"
        );
        setDb(database);
        console.log("Database initialized successfully");
      } catch (error) {
        console.log("Database initialization error:", error);
      }
    };

    initializeDatabase();
  }, []);

  useEffect(() => {
    if (db) {
      getMenu();
    }
  }, [db]);

  useEffect(() => {
    filteredSearch();
  }, [filterSelections, searchInput]);

  return (
    <View style={styles.container}>
      <Navbar
        initials={userInfo.initials}
        profileImage={userInfo.profileImage}
      />
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Little Lemon</Text>
        <Text style={styles.heroHeader}>Salt Lake City</Text>
        <View style={styles.heroContent}>
          <Text style={styles.heroContentText}>
            We are a family owned Mediterranean restaurant, focused on
            traditional recipes served with a modern twist.
          </Text>
          <Image
            style={styles.heroContentImage}
            resizeMode="scale"
            source={require("../assets/heroImage.jpg")}
          />
        </View>
        <Animated.View style={[styles.searchContainer, { width: searchWidth }]}>
          <TouchableOpacity onPress={toggleSearch} style={styles.searchBar}>
            <Image
              style={styles.searchBarImage}
              resizeMode="contain"
              source={require("../assets/search1.png")}
            />
          </TouchableOpacity>
          {showInput && (
            <TextInput
              value={searchBarText}
              onChangeText={(text) => handleSearch(text)}
              style={styles.searchInput}
              placeholder="Search menu..."
              autoFocus={true}
            />
          )}
        </Animated.View>
      </View>
      <View style={styles.menu}>
        <Text style={styles.menuHeader}>Order for Delivery!</Text>
        <View style={styles.menuTabs}>
          <Filters
            selections={filterSelections}
            onChange={handleFiltersChange}
            sections={sections}
          />
        </View>
        <View style={styles.menuItemContainer}>
          <FlatList
            data={menu}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.menuItem}>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemTitle}>{item.Name}</Text>
                  <Text numberOfLines={2} style={styles.menuItemDesc}>
                    {item.Description}
                  </Text>
                  <Text style={styles.menuItemPrice}>${item.Price}</Text>
                </View>
                <View style={styles.menuItemImageContainer}>
                  <Image
                    style={styles.menuItemImage}
                    resizeMode="scale"
                    source={{
                      uri: `https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/${item.Image}?raw=true`,
                    }}
                  />
                </View>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  hero: {
    backgroundColor: "#495E57",
    padding: 20,
  },
  heroTitle: {
    color: "#F4CE14",
    fontSize: 45,
    fontWeight: "bold",
  },
  heroHeader: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "bold",
    top: -10,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroContentText: {
    color: "#ffffff",
    fontWeight: "500",
    width: 170,
    alignSelf: "center",
  },
  heroContentImage: {
    width: 140,
    height: 140,
    overflow: "hidden",
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#EDEFEE",
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 25,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  searchBar: {
    width: 50,
    height: 50,
    backgroundColor: "#E4E4E4",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarImage: {
    width: 20,
    height: 20,
  },
  menu: {
    flex: 1,
    padding: 20,
  },
  menuHeader: {
    paddingVertical: 10,
    fontSize: 18,
    textTransform: "uppercase",
    fontWeight: "900",
  },
  menuTabs: {
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEFEE",
  },
  menuItemContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    maxHeight: 120,
    paddingVertical: 10,
  },
  menuItemInfo: {
    width: "70%",
    justifyContent: "center",
  },
  menuItemTitle: {
    fontWeight: "700",
    fontSize: 20,
  },
  menuItemDesc: {
    paddingVertical: 10,
  },
  menuItemPrice: {
    fontWeight: "600",
    color: "#8d8d8dff",
  },
  menuItemImageContainer: {
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemImage: {
    width: "80%",
    height: "80%",
  },
});
