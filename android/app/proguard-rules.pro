# Project keep rules for R8 (release builds).
#
# React Native's own consumer rules already keep every NativeModule class with
# all its members (so ObligioAuth, ObligioWatch and ObligioPreferences keep
# their @ReactMethod names), and classes named in AndroidManifest.xml
# (activities, ObligioWatchService) are kept by the build. Libraries ship their
# own consumer rules. Add a rule here only for a class a release build has been
# seen to lose, and say which.

# Readable native stack traces in Crashlytics.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# WorkManager opens its Room database by reflection (WorkDatabase_Impl()).
# The room-runtime 2.5.0 rule keeps the class but not its constructor, and the
# first minified build crashed at launch in androidx.startup without this.
-keep class * extends androidx.room.RoomDatabase { <init>(); }
