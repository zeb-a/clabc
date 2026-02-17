import { YEARLY_SECTION_LABELS } from '../../templates/lessonTemplates';
import DynamicTableTemplate from './DynamicTableTemplate';

export default function YearlyTemplate({ data = {}, onChange, highlightEmpty = {} }) {
  return (
    <DynamicTableTemplate
      data={data}
      onChange={onChange}
      labelKey="section"
      defaultLabels={YEARLY_SECTION_LABELS}
      highlightEmpty={highlightEmpty}
    />
  );
}
