import { useState } from "react";
import { View, Text, Button, TextInput } from "react-native";
import { useEvents } from "../store";

export default function CalendarScreen(){
  const { events, add, suggest, remove } = useEvents();
  const [title,setTitle]=useState("");

  const addQuick = async ()=>{
    const start = Date.now() + 60*60*1000;
    await add({ title: title || "Blocked focus", start_ts: start, end_ts: start + 60*60*1000, flexible: 1 });
    setTitle("");
  };

  const getSuggestion = async ()=>{
    const s = await suggest({ durationMin: 60, dayStart: "09:00", dayEnd:"18:00", rain: false });
    alert(Suggested: ${new Date(s.suggested_start).toLocaleTimeString()} – ${new Date(s.suggested_end).toLocaleTimeString()} (${s.reason}));
  };

  return (
    <View style={{ padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:"700" }}>Calendar</Text>
      <View style={{ flexDirection:"row", gap:8, marginVertical:12 }}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Event title" style={{ flex:1, borderWidth:1, padding:8, borderRadius:6 }} />
        <Button title="Add 1h" onPress={addQuick} />
      </View>
      <Button title="Suggest slot" onPress={getSuggestion} />
      <Text style={{ marginTop:16, fontWeight:"600" }}>Today’s Events</Text>
      {events.map(e=>(
        <View key={e.id} style={{ paddingVertical:8, borderBottomWidth:1, borderColor:"#eee" }}>
          <Text>• {e.title}</Text>
          <Text>{e.start_ts ? new Date(e.start_ts).toLocaleTimeString() : "No time"} - {e.end_ts ? new Date(e.end_ts).toLocaleTimeString() : ""}</Text>
          <Button title="Delete" onPress={()=>remove(e.id)} />
        </View>
      ))}
    </View>
  );
}

