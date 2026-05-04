import { useRef, useEffect, useState } from 'react';
import { DNASegment } from '../utils/segmentation';

interface DNAVisualizerProps {
  segments: DNASegment[];
  selectedSegment: DNASegment | null;
  onSegmentClick: (segment: DNASegment) => void;
}

const HELIX_HEIGHT = 180;
const STRAND_GAP = 48;
const TICK_HEIGHT = 8;

export default function DNAVisualizer({
  segments,
  selectedSegment,
  onSegmentClick,
}: DNAVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let raf: number;
    const animate = () => {
      setAnimationPhase((p) => (p + 0.02) % (Math.PI * 2));
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!segments.length) return null;

  const totalLength = segments.reduce((s, seg) => s + seg.length, 0);
  const svgWidth = containerWidth - 16;
  const svgHeight = HELIX_HEIGHT;
  const padX = 12;
  const usableWidth = svgWidth - padX * 2;
  const midY = svgHeight / 2;

  const getX = (pos: number) => padX + (pos / totalLength) * usableWidth;
  const getSegWidth = (len: number) => Math.max((len / totalLength) * usableWidth, 2);

  const helixAmplitude = 14;
  const helixFreq = 0.05;

  const buildHelixPath = (yOffset: number, phase: number) => {
    const points: string[] = [];
    const steps = Math.floor(usableWidth / 3);
    for (let i = 0; i <= steps; i++) {
      const x = padX + (i / steps) * usableWidth;
      const t = (i / steps) * Math.PI * 8;
      const y = midY + yOffset + Math.sin(t + phase) * helixAmplitude;
      points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  const crossBridges = Array.from({ length: 20 }, (_, i) => {
    const x = padX + ((i + 0.5) / 20) * usableWidth;
    const t = ((i + 0.5) / 20) * Math.PI * 8;
    const y1 = midY - STRAND_GAP / 2 + Math.sin(t + animationPhase) * helixAmplitude;
    const y2 = midY + STRAND_GAP / 2 + Math.sin(t + animationPhase + Math.PI) * helixAmplitude;
    return { x, y1, y2 };
  });

  return (
    <div ref={containerRef} className="w-full">
      <svg
        width={svgWidth}
        height={svgHeight + 60}
        className="block"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {segments.map((seg) => (
            <radialGradient key={`grad-${seg.id}`} id={`grad-${seg.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={seg.color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={seg.color} stopOpacity="0.5" />
            </radialGradient>
          ))}
          <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-segment" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Helix background glow */}
        <path
          d={buildHelixPath(-STRAND_GAP / 2, animationPhase)}
          fill="none"
          stroke="rgba(16,185,129,0.15)"
          strokeWidth="10"
        />
        <path
          d={buildHelixPath(STRAND_GAP / 2, animationPhase + Math.PI)}
          fill="none"
          stroke="rgba(16,185,129,0.15)"
          strokeWidth="10"
        />

        {/* Cross bridges */}
        {crossBridges.map((b, i) => (
          <line
            key={i}
            x1={b.x}
            y1={b.y1}
            x2={b.x}
            y2={b.y2}
            stroke="rgba(16,185,129,0.25)"
            strokeWidth="1"
            strokeDasharray="3,2"
          />
        ))}

        {/* Helix strands */}
        <path
          d={buildHelixPath(-STRAND_GAP / 2, animationPhase)}
          fill="none"
          stroke="rgba(16,185,129,0.5)"
          strokeWidth="2"
          filter="url(#glow-green)"
        />
        <path
          d={buildHelixPath(STRAND_GAP / 2, animationPhase + Math.PI)}
          fill="none"
          stroke="rgba(16,185,129,0.5)"
          strokeWidth="2"
          filter="url(#glow-green)"
        />

        {/* Segment bars */}
        {segments.map((seg) => {
          const x = getX(seg.start);
          const w = getSegWidth(seg.length);
          const isSelected = selectedSegment?.id === seg.id;
          const isHovered = hoveredId === seg.id;
          const active = isSelected || isHovered;

          return (
            <g
              key={seg.id}
              onClick={() => onSegmentClick(seg)}
              onMouseEnter={() => setHoveredId(seg.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer"
            >
              {/* Glow behind selected */}
              {active && (
                <rect
                  x={x - 2}
                  y={midY - 18}
                  width={w + 4}
                  height={36}
                  rx={4}
                  fill={seg.color}
                  opacity={0.25}
                  filter="url(#glow-segment)"
                />
              )}
              {/* Main bar */}
              <rect
                x={x}
                y={midY - (active ? 16 : 12)}
                width={Math.max(w - 1, 1)}
                height={active ? 32 : 24}
                rx={3}
                fill={`url(#grad-${seg.id})`}
                stroke={active ? seg.color : 'transparent'}
                strokeWidth={active ? 1.5 : 0}
                style={{
                  transition: 'y 0.15s ease, height 0.15s ease',
                  filter: active ? `drop-shadow(0 0 6px ${seg.color})` : undefined,
                }}
              />
              {/* Tick */}
              <line
                x1={x + w / 2}
                y1={midY + (active ? 16 : 12)}
                x2={x + w / 2}
                y2={midY + (active ? 16 : 12) + TICK_HEIGHT}
                stroke={seg.color}
                strokeWidth="1"
                opacity="0.6"
              />
            </g>
          );
        })}

        {/* Position labels */}
        {segments
          .filter((_, i) => i % Math.ceil(segments.length / 8) === 0)
          .map((seg) => (
            <text
              key={`lbl-${seg.id}`}
              x={getX(seg.start) + getSegWidth(seg.length) / 2}
              y={svgHeight + 18}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(148,163,184,0.7)"
            >
              {seg.start}
            </text>
          ))}

        {/* Legend */}
        {[
          { color: '#f59e0b', label: 'Promoter' },
          { color: '#10b981', label: 'Optimal' },
          { color: '#ef4444', label: 'Insertion' },
          { color: '#3b82f6', label: 'Normal' },
        ].map((item, i) => (
          <g key={item.label} transform={`translate(${padX + i * 110}, ${svgHeight + 36})`}>
            <rect width="12" height="8" rx="2" fill={item.color} opacity="0.85" />
            <text x="16" y="8" fontSize="10" fill="rgba(148,163,184,0.9)">
              {item.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
