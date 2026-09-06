fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios release

```sh
[bundle exec] fastlane ios release
```

Build a signed App Store archive and upload it to TestFlight

### ios upload

```sh
[bundle exec] fastlane ios upload
```

Upload an already-built IPA to TestFlight, without rebuilding

### ios metadata

```sh
[bundle exec] fastlane ios metadata
```

Push App Store listing metadata from fastlane/metadata without uploading a build

### ios screenshots

```sh
[bundle exec] fastlane ios screenshots
```

Push App Store screenshots from fastlane/screenshots without uploading a build

----


## Android

### android release

```sh
[bundle exec] fastlane android release
```

Build a signed Android App Bundle and upload it to the chosen Play track

### android metadata

```sh
[bundle exec] fastlane android metadata
```

Push Play listing metadata from fastlane/metadata/android without uploading a build

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
