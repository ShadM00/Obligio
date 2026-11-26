//
//  NotificationService.swift
//  KrontelliNSE, added by @krontelli/sdk-react-native-bare's add-nse.rb.
//
//  Runs for every APNs push with `mutable-content: 1` (the Krontelli API sets it on every alert push).
//  Two jobs, both inside the ~30 s budget iOS gives an extension (we stop at 20 s):
//    1. POST {delivery_id, kind: "received", token} to <apiBaseUrl>/v1/receipts. The token is the
//       per-delivery receipt token carried in the payload (`kt.r`), so the extension needs no
//       Keychain access and cannot act on anything but this one delivery's receipt.
//    2. Download `image_url` (if present) and attach it so the notification shows rich media.
//
//  Payload shape (APNs root): { aps: {...}, kt: { d: "<delivery_id>", r: "<receipt_token>" },
//                               deep_link?: "...", image_url?: "..." }
//
import UserNotifications
import UniformTypeIdentifiers

final class NotificationService: UNNotificationServiceExtension {

    // Replaced at prebuild time by the config plugin.
    private static let apiBaseUrl = "https://api.krontelli.com"
    private static let budget: TimeInterval = 20

    private var contentHandler: ((UNNotificationContent) -> Void)?
    private var bestAttempt: UNMutableNotificationContent?
    private var budgetTimer: DispatchWorkItem?
    private let session: URLSession = {
        let cfg = URLSessionConfiguration.ephemeral
        cfg.timeoutIntervalForRequest = 15
        cfg.timeoutIntervalForResource = 18
        cfg.waitsForConnectivity = false
        return URLSession(configuration: cfg)
    }()

    override func didReceive(_ request: UNNotificationRequest,
                             withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.contentHandler = contentHandler
        let content = (request.content.mutableCopy() as? UNMutableNotificationContent) ?? UNMutableNotificationContent()
        self.bestAttempt = content

        // Hard stop before iOS kills us: deliver whatever we have.
        let timer = DispatchWorkItem { [weak self] in self?.finish() }
        budgetTimer = timer
        DispatchQueue.global().asyncAfter(deadline: .now() + Self.budget, execute: timer)

        let userInfo = request.content.userInfo
        let group = DispatchGroup()

        if let kt = userInfo["kt"] as? [String: Any],
           let deliveryId = kt["d"] as? String,
           let token = kt["r"] as? String {
            group.enter()
            postReceipt(deliveryId: deliveryId, token: token) { group.leave() }
        }

        if let urlString = userInfo["image_url"] as? String, let url = URL(string: urlString) {
            group.enter()
            downloadAttachment(from: url) { [weak self] attachment in
                if let attachment = attachment { self?.bestAttempt?.attachments = [attachment] }
                group.leave()
            }
        }

        group.notify(queue: .main) { [weak self] in self?.finish() }
    }

    override func serviceExtensionTimeWillExpire() {
        // iOS is about to terminate the extension: deliver the best attempt immediately.
        finish()
    }

    private func finish() {
        budgetTimer?.cancel()
        budgetTimer = nil
        guard let handler = contentHandler, let content = bestAttempt else { return }
        contentHandler = nil
        handler(content)
    }

    // MARK: - Receipt

    private func postReceipt(deliveryId: String, token: String, completion: @escaping () -> Void) {
        guard let url = URL(string: Self.apiBaseUrl + "/v1/receipts") else { completion(); return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        req.setValue("KrontelliNSE/1", forHTTPHeaderField: "X-Krontelli-SDK")
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let body: [String: Any] = [
            "delivery_id": deliveryId,
            "kind": "received",
            "token": token,
            "at": iso.string(from: Date()),
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        // Fire once; the endpoint is idempotent and the app records `received` again if it is
        // foregrounded, so a lost receipt here only lowers coverage, never correctness.
        session.dataTask(with: req) { _, _, _ in completion() }.resume()
    }

    // MARK: - Rich media

    private func downloadAttachment(from url: URL, completion: @escaping (UNNotificationAttachment?) -> Void) {
        session.downloadTask(with: url) { tempURL, response, _ in
            guard let tempURL = tempURL else { completion(nil); return }
            let ext = Self.fileExtension(for: response, url: url)
            let dest = FileManager.default.temporaryDirectory
                .appendingPathComponent(UUID().uuidString)
                .appendingPathExtension(ext)
            do {
                try FileManager.default.moveItem(at: tempURL, to: dest)
                let attachment = try UNNotificationAttachment(identifier: "krontelli-image", url: dest, options: nil)
                completion(attachment)
            } catch {
                completion(nil)
            }
        }.resume()
    }

    private static func fileExtension(for response: URLResponse?, url: URL) -> String {
        if let mime = response?.mimeType,
           let type = UTType(mimeType: mime),
           let ext = type.preferredFilenameExtension {
            return ext
        }
        let fromURL = url.pathExtension
        return fromURL.isEmpty ? "jpg" : fromURL
    }
}
