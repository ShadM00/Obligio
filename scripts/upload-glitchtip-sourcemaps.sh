#!/usr/bin/env bash
# Upload a release's JS bundle and source map to GlitchTip (or any Sentry-compatible server), so JS errors
# show real function names, files and lines instead of <bundle>:1:<column>.
#
#   scripts/upload-glitchtip-sourcemaps.sh android <release> <dist>
#     e.g. scripts/upload-glitchtip-sourcemaps.sh android 'com.quickpoll.app@1.1.10+58' 58
#   scripts/upload-glitchtip-sourcemaps.sh ios <path to .xcarchive>
#
# The release must equal what the app reports: "<bundle id>@<version>+<build>" (the native release Sentry reads). On iOS it
# is read from the archive's Info.plist, and the source map is the one ios/.xcode.env asks Xcode to keep.
# Environment (sentry-cli's own variable names): SENTRY_URL, SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN.
# Run it after the release was built; the fastlane lanes call it through upload_glitchtip_sourcemaps!.
set -euo pipefail

platform="${1:?usage: $0 android <release> <dist> | ios <xcarchive>}"
: "${SENTRY_URL:?SENTRY_URL is not set}" "${SENTRY_ORG:?SENTRY_ORG is not set}" \
  "${SENTRY_PROJECT:?SENTRY_PROJECT is not set}" "${SENTRY_AUTH_TOKEN:?SENTRY_AUTH_TOKEN is not set}"

root="$(cd "$(dirname "$0")/.." && pwd)"
cli="$root/node_modules/.bin/sentry-cli"

case "$platform" in
  android)
    release="${2:?usage: $0 android <release> <dist>}"
    dist="${3:?usage: $0 android <release> <dist>}"
    name="index.android.bundle"
    bundle="$root/android/app/build/generated/assets/react/release/$name"
    map="$root/android/app/build/generated/sourcemaps/react/release/$name.map"
    ;;
  ios)
    archive="${2:?usage: $0 ios <xcarchive>}"
    app="$(find "$archive/Products/Applications" -maxdepth 1 -name '*.app' | head -n 1)"
    [ -n "$app" ] || { echo "no .app in $archive" >&2; exit 1; }
    plist() { /usr/libexec/PlistBuddy -c "Print :$1" "$app/Info.plist"; }
    dist="$(plist CFBundleVersion)"
    release="$(plist CFBundleIdentifier)@$(plist CFBundleShortVersionString)+$dist"
    name="main.jsbundle"
    bundle="$app/$name"
    map="$root/ios/build/glitchtip/$name.map"
    ;;
  *)
    echo "unknown platform: $platform" >&2
    exit 1
    ;;
esac

[ -f "$bundle" ] || { echo "missing JS bundle: $bundle (build the release first)" >&2; exit 1; }
[ -f "$map" ] || { echo "missing source map: $map (build the release first)" >&2; exit 1; }
[ -x "$cli" ] || { echo "missing sentry-cli at $cli (run npm install)" >&2; exit 1; }

stage="$(mktemp -d)"
trap 'rm -rf "${stage:?}"' EXIT
cp "$bundle" "$stage/$name"
cp "$map" "$stage/$name.map"

# Android and iOS can share a build number, and so a release; GlitchTip answers 500 to creating one twice.
"$cli" releases new "$release" || echo "release $release may already exist; uploading anyway"
"$cli" sourcemaps upload --release "$release" --dist "$dist" --url-prefix 'app:///' "$stage"
echo "Uploaded source maps for $release (dist $dist) to $SENTRY_URL"
