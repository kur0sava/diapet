import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@shared/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  containerStyle,
  rightElement,
  leftElement,
  ...props
}: InputProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: error ? theme.colors.danger : theme.colors.textSecondary,
              fontSize: theme.fontSizes.sm,
              marginBottom: 6,
              fontWeight: '500',
            },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1.5,
            borderColor: error
              ? theme.colors.danger
              : focused
              ? theme.colors.primary
              : 'transparent',
          },
        ]}
      >
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
        <TextInput
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontSize: theme.fontSizes.base,
              flex: 1,
            },
            props.style,
          ]}
          placeholderTextColor={theme.colors.placeholder}
        />
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>
      {(error || hint) && (
        <Text
          style={[
            styles.hint,
            {
              color: error ? theme.colors.danger : theme.colors.textTertiary,
              fontSize: theme.fontSizes.xs,
              marginTop: 4,
            },
          ]}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  leftElement: {
    paddingLeft: 12,
  },
  rightElement: {
    paddingRight: 12,
  },
  hint: {},
});
