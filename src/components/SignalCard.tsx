import type { TradingConfidence, TradingRecommendation, TradingSignal } from '@/lib/tradingSignals'
import styles from './SignalCard.module.css'

interface SignalCardProps {
  signal: TradingSignal
}

const RECOMMENDATION_LABEL: Record<TradingRecommendation, string> = {
  buy: '긍정',
  neutral: '중립',
  sell: '주의',
}

const CONFIDENCE_LABEL: Record<TradingConfidence, string> = {
  high: '확신도 높음',
  low: '확인 더 필요',
  medium: '확신도 보통',
}

export function SignalCard({ signal }: SignalCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.marketRow}>
            <span className={styles.market}>{signal.market}</span>
            <span className={styles.ticker}>{signal.ticker}</span>
          </div>
          <h2 className={styles.name}>{signal.companyName}</h2>
        </div>
        <div className={styles.scoreBlock}>
          <strong className={styles.scoreValue}>{signal.score}</strong>
          <span className={styles.scoreUnit}>점</span>
        </div>
      </div>

      <div className={styles.topline}>
        <span className={`${styles.badge} ${styles[`badge_${signal.recommendation}`]}`}>
          {signal.label}
        </span>
        <span className={styles.badgeGhost}>
          {RECOMMENDATION_LABEL[signal.recommendation]} · {CONFIDENCE_LABEL[signal.confidence]}
        </span>
      </div>

      <p className={styles.headline}>{signal.summary}</p>
      <p className={styles.confidenceText}>{signal.confidenceSummary}</p>

      <div className={styles.metricList}>
        {signal.metrics.map(metric => (
          <section key={metric.key} className={styles.metric}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>{metric.label}</span>
              <span className={`${styles.metricSignal} ${styles[`metricSignal_${metric.signal}`]}`}>
                {metric.status}
              </span>
            </div>
            <p className={styles.metricSummary}>{metric.summary}</p>
            <p className={styles.metricMeta}>
              {metric.value} · 점수 기여 {metric.contribution >= 0 ? '+' : ''}{metric.contribution.toFixed(2)}
            </p>
          </section>
        ))}
      </div>

      <details className={styles.expertPanel}>
        <summary className={styles.expertToggle}>전문 지표 이름·수치 보기</summary>
        <div className={styles.expertList}>
          {signal.expertDetails.filter(detail => detail.contribution !== null).map(detail => (
            <section key={detail.key} className={styles.expertMetric}>
              <div className={styles.expertTop}>
                <span className={styles.expertLabel}>{detail.title}</span>
                <span className={styles.expertValue}>{detail.value}</span>
              </div>
              <p className={styles.expertStatus}>
                {detail.status}
                {detail.contribution ? ` · 점수 기여 ${detail.contribution}` : ''}
              </p>
              <p className={styles.expertDescription}>{detail.description}</p>
            </section>
          ))}

          {signal.referenceMetrics.length > 0 && (
            <div className={styles.referenceBlock}>
              <p className={styles.referenceTitle}>참고 지표</p>
              {signal.referenceMetrics.map(metric => (
                <section key={metric.key} className={styles.referenceMetric}>
                  <div className={styles.expertTop}>
                    <span className={styles.expertLabel}>{metric.label}</span>
                    <span className={styles.expertValue}>{metric.value}</span>
                  </div>
                  <p className={styles.expertStatus}>{metric.status}</p>
                  <p className={styles.expertDescription}>{metric.description}</p>
                </section>
              ))}
            </div>
          )}
        </div>
      </details>
    </article>
  )
}
