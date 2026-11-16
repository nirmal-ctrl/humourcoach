# Humour Coaching App: Build Plan (v1)

This build plan outlines **v1** of the app.
- **Target Audience:** Early-career professionals.
- **Skill Focus:** Humour as a core skill.
- **Emotional Promise:** Building confidence and ease.
- **Learning Model:** A short diagnostic creates a personalized path through a curated lesson and drill library.

---

## 1. Start Today: Accounts & The Testing Clock
> *Google Play requires new personal developer accounts (created after November 13, 2023) to run a closed test with at least 12 testers for 14 continuous days before applying for production access. The earlier it starts, the sooner you can launch.*

*   [ ] **Developer Accounts:** Create or check Apple Developer and Google Play accounts (and verify if Play needs an organization account).
*   [ ] **Backend & Tools:** Set up a Supabase or Firebase project, acquire an AI API key, and configure a RevenueCat account.
*   [ ] **Tester Recruitment:** Build a target list of 12+ individuals (friends, colleagues, online communities) who commit to testing for two weeks.

---

## 2. Technical Architecture
*   **Mobile App:** React Native with Expo (TypeScript) – single codebase for iOS and Android.
*   **Backend:** Supabase (Auth, Postgres database, and Edge Functions).
*   **AI Integration:** Triggered exclusively via Supabase Edge Functions (never called directly from the client app for security and key protection).
    *   *Critiques:* Fast, cost-efficient model.
    *   *Weekly Summaries:* More advanced/stronger model.
