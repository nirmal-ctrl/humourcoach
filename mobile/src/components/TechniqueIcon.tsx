import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

export function TechniqueIcon({ name }: { name: 'sparkles' | 'list' | 'repeat' | 'resize' }) {
  return (
    <View style={styles.icon}>
      <Ionicons color={colors.primary} name={name} size={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
