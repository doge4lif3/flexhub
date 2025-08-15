import { useState } from "react";
import { View, Text, Button, Picker } from "react-native";
import { useDisruptions } from "../store";

export default function DisruptionsScreen() {
  const { analyze } = useDisruptions();
  const [weather, setWeather] = useState("clear");
  const [transit, setTransit] = useState("normal");
  const [supply, setSupply] = useState("ok");
  const [result, setResult] = useState(null);

  const run = async () =>
    setResult(await analyze({ weather, transit, supply }));

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Disruption Mode</Text>
      <Text>Weather</Text>
      <Picker selectedValue={weather} onValueChange={setWeather}>
        <Picker.Item label="Clear" value="clear" />
        <Picker.Item label="Rain" value="rain" />
        <Picker.Item label="Extreme heat" value="extreme_heat" />
      </Picker>

      <Text>Transit</Text>
      <Picker selectedValue={transit} onValueChange={setTransit}>
        <Picker.Item label="Normal" value="normal" />
        <Picker.Item label="Strike" value="strike" />
      </Picker>

      <Text>Supply</Text>
      <Picker selectedValue={supply} onValueChange={setSupply}>
        <Picker.Item label="OK" value="ok" />
        <Picker.Item label="Shortage" value="shortage" />
      </Picker>

      <Button title="Analyze" onPress={run} />
      {result && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "600" }}>Mode: {result.mode}</Text>
          {result.alerts.map((a, i) => (
            <Text key={i}>• {a}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
