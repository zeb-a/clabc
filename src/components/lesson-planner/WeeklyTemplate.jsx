import { WEEKLY_DAY_LABELS } from '../../templates/lessonTemplates';
import DynamicTableTemplate from './DynamicTableTemplate';

export default function WeeklyTemplate({ data = {}, onChange, highlightEmpty = {} }) {
  return (
    <DynamicTableTemplate
      data={data}
      onChange={onChange}
      labelKey="day"
      defaultLabels={WEEKLY_DAY_LABELS}
      highlightEmpty={highlightEmpty}
    />
  );
}
