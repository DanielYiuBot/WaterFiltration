/* ============================================================
   Google Form auto-submit configuration (ClearWater Lab V2)

   HOW TO CONNECT YOUR FORM (short version):

   1) Create a Google Form with at least one question:
      - Type: Paragraph (長篇答案)
      - Title example: 「實驗資料 JSON」or "Experiment payload (JSON)"
      → JSON matches getFlatData() but omits codeAttempts, codeUnlocked, codeUnlockedAt.

   2) Get the form response URL:
      - Menu ⋮ → Get pre-filled link (取得預先填入的連結).
      - Add any dummy answer → Get link.
      - The link looks like:
        https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.XXXXX=...
      - Your POST URL is:
        https://docs.google.com/forms/d/e/FORM_ID/formResponse

   3) Find entry IDs for each question:
      - Open the form in browser → View page source (or inspect the live form).
      - Search for `name="entry.` — the number after `entry.` is the ID.
      - Put that ID in `entries` below (with or without the `entry.` prefix).

   Optional: add separate Short answer questions for participantId, language, etc.
   Add matching keys from the form payload (getFlatData minus code-lock fields above).

   Leave actionUrl empty to disable auto-submit (local / dev).
   ============================================================ */

window.CLEARWATER_GOOGLE_FORM = {
  actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSe_408pAfA1QgpYI1SiUxguQ2vpw1vJiGgEq_a0rlAfuAZgUw/formResponse',
  /**
   * Map logical field names to Google entry IDs.
   * - `payload`: JSON blob (flattened metrics; omits codeAttempts, codeUnlocked, codeUnlockedAt).
   * - Other keys: must match a property name in that JSON (e.g. participantId).
   */
  entries: {
    payload: '1199600465',
    participantId: '88538505',
    language: '316121475',
    sessionStartTime: '727713345',
    sessionEndTime: '844807190',
    sessionDurationSec: '120874503',
    task1Completed: '590154190',
    task1CompletedAt: '1952570761',
    task1RankingAttempts: '423536609',
    task1Hints: '731222476',
    task1CorrectOrder: '1626329670',
    task1DemoRuns: '782118273',
    task2Attempts: '62483814',
    task2BestScore: '1242513564',
    task2Completed: '578236834',
    task2CompletedAt: '513954883',
    task2Details: '545852020',
    chatLogCount: '1057388862',
    chatLogs: '2105305399',
  },
};
