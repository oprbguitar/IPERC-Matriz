import type { ReactNode } from 'react'
import { EQUIPMENT_ART_LABEL } from '../data/preventionEquipmentArt'

/** Ilustraciones esquemáticas, una por categoría. Sin escala ni modelo comercial. */
const INK = 'var(--text)'
const BASE = 'var(--surface-soft)'
const ACC = 'var(--blue-soft)'
const ACC_LINE = 'var(--blue-dark)'
const WARN = 'var(--amber-soft)'
const WARN_LINE = 'var(--amber)'

const stroke = { fill: 'none', stroke: INK, strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const P = ({ d, fill = BASE, line = INK, w = 2.5 }: { d: string; fill?: string; line?: string; w?: number }) => <path d={d} fill={fill} stroke={line} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />

function Art({ id }: { id: string }): ReactNode {
  switch (id) {
    case 'cabeza': return <g>
      <P d="M100 104C100 52 138 34 180 34C222 34 260 52 260 104Z" fill={ACC} line={ACC_LINE} />
      <P d="M88 104H272V116H88Z" fill={ACC} line={ACC_LINE} />
      <path d="M180 34V104M150 40V104M210 40V104" {...stroke} stroke={ACC_LINE} strokeWidth={1.5} />
      <path d="M112 116C118 138 142 146 180 146C218 146 242 138 248 116" {...stroke} strokeDasharray="5 4" />
      <path d="M180 18V30M166 22L172 32M194 22L188 32" {...stroke} stroke={WARN_LINE} />
    </g>
    case 'auditiva': return <g>
      <path d="M90 100C90 28 270 28 270 100" {...stroke} strokeWidth={5} />
      <P d="M70 72H108Q116 72 116 80V124Q116 132 108 132H78Q70 132 70 124Z" fill={ACC} line={ACC_LINE} />
      <P d="M290 72H252Q244 72 244 80V124Q244 132 252 132H282Q290 132 290 124Z" fill={ACC} line={ACC_LINE} />
      <P d="M170 118Q170 104 180 104Q190 104 190 118V138H170Z" fill={WARN} line={WARN_LINE} />
      <path d="M170 126H190M170 132H190" {...stroke} stroke={WARN_LINE} strokeWidth={1.5} />
    </g>
    case 'ocular': return <g>
      <P d="M50 70Q50 56 66 56H128Q144 56 144 70V98Q144 116 126 116H70Q50 116 50 98Z" fill={ACC} line={ACC_LINE} />
      <P d="M146 70Q146 56 162 56H224Q240 56 240 70V98Q240 116 222 116H166Q146 116 146 98Z" fill={ACC} line={ACC_LINE} />
      <path d="M144 80H146M50 82H34M240 82H256" {...stroke} />
      <path d="M270 54H336V96Q336 118 304 118Q270 118 270 96Z" {...stroke} fill={ACC} stroke={ACC_LINE} />
      <path d="M262 48H344" {...stroke} strokeWidth={5} />
    </g>
    case 'respiratoria': return <g>
      <P d="M120 52Q180 30 240 52Q252 90 220 120Q180 146 140 120Q108 90 120 52Z" fill={BASE} />
      <path d="M120 52C100 56 84 66 76 80M240 52C260 56 276 66 284 80" {...stroke} />
      <P d="M126 92H160V122H126Z" fill={WARN} line={WARN_LINE} />
      <P d="M200 92H234V122H200Z" fill={WARN} line={WARN_LINE} />
      <path d="M132 100H154M132 108H154M206 100H228M206 108H228" {...stroke} stroke={WARN_LINE} strokeWidth={1.5} />
      <circle cx="180" cy="84" r="9" fill={ACC} stroke={ACC_LINE} strokeWidth={2} />
    </g>
    case 'manos': return <g>
      <P d="M112 100V58Q112 50 120 50Q128 50 128 58V86" fill={ACC} line={ACC_LINE} />
      <P d="M128 86V38Q128 30 136 30Q144 30 144 38V86" fill={ACC} line={ACC_LINE} />
      <P d="M144 86V34Q144 26 152 26Q160 26 160 34V86" fill={ACC} line={ACC_LINE} />
      <P d="M160 90V42Q160 34 168 34Q176 34 176 42V100" fill={ACC} line={ACC_LINE} />
      <P d="M112 100Q92 94 88 80Q86 70 96 70Q104 72 112 84" fill={ACC} line={ACC_LINE} />
      <P d="M112 100H176L184 128H120Z" fill={ACC} line={ACC_LINE} />
      <P d="M118 128H186V144H118Z" fill={WARN} line={WARN_LINE} />
      <path d="M126 144V128M142 144V128M158 144V128M174 144V128" {...stroke} stroke={WARN_LINE} strokeWidth={1.5} />
    </g>
    case 'pies': return <g>
      <path d="M70 134H290" {...stroke} strokeWidth={1.5} />
      <P d="M110 42H156L162 82Q214 92 252 104Q268 110 268 124V126H106Z" fill={ACC} line={ACC_LINE} />
      <P d="M216 96Q252 104 262 112V126H196V100Z" fill={WARN} line={WARN_LINE} />
      <P d="M104 126H270V138H104Z" fill={BASE} />
      <path d="M118 138V132M138 138V132M158 138V132M178 138V132M198 138V132M218 138V132M238 138V132M258 138V132" {...stroke} strokeWidth={1.5} />
      <path d="M114 52H152M118 62H154" {...stroke} stroke={ACC_LINE} strokeWidth={1.5} />
    </g>
    case 'ropa': return <g>
      <P d="M150 28H210L226 40L282 62L270 100L234 88V148H190V108H170V148H126V88L90 100L78 62L134 40Z" fill={ACC} line={ACC_LINE} />
      <path d="M180 34V108" {...stroke} stroke={ACC_LINE} strokeWidth={1.5} />
      <path d="M126 84H234M126 96H234" {...stroke} stroke={WARN_LINE} strokeWidth={5} />
      <path d="M90 88L104 92M270 88L256 92" {...stroke} stroke={WARN_LINE} strokeWidth={5} />
    </g>
    case 'caidas': return <g>
      <P d="M146 22L172 54L164 100M214 22L188 54L196 100" fill="none" line={ACC_LINE} w={5} />
      <path d="M164 54H196" {...stroke} stroke={ACC_LINE} strokeWidth={5} />
      <P d="M164 100L140 134M196 100L220 134" fill="none" line={ACC_LINE} w={5} />
      <circle cx="180" cy="38" r="8" fill={WARN} stroke={WARN_LINE} strokeWidth={2.5} />
      <path d="M180 30V10" {...stroke} />
      <rect x="170" y="78" width="20" height="12" rx="2" fill={WARN} stroke={WARN_LINE} strokeWidth={2} />
      <path d="M186 90L176 112L190 126" {...stroke} stroke={WARN_LINE} />
      <path d="M180 10L284 10" {...stroke} strokeDasharray="6 4" />
    </g>
    case 'electrica': return <g>
      <P d="M120 100V58Q120 50 128 50Q136 50 136 58V86M136 86V40Q136 32 144 32Q152 32 152 40V86M152 86V36Q152 28 160 28Q168 28 168 36V86M168 90V44Q168 36 176 36Q184 36 184 44V100M120 100Q100 94 96 80Q94 70 104 70Q112 72 120 84M120 100H184L192 124H128Z" fill={ACC} line={ACC_LINE} />
      <P d="M126 124H196V146H126Z" fill={WARN} line={WARN_LINE} />
      <path d="M246 28L226 80H246L232 130L276 66H254L270 28Z" fill={WARN} stroke={WARN_LINE} strokeWidth={2.5} strokeLinejoin="round" />
    </g>
    case 'biologica': return <g>
      <P d="M52 66H128V112H52Z" fill={ACC} line={ACC_LINE} />
      <path d="M62 72V106M72 72V106M82 72V106M92 72V106M102 72V106M112 72V106" {...stroke} stroke={ACC_LINE} strokeWidth={1.5} />
      <path d="M52 80C34 80 34 100 52 100M128 80C146 80 146 100 128 100" {...stroke} />
      <P d="M176 98V60Q176 52 184 52Q192 52 192 60V84M192 84V46Q192 38 200 38Q208 38 208 46V84M208 84V50Q208 42 216 42Q224 42 224 50V100M176 98Q160 92 158 82Q158 74 166 76Q172 78 176 86M176 98H224L230 122H182Z" fill={ACC} line={ACC_LINE} />
      <P d="M262 74H322V140H262Z" fill={WARN} line={WARN_LINE} />
      <path d="M262 74L268 64H316L322 74M278 92H306" {...stroke} stroke={WARN_LINE} />
      <path d="M292 92V58" {...stroke} stroke={WARN_LINE} />
    </g>
    case 'sonometro': return <g>
      <path d="M180 14V42" {...stroke} strokeWidth={4} />
      <circle cx="180" cy="12" r="8" fill={WARN} stroke={WARN_LINE} strokeWidth={2.5} />
      <P d="M146 42H214V148H146Z" fill={BASE} />
      <P d="M156 54H204V82H156Z" fill={ACC} line={ACC_LINE} />
      <path d="M162 74L170 62L178 72L186 60L198 70" {...stroke} stroke={ACC_LINE} strokeWidth={1.8} />
      <circle cx="166" cy="104" r="7" {...stroke} /><circle cx="194" cy="104" r="7" {...stroke} />
      <path d="M156 126H204" {...stroke} strokeWidth={1.8} />
      <path d="M226 6Q238 12 226 20M236 0Q254 12 236 24" {...stroke} stroke={ACC_LINE} strokeWidth={1.8} />
    </g>
    case 'dosimetro': return <g>
      <P d="M110 62H250L234 150H126Z" fill={ACC} line={ACC_LINE} />
      <path d="M180 62V32" {...stroke} />
      <P d="M158 40H202V50H158Z" fill={BASE} />
      <circle cx="180" cy="20" r="7" fill={WARN} stroke={WARN_LINE} strokeWidth={2.5} />
      <P d="M148 84H212V112H148Z" fill={BASE} />
      <path d="M156 106L166 94L176 102L186 90L204 100" {...stroke} stroke={ACC_LINE} strokeWidth={1.8} />
      <path d="M170 126H190" {...stroke} />
    </g>
    case 'calibrador': return <g>
      <path d="M180 18V56" {...stroke} strokeWidth={4} />
      <circle cx="180" cy="16" r="8" fill={WARN} stroke={WARN_LINE} strokeWidth={2.5} />
      <P d="M146 52H214V138H146Z" fill={ACC} line={ACC_LINE} />
      <P d="M158 66H202V92H158Z" fill={BASE} />
      <text x="180" y="85" textAnchor="middle" fontSize="15" fontWeight="700" fill={INK} stroke="none">94 dB</text>
      <path d="M160 110H200M160 120H200" {...stroke} stroke={ACC_LINE} strokeWidth={1.8} />
      <path d="M226 78H252M226 96H260" {...stroke} stroke={ACC_LINE} strokeWidth={1.8} />
    </g>
    case 'luxometro': return <g>
      <P d="M80 50H164V148H80Z" fill={BASE} />
      <P d="M90 62H154V90H90Z" fill={ACC} line={ACC_LINE} />
      <text x="122" y="83" textAnchor="middle" fontSize="16" fontWeight="700" fill={INK} stroke="none">500 lx</text>
      <circle cx="122" cy="116" r="8" {...stroke} />
      <path d="M164 100Q206 100 214 80Q222 62 250 70" {...stroke} />
      <path d="M244 82Q244 56 280 56Q316 56 316 82Z" fill={WARN} stroke={WARN_LINE} strokeWidth={2.5} />
      <path d="M244 82H316V92H244Z" fill={BASE} stroke={INK} strokeWidth={2.5} />
      <path d="M262 14V40M292 14V40M246 22L260 40M326 22L312 40" {...stroke} stroke={WARN_LINE} strokeWidth={2} />
    </g>
    case 'termohigrometro': return <g>
      <P d="M130 26H230V148H130Z" fill={BASE} />
      <P d="M142 38H218V84H142Z" fill={ACC} line={ACC_LINE} />
      <text x="152" y="66" fontSize="15" fontWeight="700" fill={INK} stroke="none">24 °C</text>
      <text x="152" y="108" fontSize="15" fontWeight="700" fill={INK} stroke="none">60 %</text>
      <path d="M142 92H218" {...stroke} strokeWidth={1.5} />
      <path d="M264 34V92" {...stroke} strokeWidth={9} stroke={BASE} />
      <path d="M264 34V92" {...stroke} strokeWidth={3} stroke={WARN_LINE} />
      <circle cx="264" cy="100" r="11" fill={WARN} stroke={WARN_LINE} strokeWidth={2.5} />
      <path d="M296 62Q282 84 296 94Q310 84 296 62Z" fill={ACC} stroke={ACC_LINE} strokeWidth={2.5} strokeLinejoin="round" />
    </g>
    case 'detector-gases': return <g>
      <P d="M120 24H240V146H120Z" fill={ACC} line={ACC_LINE} />
      <P d="M132 38H228V86H132Z" fill={BASE} />
      <text x="142" y="60" fontSize="12" fontWeight="700" fill={INK} stroke="none">O₂ 20,9 %</text>
      <text x="142" y="78" fontSize="12" fontWeight="700" fill={INK} stroke="none">LEL 0 · CO 0</text>
      <path d="M140 108H220M140 116H220M140 124H220M140 132H220" {...stroke} stroke={ACC_LINE} strokeWidth={1.8} />
      <circle cx="180" cy="98" r="5" fill={WARN} stroke={WARN_LINE} strokeWidth={2} />
      <path d="M120 40H104V60H120M240 40H256V60H240" {...stroke} />
    </g>
    case 'multimetro': return <g>
      <P d="M130 14H230V148H130Z" fill={WARN} line={WARN_LINE} />
      <P d="M142 26H218V62H142Z" fill={BASE} />
      <text x="180" y="52" textAnchor="middle" fontSize="16" fontWeight="700" fill={INK} stroke="none">230 V</text>
      <circle cx="180" cy="98" r="22" fill={BASE} stroke={INK} strokeWidth={2.5} />
      <path d="M180 98L192 84" {...stroke} />
      <circle cx="152" cy="140" r="4" fill={INK} /><circle cx="208" cy="140" r="4" fill={INK} />
      <path d="M152 148Q120 160 90 130M208 148Q246 160 276 130" {...stroke} stroke={ACC_LINE} />
    </g>
    case 'wbgt': return <g>
      <path d="M180 78L128 148M180 78L232 148M180 78V148" {...stroke} />
      <path d="M180 78V60" {...stroke} />
      <path d="M120 60H240" {...stroke} strokeWidth={2} />
      <circle cx="132" cy="44" r="14" fill={BASE} stroke={ACC_LINE} strokeWidth={2.5} />
      <path d="M132 58V60M126 30Q132 22 138 30" {...stroke} stroke={ACC_LINE} strokeWidth={1.5} />
      <circle cx="180" cy="42" r="17" fill={INK} stroke={INK} strokeWidth={2.5} />
      <path d="M170 34Q174 30 180 30" {...stroke} stroke={BASE} strokeWidth={2} />
      <circle cx="228" cy="48" r="9" fill={WARN} stroke={WARN_LINE} strokeWidth={2.5} />
      <path d="M132 60V68" {...stroke} stroke={ACC_LINE} />
    </g>
    case 'vibraciones': return <g>
      <P d="M60 78H190V104H60Z" fill={ACC} line={ACC_LINE} />
      <P d="M190 70H240V112H190Z" fill={BASE} />
      <P d="M110 104H134V142H110Z" fill={BASE} />
      <rect x="150" y="56" width="22" height="22" rx="3" fill={WARN} stroke={WARN_LINE} strokeWidth={2.5} />
      <path d="M172 62Q200 50 232 52" {...stroke} stroke={WARN_LINE} strokeWidth={1.8} />
      <path d="M252 90L264 70L276 112L288 62L300 118L312 82L326 90" {...stroke} stroke={ACC_LINE} />
    </g>
    default: return <g>
      <P d="M70 56H170V134H70Z" fill={BASE} />
      <P d="M82 68H130V92H82Z" fill={ACC} line={ACC_LINE} />
      <circle cx="148" cy="80" r="8" {...stroke} />
      <path d="M170 90Q216 90 226 70Q236 50 262 56" {...stroke} />
      <P d="M250 44H298V92Q298 108 274 108Q250 108 250 92Z" fill={WARN} line={WARN_LINE} />
      <path d="M262 52V100M286 52V100" {...stroke} stroke={WARN_LINE} strokeWidth={1.5} />
    </g>
  }
}

export default function PreventionEquipmentArt({ id, kind }: { id: string; kind: 'epp' | 'instrumento' }) {
  const label = EQUIPMENT_ART_LABEL[id] ?? (kind === 'epp' ? 'equipo de protección' : 'instrumento de medición')
  return <svg className="pr-equip-illustration" viewBox="0 0 360 160" role="img" aria-label={`Esquema ilustrativo: ${label}`}>
    <path d="M24 152H336" stroke="var(--border-strong)" strokeWidth={1.5} fill="none" />
    <Art id={id} />
  </svg>
}
