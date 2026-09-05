#import <React/RCTBridgeModule.h>

// Export the Swift implementation through React Native's native-module interop.
@interface RCT_EXTERN_MODULE(ObligioAuth, NSObject)
RCT_EXTERN_METHOD(getToken:(BOOL)forceRefresh resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(signIn:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(signOut:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isSignedIn:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end
