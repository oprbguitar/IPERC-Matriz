import { DIAGNOSTIC_QUESTIONS, type DiagnosticStatus } from '../data/platformContent'

export interface DiagnosticAnswers {
  [questionId: string]: string
}

/** Traduce la respuesta elegida al estado que se muestra en el resultado. */
export function statusForAnswer(questionId: string, value: string | undefined): DiagnosticStatus | undefined {
  if (!value) return undefined
  const question = DIAGNOSTIC_QUESTIONS.find((item) => item.id === questionId)
  return question?.options.find((option) => option.value === value)?.status
}
