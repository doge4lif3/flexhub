import { useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { useTasks } from "../store";

export default function TasksScreen() {
  const { tasks, add, update, remove, prioritize } = useTasks();
  const [title, setTitle] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const addTask = async () => {
    if (!title.trim()) return;
    await add({ title, energy: 2 });
    setTitle("");
  };

  const loadPriority = async () => {
    const p = await prioritize();
    setSuggestions(p.slice(0, 5));
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Tasks</Text>
      <View style={{ flexDirection: "row", gap: 8, marginVertical: 12 }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="New task…"
          style={{ flex: 1, borderWidth: 1, padding: 8, borderRadius: 6 }}
        />
        <Button title="Add" onPress={addTask} />
      </View>

      <TouchableOpacity onPress={loadPriority}>
        <Text>✨ Get priorities</Text>
      </TouchableOpacity>
      {suggestions.map((t) => (
        <Text key={t.id} style={{ marginTop: 4 }}>
          • {t.title} (score {t.score})
        </Text>
      ))}

      <Text style={{ marginTop: 16, fontWeight: "600" }}>All</Text>
      {tasks.map((t) => (
        <View
          key={t.id}
          style={{
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text>{t.title}</Text>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
            <Button
              title={t.done ? "Done ✔" : "Mark done"}
              onPress={() => update(t.id, { ...t, done: t.done ? 0 : 1 })}
            />
            <Button title="Delete" color="#b33" onPress={() => remove(t.id)} />
          </View>
        </View>
      ))}
    </View>
  );
}
