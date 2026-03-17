import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Appearance,
  BackHandler,
} from 'react-native';
import i18n from '@shared/i18n';
import { Colors } from '@shared/theme/colors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

function getSchemeColors() {
  const isDark = Appearance.getColorScheme() === 'dark';
  const scheme = isDark ? Colors.dark : Colors.light;
  return {
    background: scheme.background,
    text: scheme.text,
    textSecondary: scheme.textSecondary,
    textTertiary: scheme.textTertiary,
    surface: scheme.surfaceSecondary,
    primary: Colors.primary,
  };
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private toggleDetails = (): void => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showDetails } = this.state;
      const c = getSchemeColors();

      return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
          <View style={styles.content}>
            <Text style={styles.icon}>⚠</Text>
            <Text style={[styles.title, { color: c.text }]}>{i18n.t('errors.title')}</Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              {i18n.t('errors.subtitle')}
            </Text>

            <TouchableOpacity style={[styles.button, { backgroundColor: c.primary }]} onPress={this.handleReset}>
              <Text style={styles.buttonText}>{i18n.t('errors.retry')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.backButton, { borderColor: c.textTertiary }]}
              onPress={() => BackHandler.exitApp()}
            >
              <Text style={[styles.backButtonText, { color: c.textSecondary }]}>
                {i18n.t('errors.restartApp', { defaultValue: 'Перезапустить' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsToggle}
              onPress={this.toggleDetails}
            >
              <Text style={[styles.detailsToggleText, { color: c.textTertiary }]}>
                {showDetails ? i18n.t('errors.hideDetails') : i18n.t('errors.showDetails')}
              </Text>
            </TouchableOpacity>

            {showDetails && (
              <ScrollView style={[styles.detailsContainer, { backgroundColor: c.surface }]}>
                <Text style={[styles.detailsText, { color: c.textSecondary }]}>
                  {error?.toString()}
                </Text>
                {errorInfo?.componentStack && (
                  <Text style={[styles.detailsText, { color: c.textSecondary }]}>
                    {errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  detailsToggle: {
    padding: 8,
    marginBottom: 8,
  },
  detailsToggleText: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  detailsContainer: {
    maxHeight: 200,
    width: '100%',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  detailsText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;
