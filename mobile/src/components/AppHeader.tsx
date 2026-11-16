import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '@/theme';

type AppHeaderProps = {
  eyebrow?: string;
  title: string;
  actionIcon?: 'notifications-outline' | 'settings-outline';
};

export function AppHeader({ eyebrow, title, actionIcon }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionIcon ? (
        <Pressable accessibilityLabel="Open notifications" accessibilityRole="button" style={styles.action}>
          <Ionicons color={colors.ink} name={actionIcon} size={23} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 18,
  },
  copy: { flex: 1 },
  eyebrow: { color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 3 },
  title: { color: colors.ink, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.7 },
  action: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
