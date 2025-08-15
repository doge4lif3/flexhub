import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function AdaptiveList({ loader, renderItem, title }) {
  const [data, setData] = useState([]);
  const [err, setErr] = useState(null);
  const refresh = async () => {
    try {
      setData(await loader());
      setErr(null);
    } catch (e) {
      setErr(e.message);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 8 }}>
        {title}
      </Text>
      <TouchableOpacity onPress={refresh} style={{ marginBottom: 12 }}>
        <Text>↻ Refresh</Text>
      </TouchableOpacity>
      {err ? <Text style={{ color: "red" }}>{err}</Text> : null}
      {data.map(renderItem)}
    </View>
  );
}
