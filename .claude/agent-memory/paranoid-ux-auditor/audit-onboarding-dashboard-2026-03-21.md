---
name: Audit Onboarding+Dashboard 2026-03-21
description: UX audit findings for LanguageScreen, PetInfoScreen, ScheduleScreen, VetContactScreen, NotificationsScreen, DashboardScreen
type: project
---

## Audit: Onboarding + Dashboard (2026-03-21)

### Critical (2)
1. **Dark mode invalid color** — DashboardScreen L266: `glucoseTimeSinceColor + '20'` produces invalid hex when color is 8-char (dark textTertiary `#EBEBF560`). Same in StatusCard L38 `${accentColor}15`.
2. **Dashboard heroLeft no flex constraint** — long pet name pushes SOS button off-screen. heroLeft has no `flex:1` or `flexShrink:1`.

### Medium (5)
3. **PetInfoScreen/VetContactScreen no KeyboardAvoidingView** — inputs hidden by keyboard on small screens.
4. **VetContactScreen hardcoded Russian placeholder** — "Др. Иванова" not localized via i18n.
5. **PetInfoScreen no maxLength on name** — allows unbounded input that breaks layouts app-wide.
6. **ScheduleScreen addTime silent MAX_TIMES return** — no user feedback when limit reached.
7. **ScheduleScreen addTime uses direct state, not functional update** — potential stale closure on rapid taps.

### Low (3)
8. **LanguageScreen uses translation for subtitle before language is set** — t('onboarding.selectLanguage') shows in last-used language, not selected.
9. **PetInfoScreen ScrollView no paddingBottom** — bottom content may be clipped.
10. **DashboardScreen StatusCard font sizes (9-11px)** — poor readability for exhausted users (3AM).
