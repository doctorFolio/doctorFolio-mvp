// src/app/api/explain/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { DiagnosisResult } from '@/lib/types'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const diagnosis: DiagnosisResult = await req.json()

  const problemSummary = diagnosis.problems
    .map(p => `- ${p.label}: 현재 ${p.current}%, 목표 ${p.target}%`)
    .join('\n')

  const actionSummary = diagnosis.actions
    .map(a => `- ${a.name} ${a.action === 'sell' ? '매도' : '매수'} ${a.quantity}주 (약 ${a.estimatedAmount.toLocaleString()}원)`)
    .join('\n')

  const prompt = `다음은 포트폴리오 진단 결과입니다.

문제:
${problemSummary}

권장 조치:
${actionSummary}

이 진단 결과를 한국어로 3문장 이내로 설명해줘.
규칙:
- 숫자를 반드시 사용할 것
- 금융 전문용어 사용하지 말 것 (예: "드리프트", "변동성" 대신 쉬운 표현)
- "~할 수 있습니다" 금지, 직접적으로 설명
- 마지막 문장은 "실행 여부와 시점은 본인이 결정하세요."로 끝낼 것`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ explanation: text })
}
