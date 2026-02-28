import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Appearance,
} from 'react-native';
import i18n from '@shared/i18n';

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

      const isDark = Appearance.getColorScheme() === 'dark';
      return (
        <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.content}>
            <Text style={styles.icon}>⚠</Text>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>{i18n.t('errors.title')}</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#AEAEB2' : '#666666' }]}>
              {i18n.t('errors.subtitle')}
            </Text>

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>{i18n.t('errors.retry')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsToggle}
              onPress={this.toggleDetails}
            >
              <Text style={styles.detailsToggleText}>
                {showDetails ? i18n.t('errors.hideDetails') : i18n.t('errors.showDetails')}
              </Text>
            </TouchableOpacity>

            {showDetails && (
              <ScrollView style={styles.detailsContainer}>
                <Text style={styles.detailsText}>
                  {error?.toString()}
                </Text>
                {errorInfo?.componentStack && (
                  <Text style={styles.detailsText}>
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
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#4A90D9',
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
  detailsToggle: {
    padding: 8,
    marginBottom: 8,
  },
  detailsToggleText: {
    color: '#999999',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  detailsContainer: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  detailsText: {
    fontSize: 11,
    color: '#444444',
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;
