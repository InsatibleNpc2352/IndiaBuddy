import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const TOKEN_KEY = 'auth_token';

export const login = async (email: string, password: string) => {
  // Simulate API call
  return new Promise<void>((resolve) => {
    setTimeout(async () => {
      await SecureStore.setItemAsync(TOKEN_KEY, 'dummy_jwt_token_12345');
      resolve();
    }, 1000);
  });
};

export const logout = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const enableBiometric = async (enabled: boolean) => {
  await SecureStore.setItemAsync('biometric_enabled', enabled ? 'true' : 'false');
};

export const authenticateWithBiometric = async (): Promise<boolean> => {
  const isEnabled = await SecureStore.getItemAsync('biometric_enabled');
  if (isEnabled !== 'true') return false;

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to login',
      fallbackLabel: 'Use passcode',
    });
    return result.success;
  }
  return false;
};
