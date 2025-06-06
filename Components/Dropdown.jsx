import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Dropdown = ({ options = [], selectedOption, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOptionSelect = (option) => {
    setModalVisible(false);
    onSelect(option);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.container}>
        <Text>{selectedOption}</Text>
        <Ionicons name="caret-down" size={20} color="black" />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalContainer}>
          <View style={[styles.optionsContainer, { top: 50 }]}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleOptionSelect(option)}
                style={styles.option}
              >
                <Text>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    justifyContent: "space-between",
  },
  modalContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  optionsContainer: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    maxHeight: 150,
    overflow: "auto",
  },
});

export default Dropdown;
