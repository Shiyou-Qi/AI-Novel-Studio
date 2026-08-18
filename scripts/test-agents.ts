
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SAMPLE_CHAPTER = `新京市，深夜。Phase1系统的中央控制室内，林澈正盯着屏幕上的数据流。突然，系统发出一级警报，预测一名叫林小雨的大学生将在三天后实施暴力犯罪。林澈震惊地发现那是自己的妹妹。他试图调取详细数据，却发现权限被限制。他决定亲自调查，但系统似乎有意阻碍。林澈前往妹妹的公寓，却发现她已被强制隔离。林澈愤怒地质问上级，却被告知系统从不出错。林澈心中埋下怀疑的种子。

深夜，林澈独自坐在办公室里，思考着这一切的意义。他明白，作为系统的设计者之一，自己有责任查明真相。窗外的城市灯火通明，象征着秩序与安宁，但此刻在林澈眼中却显得格外讽刺。

他决定明天开始正式调查这件事，弄清楚系统究竟出了什么问题。`;

async function main() {
  const { generateValidatedJson } = await import('../lib/ai/generate-json');
  const { HookDoctorOutputSchema, ContinuityCheckOutputSchema, QualityScoreSchema } = await import('../lib/ai/schemas');
  const { buildHookDoctorPrompt } = await import('../lib/ai/prompts/hook-doctor');
  const { buildContinuityCheckPrompt } = await import('../lib/ai/prompts/continuity-check');
  const { buildQualityCriticPrompt } = await import('../lib/ai/prompts/quality-critic');

  console.log('=== Hook Doctor (expect needsRewrite=true, this ending is a flat wrap-up) ===');
  const hookResult = await generateValidatedJson({
    schema: HookDoctorOutputSchema,
    system: buildHookDoctorPrompt(),
    prompt: `【小说类型】mystery\n【本章大纲】主角发现妹妹被系统标记\n\n【本章正文】\n${SAMPLE_CHAPTER}\n\n请判断并按要求返回 JSON。`,
    temperature: 0.7,
  });
  console.log(JSON.stringify(hookResult, null, 2));

  console.log('\n=== Continuity Check ===');
  const continuityResult = await generateValidatedJson({
    schema: ContinuityCheckOutputSchema,
    system: buildContinuityCheckPrompt({
      storyBible: { worldFacts: ['Phase1系统是新京市的AI犯罪预测系统'] },
      characterStates: [{ characterId: 'x', name: '林澈', currentState: '系统工程师，刚发现妹妹被标记' }],
      openThreads: [{ id: 'thread-1', title: '妹妹的清白', description: '林小雨被系统标记为潜在罪犯，需要证明清白' }],
    }),
    prompt: `【第 1 章正文】\n${SAMPLE_CHAPTER}\n\n请按要求返回 JSON。`,
    temperature: 0.5,
  });
  console.log(JSON.stringify(continuityResult, null, 2));
  const threadIdValid = continuityResult.threadUpdates.every(u => u.threadId === 'thread-1');
  console.log('All threadIds match a real handed-in ID:', threadIdValid);

  console.log('\n=== Quality Critic ===');
  const qualityResult = await generateValidatedJson({
    schema: QualityScoreSchema,
    system: buildQualityCriticPrompt({ genre: 'mystery', beatType: 'setup', isGoldenChapter: true }),
    prompt: `【本章正文】\n${SAMPLE_CHAPTER}\n\n请按要求返回 JSON 评分。`,
    temperature: 0.4,
  });
  console.log(JSON.stringify(qualityResult, null, 2));
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
