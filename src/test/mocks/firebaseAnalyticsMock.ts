/**
 * @react-native-firebase/analytics stand-in for jest.
 *
 * The real module reaches for a native event emitter at import time and throws
 * outside a device, so any test that transitively imports
 * `@shared/analytics/analytics` (onboarding, dashboard, auth flows) would fail
 * on the import alone. Calls are recorded as jest mocks so a test can assert on
 * them if it cares; analytics is fire-and-forget everywhere else.
 */
const logEvent = jest.fn().mockResolvedValue(undefined);
const setUserProperty = jest.fn().mockResolvedValue(undefined);
const setAnalyticsCollectionEnabled = jest.fn().mockResolvedValue(undefined);

const analytics = () => ({
  logEvent,
  setUserProperty,
  setAnalyticsCollectionEnabled,
});

export default analytics;
