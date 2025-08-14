import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Box } from "./ui/box";
import { Button } from "./ui/button";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";
import { Badge } from "./ui/badge";

export default function TaskList() {
    const [newTastTitle, setNewTaskTitle] = useState('')
    const [newTaskDesc, setNewTaskDesc]= useState('')
  return (
    <View>
      <Text>TaskList</Text>
    </View>
  );
}