*   **Payments:** RevenueCat integration.
*   **Observability & Analytics:** PostHog and Sentry.
*   **Core Database Tables:**
    *   `users` (profiles, goals)
    *   `screening_responses` (goals, preferred situations, comfort level, style preferences, and boundaries)
    *   `learning_profiles` (current skill estimates, recommended focus areas, and preferred practice contexts)
    *   `course_assignments` (the ordered lessons and drills selected for each user)
    *   `techniques` (humour concepts)
    *   `lessons` (short reading/instructional content)
    *   `drills` (practice prompts)
    *   `attempts` (user's text, AI critique feedback, scores)
    *   `streaks` (daily usage tracking)
    *   `ease_checkins` (pre- and post-session subjective confidence self-ratings)

---

## 3. The AI Feedback System
The AI critique engine is the core differentiator of the app. It must be carefully prompt-engineered and guardrailed.

### Personalized Learning System
V1 will not ask AI to generate an entire course from scratch. Lessons and drills will be written, reviewed, and stored in a curated content library. The app will personalize the order, difficulty, and workplace context of that content.

#### Short Screening and Diagnostic
Onboarding should take no more than 3 to 4 minutes and collect:
*   **Goals:** Workplace conversations, presentations, messaging, networking, or general confidence.
*   **Current Ease:** The user's self-rated comfort with using humour.
*   **Style Preferences:** Dry, observational, playful, storytelling, or unsure.
*   **Practice Contexts:** Stand-ups, presentations, Slack messages, networking, or informal conversation.
*   **Boundaries:** Topics or situations the user prefers to avoid.
*   **Mini Diagnostic:** Two or three short practice prompts used to establish a baseline.

#### Initial Course Assignment
The first personalized path will be assembled with transparent rules rather than a separate AI-generated curriculum:
*   Low confidence starts with easier, lower-risk exercises.
*   Long or unclear responses prioritize brevity and setup.
*   Predictable responses prioritize misdirection and surprise.
*   Presentation goals prioritize storytelling and callbacks.
*   Messaging goals prioritize concise exaggeration and Rule of Three drills.

The user will see a short explanation of the recommendation, including their primary focus, starting technique, preferred practice context, and suggested pace.

#### Ongoing Adaptation
After every 3 to 5 attempts, update the learning profile using completed drills, critique ratings, ease check-ins, and user feedback. The next lesson should come from the curated library and address the user's weakest relevant skill without repeatedly serving the same technique or context.

The core learning loop is:

`Screening -> Personalized starting path -> Practice -> AI feedback -> Updated skill profile -> Next best lesson`

### Structured Output Format (JSON)
The edge function will return a strictly parsed JSON response:
*   `technique_detected`: The category or approach identified in the user's attempt.
*   `what_worked`: Specific, encouraging details on what was successful.
*   `what_to_fix`: Constructive pointers for improvement.
*   `rewrite_example`: One revised example of the user's text demonstrating the technique.
*   `ratings`: A 1–5 score for three categories:
    *   **Setup**
    *   **Surprise**
    *   **Brevity**

### Feedback Principles
*   **Craft Over Humor:** Focus feedback on the mechanics/craft of humor rather than a subjective "how funny" rating.
*   **Tone:** Keep critiques specific, actionable, and encouragingly kind.
*   **Safety Guardrails:** Implement strong system prompt rules or moderation API checks to block/redirect hateful, harassing, or sexually explicit content.
*   **Cost Control:** Set daily per-user attempt limits and an absolute monthly API cost ceiling.
*   **Regression Testing:** Maintain a static test set of **40 to 50 sample jokes** (good attempts, bad attempts, offensive inputs, blank strings, gibberish) to run and review whenever the AI prompt is adjusted.

---

## 4. Day-by-Day Build

### 5-Day Implementation Schedule

| Day | Focus Area | "Done When" Criteria |
| :--- | :--- | :--- |
| **Day 1** | Project setup, authentication, basic navigation, screening flow, and database schema | A user can sign up, complete the short screening and diagnostic, and receive an initial learning profile. |
| **Day 2** | Course assignment rules, technique lessons, drill screens, and the core critique loop | A user receives an explained personalized path, completes its first lesson, submits an attempt, and views the AI critique. |
| **Day 3** | Learning-profile updates, next-lesson selection, ease check-ins, streaks, and paywall | The course adapts after practice, while free and premium entitlements work end-to-end. |
| **Day 4** | Prompt tuning, error handling, rate limiting, safety checks, accessibility | The joke validation test suite runs cleanly, and no app screens crash on unexpected input. |
| **Day 5** | App store metadata, privacy policy, in-app account deletion, TestFlight & Play closed testing | Selected testers can download and open the app via TestFlight or Google Play Console. |

### Parallel Content Strategy
*   **Curated V1 Library:** Start with 15 to 20 reviewed drills across the most useful techniques. Expand only after observing where testers need more practice.
*   **Core Techniques:**
    1. *Misdirection*
    2. *Rule of Three*
    3. *Callbacks*
    4. *Exaggeration*
*   **Initial Tracks:** Provide three starting paths, such as confident conversations, concise workplace messaging, and presentations/storytelling.
*   **Drills:** Tag each drill by technique, difficulty, skill target, and workplace context so it can be reused across personalized paths.
*   **Lessons:** Brief learning segments containing exactly two examples each.
*   **Content Control:** AI may critique and recommend from the library, but it will not invent unreviewed course material in v1.

---

## 5. Weeks 2 to 3: Test and Launch
*   **Closed Testing:** Begin the 14-day testing period. Monitor key funnels (from install to first completed drill, to day-3 retention).
*   **Personalization Review:** Check whether screening results lead to visibly different, relevant starting paths and whether users understand why each path was recommended.
*   **Tester Interviews:** Conduct 5 to 8 focused interviews highlighting irrelevant course recommendations and generic or unhelpful AI feedback.
*   **Weekly Iterations:** Squash bugs and tune prompt heuristics weekly.
*   **Production Release:** Apply for Google Play production access after 14 continuous days, and submit to the Apple App Store for review.
*   **Price Testing:** Experiment early with two price tiers (e.g., a low-cost weekly subscription vs. a discounted annual plan).

---

## 6. Post-Launch Roadmap
1.  **v1.5: Reply Lab** — Let users paste or share external messages and get labeled, context-appropriate reply ideas.
2.  **v1.5: Deeper Adaptation** — Add richer skill estimates, more curated tracks, and controlled AI assistance for proposing course variations that are reviewed before publication.
3.  **v2: Voice Drills & Community** — Audio-based exercises, peer rating/sharing, and new custom coaching tracks.
4.  **Android Bubble Feature:** Explore a persistent Android bubble overlay *only* if requested by users and compliant with Google Play accessibility policies.

---

## 7. Metrics & Analytics
Track these metrics using PostHog:
*   **Retention:** Day 1, Day 7, and Day 30 retention rates.
*   **Onboarding:** Screening completion rate and time to first personalized recommendation.
*   **Personalization:** Percentage of users who accept the recommended path and rate it as relevant.
*   **Engagement:** Average number of drills completed per user, per week.
*   **Efficacy:** Pre- vs. post-program changes in self-rated confidence ("ease") over a 2-week period.
*   **AI Quality:** Thumbs Up / Thumbs Down ratios on individual AI critiques.
*   **Business health:** Free-to-paid conversion percentage and AI API cost per active user.

---

## 8. Risks and Mitigations

| Risk | Mitigation |
| :--- | :--- |
| **Screening abandonment** | Keep onboarding under 4 minutes, show progress, and allow users to revise preferences later. |
| **Poor personalization** | Use explainable assignment rules, record why each item was recommended, and let users change their goal or skip a recommendation. |
| **Course inconsistency** | Select only from a reviewed content library in v1 instead of generating complete courses dynamically. |
| **Generic AI feedback** | Utilize the regression test set, include thumbs-up/down voting, and review the poorest-performing critiques weekly. |
| **Low user retention** | Keep interactive sessions under 5 minutes, implement helpful push notifications, and make streak recovery forgiving. |
| **Cost overruns** | Prioritize lightweight models for standard critiques and implement strict server-side request/cost caps. |
| **App store policy rejection** | Prepare a compliant privacy policy, include an obvious in-app account deletion button, and strictly avoid making clinical/therapeutic claims. |

