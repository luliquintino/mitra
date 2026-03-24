import { WaveDivider } from './SvgDecorations';

interface SectionDividerProps {
  flip?: boolean;
  className?: string;
}

export function SectionDivider({ flip, className = '' }: SectionDividerProps) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''} ${className}`}>
      <WaveDivider className="w-full h-auto" />
    </div>
  );
}
