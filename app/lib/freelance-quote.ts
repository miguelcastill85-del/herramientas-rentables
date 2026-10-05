export const complexityMultipliers = { low: 1, medium: 1.2, high: 1.4 } as const;
export type Complexity = keyof typeof complexityMultipliers;

export type QuoteInput = {
  hours: string;
  hourlyRate: string;
  safety: string;
  externalCosts: string;
  targetMargin: string;
  depositRate: string;
  revisions: string;
  validityDays: string;
  complexity: Complexity;
};

export type QuoteField = Exclude<keyof QuoteInput, 'complexity'>;

export function evaluateQuote(input: QuoteInput) {
  const errors: Partial<Record<QuoteField, string>> = {};
  const values = {} as Record<QuoteField, number>;
  const rules: [QuoteField, number, number, boolean, string][] = [
    ['hours', 0, Infinity, false, 'Ingresa horas mayores que cero.'],
    ['hourlyRate', 0, Infinity, false, 'Ingresa una tarifa mayor que cero.'],
    ['safety', 0, 100, true, 'Usa una contingencia entre 0 y 100%.'],
    ['externalCosts', 0, Infinity, true, 'Ingresa costos externos iguales o mayores que cero.'],
    ['targetMargin', 0, 80, true, 'Usa un margen entre 0 y 80%.'],
    ['depositRate', 0, 100, true, 'Usa un anticipo entre 0 y 100%.'],
    ['revisions', 0, Infinity, true, 'Ingresa un número entero de revisiones igual o mayor que cero.'],
    ['validityDays', 1, Infinity, true, 'Ingresa una vigencia de al menos un día entero.'],
  ];

  for (const [field, minimum, maximum, inclusive, message] of rules) {
    const raw = input[field].trim();
    const value = Number(raw);
    values[field] = value;
    const wholeNumberRequired = field === 'revisions' || field === 'validityDays';
    if (!raw || !Number.isFinite(value) || value > Number.MAX_SAFE_INTEGER ||
      (inclusive ? value < minimum : value <= minimum) || value > maximum ||
      (wholeNumberRequired && !Number.isInteger(value))) errors[field] = message;
  }

  if (Object.keys(errors).length) return { errors, result: null };

  const baseCost = values.hours * values.hourlyRate;
  const adjustedSubtotal = baseCost * complexityMultipliers[input.complexity];
  const contingency = adjustedSubtotal * values.safety / 100;
  const protectedMinimum = adjustedSubtotal + contingency + values.externalCosts;
  const recommendedPrice = protectedMinimum / (1 - values.targetMargin / 100);
  if (!Number.isFinite(recommendedPrice) || recommendedPrice > Number.MAX_SAFE_INTEGER || recommendedPrice < 0.5) {
    errors.hourlyRate = 'Ajusta horas y tarifa para obtener un importe válido en pesos chilenos.';
    return { errors, result: null };
  }

  // El cálculo conserva la fórmula; total, anticipo y saldo se presentan en pesos enteros.
  const quotedPrice = Math.round(recommendedPrice);
  const deposit = Math.round(quotedPrice * values.depositRate / 100);
  const balance = quotedPrice - deposit;
  return {
    errors,
    result: { baseCost, contingency, protectedMinimum, recommendedPrice, quotedPrice, deposit, balance,
      depositRate: values.depositRate, revisions: values.revisions, validityDays: values.validityDays },
  };
}
