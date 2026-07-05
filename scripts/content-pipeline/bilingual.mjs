/**
 * Bilingual markdown helpers — English + Telugu in one body (full bilingual posts).
 */

export function bilingualSection(titleEn, bodyEn, titleTe, bodyTe) {
  return `## ${titleEn}\n\n${bodyEn.trim()}\n\n## ${titleTe}\n\n${bodyTe.trim()}\n\n`;
}

export function bilingualBody(sections) {
  return sections
    .map(({ enTitle, en, teTitle, te }) => bilingualSection(enTitle, en, teTitle ?? `తెలుగు — ${enTitle}`, te))
    .join("");
}

export function wrapProcedureBody(stepsEn, stepsTe, extraEn = "", extraTe = "") {
  const stepsEnMd = stepsEn.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const stepsTeMd = stepsTe.map((s, i) => `${i + 1}. ${s}`).join("\n");
  return (
    bilingualBody([
      { enTitle: "Overview", en: extraEn || "Step-by-step workflow for AP ministerial and DDO staff.", te: extraTe || "AP మినిస్టీరియల్ మరియు DDO సిబ్బందికి దశలవారీ విధానం." },
      { enTitle: "Steps", en: stepsEnMd, te: stepsTeMd },
    ]) +
    `\n> **Disclaimer:** Original OfficeMitra guide. Verify current GO on [GOIR](https://goir.ap.gov.in/) before official action.\n`
  );
}

export function wrapDocumentExplanation(subjectEn, subjectTe, pointsEn, pointsTe) {
  return bilingualBody([
    { enTitle: "What this document covers", en: subjectEn, te: subjectTe },
    { enTitle: "Key points for office staff", en: pointsEn.map((p) => `- ${p}`).join("\n"), te: pointsTe.map((p) => `- ${p}`).join("\n") },
    { enTitle: "How to use in your office", en: "1. Download or open the official GO from GOIR\n2. Compare with this summary\n3. Brief Head of Office if action required\n4. File authenticated copy in subject file\n5. Update registers and pay bills if applicable", te: "1. GOIR నుండి అధికారిక GO డౌన్‌లోడ్ చేయండి\n2. ఈ సారాంశంతో పోల్చండి\n3. అవసరమైతే Head of Office కు బ్రీఫ్ చేయండి\n4. Subject file లో నకలు file చేయండి\n5. అవసరమైతే registers మరియు pay bills update చేయండి" },
  ]);
}
