export function buildPrompt(caseStudy, recommendation, pattern) {
  return [
    `用户目标：${caseStudy.goal}`,
    `使用场景：${caseStudy.context}`,
    `交互模式：${pattern.term}（${pattern.localName}）`,
    `推荐原因：${recommendation.reason}`,
    `实现要求：${pattern.promptExample}`,
  ].join("\n");
}
