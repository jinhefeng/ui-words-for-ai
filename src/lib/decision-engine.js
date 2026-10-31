export function getRecommendations(caseStudy, answers = {}) {
  const all = caseStudy.recommendations ?? [];
  const matching = all.filter((recommendation) => Object.entries(recommendation.when ?? {})
    .every(([questionId, optionId]) => answers[questionId] === optionId));
  return { recommendations: matching.length ? matching : all, resolved: matching.length > 0 };
}

export function getRelatedPatternIds(recommendation) {
  return [...new Set([
    recommendation.primaryPatternId,
    ...(recommendation.supportingPatternIds ?? []),
    ...(recommendation.alternativePatternIds ?? []),
  ])].filter(Boolean);
}
