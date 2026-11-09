import { themeBackground, bgUrl } from '../lib/themes'

export function Slide({ state }: { state: ProjectionState | null }): React.JSX.Element {
  if (!state) return <div className="h-full w-full bg-black" />

  const t = state.theme
  const visible = !state.blackout && !state.clear
  const showImage = !state.blackout && t.bgType === 'image' && !!t.bgImage

  return (
    <div
      className="relative h-full w-full flex items-center justify-center overflow-hidden"
      style={{
        containerType: 'size',
        background: state.blackout ? '#000000' : themeBackground(t)
      }}
    >
      {showImage && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${bgUrl(t.bgImage)}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: `rgba(0,0,0,${(t.bgDim ?? 0) / 100})` }}
          />
        </>
      )}

      {visible && (
        <div
          className="relative w-full leading-tight"
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