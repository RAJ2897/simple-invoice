import type { ValueTransformer } from 'typeorm';

/** Postgres returns NUMERIC as a string to avoid precision loss; amounts here fit safely in a JS number. */
export const numericTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : Number(value),
};
