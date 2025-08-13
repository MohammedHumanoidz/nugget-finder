import posthog from "posthog-js"

if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV !== "development" &&
  process.env.NODE_ENV !== "test" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: '2025-05-24',
    capture_exceptions: true,
    debug: false,
  })
}
