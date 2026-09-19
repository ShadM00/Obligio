#import <React/RCTBridgeModule.h>
@interface RCT_EXTERN_MODULE(ObligioWatch, NSObject)
RCT_EXTERN_METHOD(updateSnapshot:(NSString *)json resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(pendingActions:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(reply:(NSString *)requestId error:(NSString *)error resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end
@interface RCT_EXTERN_MODULE(ObligioPreferences, NSObject)
RCT_EXTERN_METHOD(setLocale:(NSString *)locale)
@end
