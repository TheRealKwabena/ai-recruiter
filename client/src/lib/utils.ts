type ClassValue =
  | string
  | number
  | null
  | undefined
  | Record<string, boolean | undefined | null>
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const append = (value: ClassValue) => {
    if (!value) return;
    if (typeof value === 'string' || typeof value === 'number') {
      classes.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(append);
      return;
    }
    if (typeof value === 'object') {
      Object.entries(value).forEach(([key, condition]) => {
        if (condition) classes.push(key);
      });
    }
  };

  inputs.forEach(append);

  return classes
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

