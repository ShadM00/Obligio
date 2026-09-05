# Local release setup

Configure App Store Connect API credentials, iOS provisioning/signing in Xcode, and `android/fastlane/google-play-service-account.json` locally. Run `bundle exec fastlane ios release` and `bundle exec fastlane android release`. Release completion requires verifying uploaded builds in both store consoles. No GitHub Actions are used.

Android release signing reads these environment variables (or private user Gradle properties):

- `OBLIGIO_UPLOAD_STORE_FILE`: absolute path to the existing upload keystore.
- `OBLIGIO_UPLOAD_STORE_PASSWORD`: keystore password.
- `OBLIGIO_UPLOAD_KEY_ALIAS`: release upload key alias.
- `OBLIGIO_UPLOAD_KEY_PASSWORD`: key password.

Do not put passwords in the repository or replace a registered upload key without checking Play Console. Run `cd android && ./gradlew :app:validateObligioUploadSigning` to check configuration before building. Missing configuration fails release builds; debug builds continue to use the development key. This check does not prove that the key matches Play Console or that a release was uploaded.
