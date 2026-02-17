import { MONTHLY_PHASE_LABELS } from '../../templates/lessonTemplates';
import DynamicTableTemplate from './DynamicTableTemplate';

export default function MonthlyTemplate({ data = {}, onChange, highlightEmpty = {} }) {
  return (
    <DynamicTableTemplate
      data={data}
      onChange={onChange}
      labelKey="phase"
      defaultLabels={MONTHLY_PHASE_LABELS}
      highlightEmpty={highlightEmpty}
    />
  );
}
