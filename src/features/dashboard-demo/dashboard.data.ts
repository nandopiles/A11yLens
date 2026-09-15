/** Repository: mock content for the dashboard demo. */

export interface Series {
  id: string;
  /** Category is conveyed only by this color (intentional defect). */
  color: string;
  /** Bar heights as percentages. */
  values: number[];
}

export const series: Series[] = [
  { id: 's1', color: '#16a34a', values: [40, 55, 30, 70, 60] },
  { id: 's2', color: '#dc2626', values: [60, 35, 65, 45, 80] },
  { id: 's3', color: '#2563eb', values: [25, 45, 50, 35, 40] },
];

export const legendColors = series.map((s) => s.color);

export const periods = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];
