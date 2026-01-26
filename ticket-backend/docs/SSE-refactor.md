# SSE Notifications Refactor

Summary
- Improved `sseNotifications` in `app/Http/Controllers/NotificationController.php` to make the SSE endpoint robust, safer for long-running connections, and less likely to crash the backend.

What I changed
- Support `Last-Event-ID` header so clients can reconnect and resume from the last event id.
- Call `set_time_limit(0)` and `ignore_user_abort(true)` to allow long-running streaming without PHP timing out or stopping when user disconnects unexpectedly.
- Use `connection_aborted()` to detect client disconnects and exit the stream loop cleanly.
- Send a SSE comment heartbeat (`: heartbeat`) when there are no notifications to keep the connection alive and avoid proxies closing the stream.
- Send `id:` lines for each event so clients can reliably track the last event received.
- Add try/catch around the streaming loop to emit an `error` event (and break) instead of crashing on exceptions.
- Periodically call `DB::disconnect()` to release DB connections/resources and avoid exhausting worker pool.
- Increase sleep to 1 second between iterations to avoid tight CPU loops while keeping reasonable latency for new events.

Why this helps
- Avoids tying up PHP-FPM/worker processes without bounds (reduces risk of resource exhaustion).
- Heartbeats prevent connection timeouts by proxies/load-balancers.
- `Last-Event-ID` + `id:` support enables safer reconnection and de-duplication on the client side.
- Error handling avoids bubbling unhandled exceptions to the whole HTTP server process.

Notes and next steps
- For high scale or many concurrent clients, consider moving to a push system (Redis pub/sub, WebSocket server, or a dedicated SSE broadcaster) instead of per-request database polling.
- If you use a load balancer, ensure it supports long-lived HTTP connections and does not buffer or close idle streaming connections.
- You may further optimize by querying a dedicated notifications table by `notifiable_id`/`notifiable_type` with an index on `id` for faster checks.

Files changed
- `app/Http/Controllers/NotificationController.php` — refactored `sseNotifications`

Usage (client)
- When creating the EventSource on the client, pass the `Last-Event-ID` header automatically provided by the browser when reconnecting. Example JS:

```js
const source = new EventSource('/api/sse/notifications');
source.addEventListener('notification', (e) => {
  const payload = JSON.parse(e.data);
  console.log('notif', payload);
});

source.addEventListener('error', (e) => {
  console.error('SSE error', e);
});
```

If you want, I can implement a Redis-backed broadcaster next to push events from your notification creators into the stream without polling.
