import fs from 'fs';
import path from 'path';

/**
 * firebase.json holds the privacy settings (no advertising ID, consent
 * defaults denied, and so on). React Native Firebase reads each one by an exact
 * key name in its build scripts, and silently ignores a key it does not know:
 * three consent defaults were once written with a `google_analytics_` prefix
 * and had no effect on either platform. This fails when a key is not one the
 * installed SDK actually reads.
 */
const root = path.join(__dirname, '..', 'node_modules', '@react-native-firebase');
const readers = [
  'app/ios_config.sh',
  'app/android/build.gradle',
  'analytics/android/build.gradle',
  'analytics/ios_config.sh',
  'crashlytics/android/build.gradle',
  'crashlytics/ios_config.sh',
  'crashlytics/ios/RNFBCrashlytics/RNFBCrashlyticsInitProvider.m',
  'crashlytics/android/src/main/java/io/invertase/firebase/crashlytics/Constants.java',
]
  .map(file => path.join(root, file))
  .filter(file => fs.existsSync(file))
  .map(file => fs.readFileSync(file, 'utf8'))
  .join('\n');

const settings = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'firebase.json'), 'utf8'),
)['react-native'] as Record<string, unknown>;

describe('firebase.json', () => {
  it.each(Object.keys(settings))('%s is read by the SDK', key => {
    expect(readers).toMatch(new RegExp(`['"]${key}['"]`));
  });

  it('denies the advertising consent defaults', () => {
    expect(settings.analytics_default_allow_ad_storage).toBe(false);
    expect(settings.analytics_default_allow_ad_user_data).toBe(false);
    expect(settings.analytics_default_allow_ad_personalization_signals).toBe(false);
  });
});
