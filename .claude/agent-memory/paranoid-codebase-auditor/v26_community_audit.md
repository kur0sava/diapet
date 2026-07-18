---
name: v26-community-audit
description: v2.6 chat/translation/retention audit findings (community feature ships enabled, Firestore-dependent)
metadata:
  type: project
---

# v2.6 audit (2026-07-18, tag v2.5.0=ce5216a base)

New subsystems: src/features/community/** (Firestore chat), src/shared/translation/**,
retention (achievementEngine/eventHintEngine/weeklySummary/weightRepository + migration v10).

**Why this matters:** ChatTab in MainNavigator ships UNCONDITIONALLY (line ~404, no gate — unlike
AiTab which is `showAiTab`-gated). So the community feature is live in v2.6 builds.

## Confirmed findings
- **HIGH — Firestore feature broken out-of-box**: listThreads (communityApi.ts:79) uses
  `where(roomId==)+orderBy(lastMessageAt)` → needs a COMPOSITE index. No firestore.indexes.json
  exists in repo. firestore.rules exists but "НЕ задеплоено" (its own header says so). ThreadListScreen
  useQuery has NO onError → any Firestore failure (missing index / rules deny / offline) is swallowed →
  rooms render as permanent empty "no threads" with no error. Same for getMyMessages.
- **HIGH/MED medical — weightRepository.delete nulls pets.weight_kg** when the LAST weight entry is
  deleted (WeightHistoryScreen lets you delete every entry, no guard). For DOGS this silently drops the
  weight-scaled insulin overdose warning (getInsulinThresholds falls back to flat absoluteMaxDose=20 for
  a 3kg dog whose real cap is 6 IU). Migration v10 seeds exactly ONE baseline entry, so deleting it is easy.
- **MED — CSV formula injection**: csvExport.ts esc() only quotes `",\n\r`; does NOT neutralize leading
  `= + - @` → notes/name become live formulas in Excel/Sheets (CSVs get shared with vets).
- **MED — double-tap dup writes**: ThreadScreen.onSend / NewThreadScreen.onPost use React state
  `sending`/`posting` guard, NOT a useRef (rest of codebase uses savingRef). 5s cooldown doesn't help —
  both taps pass checkRateLimit before recordSend runs. → duplicate message / duplicate thread+replace.
- **MED medical — moderation is warn-not-block for dose advice** + server AI moderator not deployed →
  "уколи 5 единиц" posts as `flagged` and is FULLY VISIBLE to everyone (MessageBubble shows flagged text
  with only a badge). Client moderation trivially bypassable.

## Verified SAFE (avoid re-flagging)
- moderation.ts DOSE_RE uses lookbehind `(?<![\p{L}])` + `\p{L}` unicode props. VERIFIED Hermes-compatible:
  compiled node_modules/react-native/sdks/hermesc/win64-bin/hermesc.exe -emit-binary → exit 0 (hermesc
  DOES validate regex at compile time; caught a deliberately-bad `(?<foo` control). RN 0.81 Hermes = OK.
- All community/weekly/weight i18n leaf keys present in BOTH ru.ts and en.ts. All 12 room keys present.
- All room icons exist in Icon ICON_MAP (trophy/heart/etc). Icon returns null (no crash) on unknown.
- Rooms entry is login-gated (CommunityRoomsScreen), mitigating empty-uid writes under normal flow.
- migration v10 idempotent (NOT EXISTS guard, randomblob id), wrapped in withTransactionAsync.

## LOW/deferred
- translationCacheKey (`xlt_<lang>_<hash>`) never evicted → unbounded MMKV growth over months.
- djb2 32-bit hashText → cache collision could show WRONG translation (low prob, bad consequence).
- refreshWeeklySummaryPush + scheduleGlucoseReminders lack the isRestoring-style re-entrancy guard →
  concurrent foreground events can double-schedule weekly/glucose pushes.
- MessageBubble/ThreadListScreen `new Date(createdAt).toISOString()` throws if ts ever missing (all
  current writes set createdAt:Date.now(), so low).
