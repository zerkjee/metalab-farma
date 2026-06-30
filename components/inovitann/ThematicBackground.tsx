'use client'

import { useEffect, useRef } from 'react'
import type { InovitannTheme } from '@/lib/inovitann-themes'

interface ThematicBackgroundProps {
  tema: InovitannTheme['temaVisual']
  cor: string
}

// ─── Neural / Metilcobalamina / L-Treonato ───────────────────────────────────
function NeuralBackground({ cor }: { cor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const nodes: { x: number; y: number; vx: number; vy: number }[] = []
    const COUNT = 22

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      nodes.forEach((n) => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
      })
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 160) {
            ctx.beginPath()
            ctx.strokeStyle = `${cor}${Math.floor((1 - dist / 160) * 20).toString(16).padStart(2, '0')}`
            ctx.lineWidth = 0.8
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }
      nodes.forEach((n) => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `${cor}30`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [cor])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  )
}

// ─── Mitocondrial / CoQ10 ────────────────────────────────────────────────────
function MitocondrialBackground({ cor }: { cor: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{`
          @keyframes spin-slow { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
          @keyframes spin-rev  { from { transform: rotate(360deg) } to { transform: rotate(0deg) } }
          .ms { transform-origin: 50% 50%; }
          .r1 { animation: spin-slow 18s linear infinite; }
          .r2 { animation: spin-rev  24s linear infinite; }
          .r3 { animation: spin-slow 32s linear infinite; }
        `}</style>
      </defs>
      <g className="ms r1">
        <ellipse cx="50%" cy="50%" rx="38%" ry="18%" fill="none" stroke={cor} strokeWidth="1" strokeOpacity="0.09" />
      </g>
      <g className="ms r2">
        <ellipse cx="50%" cy="50%" rx="30%" ry="14%" fill="none" stroke={cor} strokeWidth="1" strokeOpacity="0.11" />
      </g>
      <g className="ms r3">
        <ellipse cx="50%" cy="50%" rx="20%" ry="9%" fill="none" stroke={cor} strokeWidth="1.5" strokeOpacity="0.08" />
      </g>
      <circle cx="50%" cy="50%" r="4%" fill={cor} fillOpacity="0.06" />
    </svg>
  )
}

// ─── Molecular / Penta ───────────────────────────────────────────────────────
function MolecularBackground({ cor }: { cor: string }) {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 - 90) * (Math.PI / 180)
    return { x: 50 + 32 * Math.cos(a), y: 50 + 32 * Math.sin(a) }
  })

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{`
          @keyframes pulse-mol { 0%,100%{opacity:.6} 50%{opacity:1} }
          .mol-line { animation: pulse-mol 3s ease-in-out infinite; }
        `}</style>
      </defs>
      {pts.map((p, i) =>
        pts.slice(i + 1).map((q, j) => (
          <line
            key={`${i}-${j}`}
            x1={p.x} y1={p.y} x2={q.x} y2={q.y}
            stroke={cor} strokeWidth="0.4"
            className="mol-line"
            style={{ animationDelay: `${(i + j) * 0.4}s` }}
          />
        ))
      )}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.2" fill={cor} fillOpacity="0.7" />
      ))}
      {/* hex grid in background */}
      {[-20, 0, 20, 40, 60, 80, 100, 120].map((x) =>
        [-20, 0, 20, 40, 60, 80, 100, 120].map((y) => (
          <polygon
            key={`${x}-${y}`}
            points={`${x},${y - 7} ${x + 6},${y - 3.5} ${x + 6},${y + 3.5} ${x},${y + 7} ${x - 6},${y + 3.5} ${x - 6},${y - 3.5}`}
            fill="none" stroke={cor} strokeWidth="0.15" strokeOpacity="0.4"
          />
        ))
      )}
    </svg>
  )
}

// ─── Muscular / Cloreto / Tri Magnésio ───────────────────────────────────────
function MuscularBackground({ cor }: { cor: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{`
          @keyframes wave { 0%,100%{d:path('M0,40 C20,30 40,50 60,40 S100,30 120,40 L120,80 L0,80 Z')} 50%{d:path('M0,45 C20,35 40,55 60,45 S100,35 120,45 L120,80 L0,80 Z')} }
        `}</style>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1="0" y1={`${15 + i * 18}%`} x2="100%" y2={`${15 + i * 18}%`}
          stroke={cor} strokeWidth="1" strokeOpacity="0.06"
          strokeDasharray="8 6"
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <ellipse
          key={i}
          cx={`${20 + i * 22}%`} cy="50%"
          rx="6%" ry="2%"
          fill="none" stroke={cor} strokeWidth="0.8" strokeOpacity="0.07"
        />
      ))}
    </svg>
  )
}

