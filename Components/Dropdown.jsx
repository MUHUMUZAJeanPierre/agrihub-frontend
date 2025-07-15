import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '../contexts/ThemeContext';

const LightColors = {
  background: '#FFFFFF',
  border: '#ccc',
  text: '#000',
  modalBg: 'rgba(0, 0, 0, 0.5)',
  optionBg: '#fff',
  optionBorder: '#ccc',
  icon: '#000',
};
const DarkColors = {
  background: '#1E1E1E',
  border: '#3A3A3A',
  text: '#FFF',
  modalBg: 'rgba(0, 0, 0, 0.7)',
  optionBg: '#232323',
  optionBorder: '#444',
  icon: '#FFF',
};

const Dropdown = ({ options = [], selectedOption, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const Colors = theme === 'dark' ? DarkColors : LightColors;

  const handleOptionSelect = (option) => {
    setModalVisible(false);
    onSelect(option);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.container, { backgroundColor: Colors.background, borderColor: Colors.border }]}> 
        <Text style={{ color: Colors.text }}>{selectedOption}</Text>
        <Ionicons name="caret-down" size={20} color={Colors.icon} />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalContainer, { backgroundColor: Colors.modalBg }]}> 
          <View style={[styles.optionsContainer, { backgroundColor: Colors.optionBg, borderColor: Colors.optionBorder }]}> 
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleOptionSelect(option)}
                style={[styles.option, { borderBottomColor: Colors.optionBorder }]}
              >
                <Text style={{ color: Colors.text }}>{option}</Text>
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
    padding: 10,
    justifyContent: "space-between",
    borderRadius: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
  },
  optionsContainer: {
    width: "80%",
    borderRadius: 5,
    borderWidth: 1,
    maxHeight: 200,
    overflow: "hidden",
  },
});

export default Dropdown;
