import { WEEKLY_DAY_LABELS } from '../../templates/lessonTemplates';
import DynamicTableTemplate from './DynamicTableTemplate';

export default function WeeklyTemplate({ data = {}, onChange, highlightedCells = [], clearHighlight }) {
  return (
    <DynamicTableTemplate
      data={data}
      onChange={onChange}
      labelKey="day"
      defaultLabels={WEEKLY_DAY_LABELS}
      highlightedCells={highlightedCells}
      clearHighlight={clearHighlight}
    />
  );
}
