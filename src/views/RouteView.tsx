import { CheckCircle2, CircleAlert, CircleHelp, CircleSlash, RotateCcw } from 'lucide-react'
import { LegalReference } from '../components/LegalReference'
import {
  DIAGNOSTIC_QUESTIONS,
  DIAGNOSTIC_STATUS_LABELS,
  findTemplate,
  OBLIGATION_KIND_HELP,
  OBLIGATION_KIND_LABELS,
  PLATFORM_DISCLAIMER,
  type DiagnosticStatus,
  type SiteViewId,
} from '../data/platformContent'
import { assetUrl } from '../lib/assets'
import { statusForAnswer, type DiagnosticAnswers } from '../lib/diagnostic'

const STATUS_ICON: Record<DiagnosticStatus, typeof CheckCircle2> = {
  cumple: CheckCircle2,
  pendiente: CircleAlert,
  'no-aplica': CircleSlash,
  verificar: CircleHelp,
}

interface RouteViewProps {
  answers: DiagnosticAnswers
  onAnswer: (questionId: string, value: string) => void
  onReset: () => void
  onNavigate: (view: SiteViewId) => void
}

export function RouteView({ answers, onAnswer, onReset, onNavigate }: RouteViewProps) {
  const controlQuestions = DIAGNOSTIC_QUESTIONS.filter((question) => question.type === 'control')
  const profileQuestions = DIAGNOSTIC_QUESTIONS.filter((question) => question.type === 'perfil')
  const answeredControls = controlQuestions.filter((question) => answers[question.id])
  const answeredTotal = DIAGNOSTIC_QUESTIONS.filter((question) => answers[question.id]).length
  const percent = Math.round((answeredTotal / DIAGNOSTIC_QUESTIONS.length) * 100)

  return (
    <div className="view-page">
      <header className="page-head">
        <div>
          <h1>Mi Ruta</h1>
          <p>
            Responda diez preguntas cortas. Al final verá qué le corresponde hacer, quién es responsable, qué evidencia se
            espera y con qué norma se relaciona.
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={onReset}>
          <RotateCcw size={16} aria-hidden="true" /> Reiniciar respuestas
        </button>
      </header>

      <div className="diag-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Preguntas respondidas">
        <span>{answeredTotal} de {DIAGNOSTIC_QUESTIONS.length} respondidas</span>
        <div><i style={{ width: `${percent}%` }} /></div>
        <b>{percent}%</b>
      </div>

      <section className="diag-block" aria-labelledby="diag-profile">
        <h2 id="diag-profile">1. Su organización</h2>
        <div className="diag-grid profile">
          {profileQuestions.map((question) => (
            <fieldset className={`diag-card ${answers[question.id] ? 'answered' : ''}`} key={question.id}>
              <legend>{question.question}</legend>
              <p className="diag-help">{question.help}</p>
              <div className="diag-options">
                {question.options.map((option) => (
                  <label key={option.value} className={answers[question.id] === option.value ? 'chosen' : ''}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={answers[question.id] === option.value}
                      onChange={() => onAnswer(question.id, option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="diag-block" aria-labelledby="diag-controls">
        <h2 id="diag-controls">2. Qué tiene implementado</h2>
        <div className="diag-grid rows">
          {controlQuestions.map((question) => (
            <fieldset className={`diag-card ${answers[question.id] ? 'answered' : ''}`} key={question.id}>
              <legend>{question.question}</legend>
              <p className="diag-help">{question.help}</p>
              <div className="diag-options">
                {question.options.map((option) => (
                  <label key={option.value} className={answers[question.id] === option.value ? 'chosen' : ''}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={answers[question.id] === option.value}
                      onChange={() => onAnswer(question.id, option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="diag-block" aria-labelledby="diag-results">
        <h2 id="diag-results">3. Resultado y acciones</h2>
        {answeredControls.length === 0 && (
          <p className="empty-note">Responda al menos una pregunta del bloque anterior para ver sus acciones.</p>
        )}
        <div className="result-list">
          {answeredControls.map((question) => {
            const status = statusForAnswer(question.id, answers[question.id]) ?? 'verificar'
            const Icon = STATUS_ICON[status]
            const outcome = question.outcome
            if (!outcome) return null
            return (
              <article className={`result-card ${status}`} key={question.id}>
                <header>
                  <span className="result-status">
                    <Icon size={16} aria-hidden="true" /> {DIAGNOSTIC_STATUS_LABELS[status]}
                  </span>
                  <h3>{question.question}</h3>
                  <span className={`kind-tag ${outcome.kind}`} title={OBLIGATION_KIND_HELP[outcome.kind]}>
                    {OBLIGATION_KIND_LABELS[outcome.kind]}
                  </span>
                </header>

                {status === 'no-aplica' ? (
                  <p className="result-note">
                    Usted indicó que no aplica. Guarde la razón por escrito: en una fiscalización le pedirán sustentar por
                    que no corresponde.
                  </p>
                ) : (
                  <>
                    <p className="result-explanation">{outcome.explanation}</p>
                    <dl className="result-grid">
                      <div>
                        <dt>Acción requerida</dt>
                        <dd>{outcome.action}</dd>
                      </div>
                      <div>
                        <dt>Responsable</dt>
                        <dd>{outcome.responsible}</dd>
                      </div>
                      <div>
                        <dt>Evidencia esperada</dt>
                        <dd>{outcome.evidence}</dd>
                      </div>
                      <div>
                        <dt>Plazo o frecuencia</dt>
                        <dd>{outcome.frequency ?? 'Requiere verificación en la fuente oficial.'}</dd>
                      </div>
                    </dl>
                  </>
                )}

                <footer>
                  <div className="result-links">
                    <b>Sustento normativo:</b>
                    {outcome.normIds.map((normId) => (
                      <LegalReference key={normId} normId={normId} compact />
                    ))}
                  </div>
                  {outcome.templateIds.length > 0 && (
                    <div className="result-links">
                      <b>Plantillas relacionadas:</b>
                      {outcome.templateIds.map((templateId) => {
                        const template = findTemplate(templateId)
                        if (!template) return null
                        const href = template.file ? assetUrl(template.file) : template.externalUrl
                        return (
                          <a
                            key={templateId}
                            className="template-link"
                            href={href}
                            {...(template.file ? { download: '' } : { target: '_blank', rel: 'noopener noreferrer' })}
                          >
                            {template.name}
                          </a>
                        )
                      })}
                    </div>
                  )}
                </footer>
              </article>
            )
          })}
        </div>

        {answeredControls.length > 0 && (
          <div className="result-actions">
            <button type="button" className="btn-primary" onClick={() => onNavigate('herramientas')}>
              Construir mi matriz IPERC
            </button>
            <button type="button" className="btn-secondary" onClick={() => onNavigate('plantillas')}>
              Ver plantillas sugeridas
            </button>
          </div>
        )}
        <p className="site-disclaimer">{PLATFORM_DISCLAIMER}</p>
      </section>
    </div>
  )
}

export default RouteView
