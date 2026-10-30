// m0tz, the pixel-art character from Motz World, drawn from the same 16x20 pixel grid the game uses
// (public/motzworld/index.html, M0TZ_FRAMES). Rendered as SVG so it stays crisp at any size.

const PALETTE: Record<string, string> = {
  k: '#0a0814', h: '#2b2550', H: '#463d80', m: '#1b1636', s: '#d9a07f', S: '#a8735a',
  v: '#2de2e6', V: '#d6fdff', p: '#ff2e88', n: '#1c1734', N: '#2f2858', b: '#3a2f66', B: '#5a4a8a', e: '#1a1236',
}

const FRAMES = {
  idle: [
    '................',
    '......kkkk......',
    '....kkHHHHkk....',
    '...kHHhhhhhHk...',
    '...kHhhhhhhhhk..',
    '..kHhhkkkkkkhk..',
    '..khhkesssssk...',
    '..khhkvvvvvVk...',
    '..khhkssssSSk...',
    '..kmhhkkkSSk....',
    '...kmhhhkkkk....',
    '..kHhhhphphhk...',
    '..kHhhhphphhhk..',
    '..khhhhphphhhsk.',
    '..kmhhhhhhhhhkk.',
    '...kmmmmmmmmk...',
    '...knnNNnnnnk...',
    '...knnk..knnk...',
    '...kbBk..kbBk...',
    '...kkkk..kkkk...',
  ],
  // Arm out, as if typing on a terminal
  typing: [
    '................',
    '......kkkk......',
    '....kkHHHHkk....',
    '...kHHhhhhhHk...',
    '...kHhhhhhhhhk..',
    '..kHhhkkkkkkhk..',
    '..khhkesssssk...',
    '..khhkvvvvvVk...',
    '..khhkssssSSk...',
    '..kmhhkkkSSk....',
    '...kmhhhkkkk....',
    '..kHhhhphphhk...',
    '..kHhhhphphhhhhk',
    '..khhhhphphhhkss',
    '..kmhhhhhhhhhkk.',
    '...kmmmmmmmmk...',
    '...knnNNnnnnk...',
    '...knnk..knnk...',
    '...kbBk..kbBk...',
    '...kkkk..kkkk...',
  ],
}

// Turn each row into runs of same-colored pixels, so a frame is ~100 rects instead of ~200
function toRects(rows: string[]) {
  const rects: { x: number; y: number; w: number; fill: string; visor: boolean }[] = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      let end = x + 1
      while (end < row.length && row[end] === ch) end++
      if (ch !== '.') rects.push({ x, y, w: end - x, fill: PALETTE[ch], visor: ch === 'v' || ch === 'V' })
      x = end
    }
  })
  return rects
}

const RECTS = { idle: toRects(FRAMES.idle), typing: toRects(FRAMES.typing) }

type Props = {
  size?: number // height in CSS px; width follows the 16:20 grid
  frame?: keyof typeof FRAMES
  className?: string
  title?: string
}

export function M0tz({ size = 40, frame = 'idle', className, title }: Props) {
  return (
    <svg
      className={className}
      width={(size * 16) / 20}
      height={size}
      viewBox="0 0 16 20"
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {RECTS[frame].map((r) => (
        <rect key={`${r.x},${r.y}`} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} className={r.visor ? 'm0tz-visor' : undefined} />
      ))}
    </svg>
  )
}
