import { type CSSProperties, useMemo } from "react";

type AuroraProps = {
  amplitude?: number;
  blend?: number;
  colorStops?: string[];
};

export default function Aurora({
  amplitude = 1,
  blend = 0.5,
  colorStops = ["#5227FF", "#7cff67", "#5227FF", "#ffffff"],
}: AuroraProps) {
  const stops = useMemo(() => {
    const fallback = ["#5227FF", "#7cff67", "#5227FF", "#ffffff"];
    const arr = [...colorStops];
    while (arr.length < 4) arr.push(fallback[arr.length]);
    return arr.slice(0, 4);
  }, [colorStops]);

  const styleVars = {
    "--aurora-amplitude": `${Math.min(Math.max(amplitude, 0.2), 1.6)}`,
    "--aurora-blend": `${Math.min(Math.max(blend, 0.08), 1)}`,
  } as CSSProperties;

  return (
    <div className="aurora-root" style={styleVars}>
      <div className="aurora-noise" />
      {stops.map((stop, index) => (
        <div
          key={`${stop}-${index}`}
          className={`aurora-blob aurora-blob-${index + 1}`}
          style={{ "--aurora-color": stop } as CSSProperties}
        />
      ))}
    </div>
  );
}