// ─── Ósseo / Vitamina K ──────────────────────────────────────────────────────
function OsseoBackground({ cor }: { cor: string }) {
  const size = 18
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          const x = col * size * 1.5
          const y = row * size + (col % 2 === 1 ? size * 0.75 : 0)
          return (
            <rect
              key={`${row}-${col}`}
              x={x} y={y}
              width={size} height={size}
              fill="none" stroke={cor} strokeWidth="0.6"
              rx="1"
            />
          )
        })
      )}
    </svg>
  )
}

// ─── Antioxidante / NAC ──────────────────────────────────────────────────────
function AntioxidanteBackground({ cor }: { cor: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{`
          @keyframes shield-pulse { 0%,100%{opacity:.07;transform:scale(1)} 50%{opacity:.12;transform:scale(1.04)} }
          .shld { transform-origin:50% 50%; animation:shield-pulse 4s ease-in-out infinite; }
        `}</style>
      </defs>
      {[0.9, 0.65, 0.42].map((r, i) => (
        <circle
          key={i}
          cx="50%" cy="50%"
          r={`${r * 40}%`}
          fill="none"
          stroke={cor}
          strokeWidth="1.2"
          className="shld"
          style={{ animationDelay: `${i * 1.2}s` }}
        />
      ))}
      {/* hex shield center */}
      <polygon
        points="50,37 61,43.5 61,56.5 50,63 39,56.5 39,43.5"
        fill="none" stroke={cor} strokeWidth="0.8" strokeOpacity="0.1"
        transform="translate(calc(50% - 50px), calc(50% - 50px)) scale(1.5)"
      />
    </svg>
  )
}

// ─── Capilar / Biotina ───────────────────────────────────────────────────────
function CapilarBackground({ cor }: { cor: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.09]"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{`
          @keyframes drift { 0%{transform:translateY(0)} 100%{transform:translateY(-20px)} }
        `}</style>
      </defs>
      {[10, 25, 40, 55, 70, 85].map((x, i) => (
        <path
          key={i}
          d={`M${x}%,100% C${x - 4}%,70% ${x + 4}%,50% ${x - 2}%,30% S${x + 3}%,10% ${x}%,0%`}
          fill="none"
          stroke={cor}
          strokeWidth="1"
          strokeOpacity="0.7"
          style={{
            animation: `drift ${3 + i * 0.5}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </svg>
  )
}

// ─── Ocular / Luteína ────────────────────────────────────────────────────────
function OcularBackground({ cor }: { cor: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{`
          @keyframes ring-expand { 0%{opacity:.12;r:15%} 100%{opacity:0;r:48%} }
          .ring { animation: ring-expand 4s ease-out infinite; }
        `}</style>
      </defs>
      {[0, 1.3, 2.6, 3.9].map((delay, i) => (
        <circle
          key={i}
          cx="50%" cy="50%"
          fill="none"
          stroke={cor}
          strokeWidth="1"
          className="ring"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
      <circle cx="50%" cy="50%" r="3%" fill={cor} fillOpacity="0.07" />
    </svg>
  )
}

// ─── Inflamatório / Cúrcuma ──────────────────────────────────────────────────
function InflamatorioBackground({ cor }: { cor: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{`
          @keyframes blob-morph {
            0%,100%{d:path('M60,20 C80,10 100,30 95,55 C90,80 70,90 50,88 C30,86 10,75 8,55 C6,35 20,15 40,12 C50,10 52,22 60,20 Z')}
            50%{d:path('M55,18 C78,8 105,32 98,60 C91,88 68,95 46,90 C24,85 5,70 6,48 C7,26 25,10 45,10 C55,10 48,20 55,18 Z')}
          }
          .blob { animation: blob-morph 8s ease-in-out infinite; }
        `}</style>
      </defs>
      <path className="blob" fill={cor} fillOpacity="0.06" />
      <path
        d="M20,70 Q35,50 50,65 T80,60"
        fill="none" stroke={cor} strokeWidth="1" strokeOpacity="0.08"
      />
      <path
        d="M15,45 Q30,30 45,45 T75,40 T90,50"
        fill="none" stroke={cor} strokeWidth="0.8" strokeOpacity="0.07"
      />
    </svg>
  )
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────
export default function ThematicBackground({ tema, cor }: ThematicBackgroundProps) {
  switch (tema) {
    case 'neural':
      return <NeuralBackground cor={cor} />
    case 'mitocondrial':
      return <MitocondrialBackground cor={cor} />
    case 'molecular':
      return <MolecularBackground cor={cor} />
    case 'muscular':
      return <MuscularBackground cor={cor} />
    case 'osseo':
      return <OsseoBackground cor={cor} />
    case 'antioxidante':
      return <AntioxidanteBackground cor={cor} />
    case 'capilar':
      return <CapilarBackground cor={cor} />
    case 'ocular':
      return <OcularBackground cor={cor} />
    case 'inflamatorio':
      return <InflamatorioBackground cor={cor} />
    default:
      return null
  }
}
