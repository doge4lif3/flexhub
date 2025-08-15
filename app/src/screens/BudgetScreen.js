import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useBudget } from "../store";

const monthKey = () => new Date().toISOString().slice(0, 7);

export default function BudgetScreen() {
  const month = monthKey();
  const { items, tips, upsert } = useBudget(month);
  const [cat, setCat] = useState("");
  const [plan, setPlan] = useState("");

  const addItem = async () => {
    if (!cat || !plan) return;
    await upsert({
      category: cat,
      planned_cents: Math.round(parseFloat(plan) * 100),
      month,
    });
    setCat("");
    setPlan("");
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Budget – {month}</Text>
      <View style={{ flexDirection: "row", gap: 8, marginVertical: 12 }}>
        <TextInput
          value={cat}
          onChangeText={setCat}
          placeholder="Category"
          style={{ flex: 1, borderWidth: 1, padding: 8, borderRadius: 6 }}
        />
        <TextInput
          value={plan}
          onChangeText={setPlan}
          placeholder="Planned $"
          keyboardType="decimal-pad"
          style={{ width: 120, borderWidth: 1, padding: 8, borderRadius: 6 }}
        />
        <Button title="Add" onPress={addItem} />
      </View>

      {tips.length ? (
        <View
          style={{
            backgroundColor: "#fff7e6",
            padding: 10,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <Text>Suggestions:</Text>
          {tips.map((t, i) => (
            <Text key={i}>• {t.message}</Text>
          ))}
        </View>
      ) : null}

      {items.map((i) => (
        <View
          key={i.id}
          style={{
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text>{i.category}</Text>
          <Text>
            Planned: ${(i.planned_cents / 100).toFixed(2)} Actual: $
            {(i.actual_cents / 100).toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
}
