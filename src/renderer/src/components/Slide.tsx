export function Slide({ state }: { state: ProjectionState | null }): React.JSX.Element {
  const visible = state && !state.blackout && !state.clear

  return (
    <div
      className="h-full w-full bg-black text-white flex items-center justify-center overflow-hidden"
      style={{ containerType: 'size' }}
    >
      {visible && (
        <div
          className="w-full font-semibold leading-tight"
          style={{
            fontSize: `${state.fontSize}cqh`,
            textAlign: state.align,
            padding: '5cqh'
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