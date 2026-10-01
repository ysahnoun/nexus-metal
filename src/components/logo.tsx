export function NexusLogo({ size = 70 }: { size?: number; withText?: boolean }) {
  const displaySize = Math.max(size, 72);
  return (
    <span className="inline-flex items-center" aria-label="Nexus Metal">
      <img
        src="/images/nexus-metal-logo.svg"
        alt="Nexus Metal"
        width={displaySize}
        height={displaySize}
        className="rounded-lg object-contain"
      />
    </span>
  );
}
