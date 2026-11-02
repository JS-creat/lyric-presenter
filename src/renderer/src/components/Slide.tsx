import { themeBackground } from '../lib/themes'

export function Slide({ state }: { state: ProjectionState | null }): React.JSX.Element {
  if (!state) return <div className="h-full w-full bg-black" />

  const t = state.theme
  const visible = !state.blackout && !state.clear

  return (
    <div
      className="h-full w-full flex items-center justify-center overflow-hidden"
      style={{
        containerType: 'size',
        background: state.blackout ? '#000000' : themeBackground(t)
      }}
    >
      {visible && (
        <div
          className="w-full leading-tight"
          style={{
            fontSize: `${state.fontSize}cqh`,
            textAlign: state.align,
            padding: '5cqh',
            color: t.textColor,
            fontFamily: t.fontFamily,
            fontWeight: t.bold ? 700 : 500,
            textTransform: t.uppercase ? 'uppercase' : 'none',
            textShadow: t.shadow ? '0 0.5cqh 1.5cqh rgba(0,0,0,0.55)' : 'none'
          }}
        >
          {state.lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  )
}