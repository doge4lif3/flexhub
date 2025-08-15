import RootNav from "./src/navigation";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <RootNav />
      <StatusBar style="auto" />
    </View>
  );
}
