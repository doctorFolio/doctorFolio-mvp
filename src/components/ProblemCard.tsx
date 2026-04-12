// src/components/ProblemCard.tsx
import type { Problem } from '@/lib/types'
import styles from './ProblemCard.module.css'

interface Props {
  problem: Problem
  index: number
}

function getProblemMeta(problem: Problem): { category: string; targetLabel: string } {
  switch (problem.type) {
    case 'drift':
      return { category: '자산 배분', targetLabel: '목표' }
    case 'concentration_stock':
      return { category: '단일 종목', targetLabel: '기준선' }
    case 'concentration_sector':
      return { category: '섹터 집중', targetLabel: '기준선' }
  }
}

export function ProblemCard({ problem, index }: Props) {
  const num = String(index + 1).padStart(2, '0')
  const isRed = problem.severity === 'high'
  const meta = getProblemMeta(problem)

  return (
    <article
      className={`${styles.card} ${isRed ? styles.red : styles.amber}`}
      role="article"
      aria-label={`진단 항목 ${index + 1}`}
    >
      <div className={styles.num}>{num} · {meta.category}</div>
      <div className={styles.title}>{problem.label}</div>
      <div className={styles.numbers}>
        <span className={`${styles.current} ${isRed ? styles.currentRed : styles.currentAmber}`}>
          {problem.current}%
        </span>
        {problem.type === 'drift' ? (
          <>
            <span className={styles.arrow}>→</span>
            <span className={styles.target}>{problem.target}%</span>
            <span className={styles.targetNote}>{meta.targetLabel}</span>
          </>
        ) : (
          <span className={styles.threshold}>{meta.targetLabel} {problem.target}%</span>
        )}
      </div>
      <p className={styles.desc}>{problem.description}</p>
    </article>
  )
}
