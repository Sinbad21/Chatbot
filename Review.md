diff --git a/review_findings.txt b/review_findings.txt
new file mode 100644
index 0000000000000000000000000000000000000000..82b954770d18a84157bfd3c48cd170471544313a
--- /dev/null
+++ b/review_findings.txt
@@ -0,0 +1,55 @@
+Code Review and Landing Page Findings
+====================================
+
+1. Bot mutations lack authorization scoping
+   - Observed in `BotController` where write operations (update, delete, publish, intent/FAQ writers) filter only by bot `id`.
+   - Risk: Any authenticated user can modify or delete another user’s bot by guessing its UUID.
+   - Recommended fix: Constrain every write query by both bot ID and the current user/organization, returning 404/403 on mismatch.
+
+2. Conversation routes leak other tenants’ data
+   - `GET /api/v1/conversations/:id` and `DELETE /api/v1/conversations/:id` look up records solely by primary key.
+   - Risk: Users can read or delete conversations that belong to another bot.
+   - Recommended fix: Join through the bot owner and apply ownership checks before returning or deleting data.
+
+3. Notification read endpoint lacks user scoping
+   - `PUT /api/v1/notifications/:id/read` updates notifications by id only.
+   - Risk: Users can mark notifications they do not own as read.
+   - Recommended fix: Include `userId: req.user!.userId` in the `where` clause so only owners can update their notifications.
+
+4. Public chat endpoint skips validation results
+   - Public chat route uses `express-validator` checks but never calls `validationResult`.
+   - Risk: Invalid input (empty `botId` or `message`) triggers Prisma queries with `undefined`, causing 500 errors instead of clean 400 responses.
+   - Recommended fix: Add validation result middleware to short-circuit with a 400 error on invalid input.
+
+5. Refresh-token rotation is ineffective
+   - Refresh tokens set `tokenId` to the user ID, so every token shares the same identifier.
+   - Risk: Individual sessions cannot be revoked; copied tokens remain valid until expiry.
+   - Recommended fix: Generate a unique token ID per issuance, persist it (ideally hashed), and tie JWT verification to that ID for proper revocation.
+
+Landing Page Translation and Navigation Issues
+----------------------------------------------
+
+1. Limited translation support in `useLandingTranslation`
+   - The hook imports only English and Italian resources despite the repository containing translations for ~20 languages.
+   - Impact: Language switcher cannot surface the additional locales; users are restricted to two options.
+   - Recommendation: Load the full set of available locale resources and expose them through the hook.
+
+2. Global language state leaks between tabs
+   - `useLandingTranslation` stores language selection in a module-level singleton shared across component instances.
+   - Impact: Different tabs in the same browser session cannot display different languages simultaneously.
+   - Recommendation: Scope the language state per component or per request (e.g., via context or React state).
+
+3. Metadata remains in English regardless of selected language
+   - Landing layout exports static English metadata, and runtime effects only update `document.title`.
+   - Impact: Server-rendered meta tags (including description) stay in English, so crawlers and the first paint ignore translations.
+   - Recommendation: Generate locale-aware metadata on the server so translated content is available to crawlers and initial render.
+
+4. Footer links point to non-existent routes
+   - Footer references `/about`, `/blog`, `/contact`, and `/legal/gdpr`, none of which exist under `apps/web/src/app`.
+   - Impact: Users encounter 404 errors when following these links; only privacy and terms pages are implemented.
+   - Recommendation: Add the missing pages or update the footer to link to existing routes.
+
+5. Internal link rooting is consistent
+   - Navbar logo, section anchors, and auth CTAs use absolute paths rooted at `/`.
+   - Impact: No inconsistent relative URLs were found.
+   - Recommendation: Maintain current absolute routing approach.
