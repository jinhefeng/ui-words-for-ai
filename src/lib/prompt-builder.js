export function buildPrompt(caseStudy, recommendation, pattern) {
  return [
    `我想让用户完成这件事：${caseStudy.goal}`,
    `使用场景：${caseStudy.context}`,
    `界面做法：${pattern.localName}`,
    `大概长这样：${pattern.summary}`,
    `选择它的原因：${recommendation.reason}`,
    `请按这个交互细节实现：${pattern.promptExample}`,
    `需要留意：${pattern.avoidWhen}`,
  ].join("\n");
}
