import type { ValidationRule } from '@invite-app/contract';
import { FieldError } from './field-error';
import { ruleMessage } from './messages';

/** Campo numérico opcional: vazio é sem limite (UC002 RN2). */
export function optionalNumber(value: string): number | null {
  return value.trim() === '' ? null : Number(value);
}

export interface InviteDataValues {
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  peopleLimit: string;
  companionLimit: string;
}

/**
 * Os campos do UC002, divididos entre a criação e o editor. Data, hora e limites ficam
 * travados fora do rascunho (UC002 RN3), e a API recusa com 409 se vierem mesmo assim.
 */
export function InviteDataFields({
  values,
  onChange,
  errors,
  textLimits,
  scheduleLocked = false,
}: {
  values: InviteDataValues;
  onChange: (field: keyof InviteDataValues) => (value: string) => void;
  errors: Partial<Record<string, ValidationRule>>;
  textLimits: { eventName: number; location: number };
  scheduleLocked?: boolean;
}) {
  const field = (
    name: keyof InviteDataValues,
    label: string,
    input: { type?: string; min?: number; maxLength?: number; placeholder?: string },
    options: { required?: boolean; locked?: boolean } = {},
  ) => (
    <div>
      <label htmlFor={`invite-${name}`} className="label">
        {label}
      </label>
      <input
        id={`invite-${name}`}
        value={values[name]}
        onChange={(event) => onChange(name)(event.target.value)}
        required={options.required}
        disabled={options.locked}
        aria-invalid={errors[name] ? true : undefined}
        className="field"
        {...input}
      />
      <FieldError id={`invite-${name}-error`} message={ruleMessage(errors[name])} />
    </div>
  );

  return (
    <div className="form-grid">
      {field(
        'eventName',
        'Nome da festa',
        { maxLength: textLimits.eventName, placeholder: 'Aniversário da vovó Marina' },
        { required: true },
      )}
      {field(
        'location',
        'Local',
        { maxLength: textLimits.location, placeholder: 'Chácara da família, Cotia' },
        { required: true },
      )}
      {field('eventDate', 'Data', { type: 'date' }, { required: true, locked: scheduleLocked })}
      {field('eventTime', 'Hora', { type: 'time' }, { required: true, locked: scheduleLocked })}
      {field(
        'peopleLimit',
        'Máximo de pessoas (opcional)',
        { type: 'number', min: 1, placeholder: 'Sem limite' },
        { locked: scheduleLocked },
      )}
      {field(
        'companionLimit',
        'Acompanhantes por convidado (opcional)',
        { type: 'number', min: 0, placeholder: 'Sem limite' },
        { locked: scheduleLocked },
      )}
    </div>
  );
}
