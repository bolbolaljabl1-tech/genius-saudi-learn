Keep the first-visit splash state in localStorage at the main page entry, so navigation and refresh never replay it after the first arrival.
Keep official social follow links in the home page's bottom section rather than the fixed footer, so they remain prominent without obscuring navigation.
Persist locally completed activity counts at the existing student progress hook; keep the dashboard read-only and avoid extra network requests for immediate mobile loading.
Keep student access free at the main page entry; any future paid access must use one server-verified entitlement guard there so content gating cannot diverge across screens.
Use the shared AchievementCard for activity completion so student name, earned stars, total stars, and device sharing stay consistent.