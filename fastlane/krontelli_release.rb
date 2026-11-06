# Krontelli release reports for fastlane (canonical copy: Krontelli repo, packages/fastlane/krontelli_release.rb).
#
# Tells Krontelli what a release lane did with a build, so each app's Releases page shows its store track and
# rollout next to the build's crashes. Copy this file into the app's fastlane folder, `require_relative` it from the
# Fastfile, and call it after each upload:
#
#   KrontelliRelease.report(app_id: KRONTELLI_APP_ID, platform: "android", version: "1.2.13", build: "241",
#                           track: "production", rollout: 0.1, source: "android production")
#   KrontelliRelease.report(app_id: KRONTELLI_APP_ID, platform: "ios", version: "1.2.13", build: "167",
#                           track: "app_store", status: "in_review", source: "ios submit")
#
# `rollout` is a fraction, as supply takes it (0.1 is 10%). With no `status`, it's worked out: a Play production
# upload with a rollout below 1 is rolling_out, a full one released, and anything else uploaded.
#
# The key is a Krontelli server key scoped to `releases` (it can report builds and nothing else), read from
# KRONTELLI_RELEASE_KEY or ~/.config/krontelli/release-keys/<app id>. Never fails a lane: a missing key or a failed
# call prints a warning and returns false.
require "json"
require "net/http"
require "uri"

module KrontelliRelease
  STATUSES = %w[uploaded in_review rolling_out released halted].freeze

  def self.report(app_id:, platform:, version:, track:, build: nil, status: nil, rollout: nil, source: nil)
    key = ENV["KRONTELLI_RELEASE_KEY"].to_s.strip
    path = File.expand_path("~/.config/krontelli/release-keys/#{app_id}")
    key = File.read(path).strip if key.empty? && File.exist?(path)
    return warn_lane("no release key (set KRONTELLI_RELEASE_KEY or #{path}); this build won't show its store track") if key.empty?

    fraction = rollout.nil? || rollout.to_s.strip.empty? ? nil : rollout.to_f
    status ||= infer_status(track.to_s, fraction)
    return warn_lane("unknown status #{status}") unless STATUSES.include?(status)

    body = { platform: platform, version: version.to_s, build: build&.to_s, track: track.to_s, status: status, source: source }
    body[:rollout_pct] = (fraction * 100).round(2) if fraction && fraction.positive? && fraction <= 1
    uri = URI.join(ENV.fetch("KRONTELLI_URL", "https://api.krontelli.com"), "/v1/server/releases")
    res = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https", open_timeout: 10, read_timeout: 10) do |http|
      req = Net::HTTP::Post.new(uri, "content-type" => "application/json", "authorization" => "Bearer #{key}")
      req.body = JSON.generate(body.compact)
      http.request(req)
    end
    return warn_lane("Krontelli answered #{res.code}: #{res.body.to_s[0, 300]}") unless res.is_a?(Net::HTTPSuccess)

    say("Krontelli: #{platform} #{version}#{build ? " (#{build})" : ""} reported on #{track} as #{status}#{body[:rollout_pct] ? " at #{body[:rollout_pct]}%" : ""}")
    true
  rescue StandardError => e
    warn_lane("#{e.class}: #{e.message}")
  end

  def self.infer_status(track, fraction)
    return "uploaded" unless track.downcase == "production"
    fraction && fraction < 1 ? "rolling_out" : "released"
  end

  def self.warn_lane(message)
    text = "Krontelli release report skipped: #{message}"
    defined?(FastlaneCore::UI) ? FastlaneCore::UI.important(text) : warn(text)
    false
  end

  def self.say(message)
    defined?(FastlaneCore::UI) ? FastlaneCore::UI.message(message) : puts(message)
  end
end
