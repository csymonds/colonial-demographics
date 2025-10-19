import { ChangeEvent } from "react";

interface TimelineControlsProps {
  years: number[];
  year: number;
  onYearChange: (year: number) => void;
}

function TimelineControls({ years, year, onYearChange }: TimelineControlsProps) {
  const min = 0;
  const max = years.length - 1;
  const currentIndex = Math.max(0, years.indexOf(year));

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const index = Number(event.target.value);
    const nextYear = years[index] ?? year;
    onYearChange(nextYear);
  };

  return (
    <div className="timeline-controls">
      <div className="timeline-current">Year: {year}</div>
      <div className="timeline-labels">
        <span className="timeline-year">{years[0]}</span>
        <span className="timeline-year">{years[years.length - 1]}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={currentIndex}
        onChange={handleChange}
        className="timeline-slider"
        aria-label="Timeline"
      />
    </div>
  );
}

export default TimelineControls;
