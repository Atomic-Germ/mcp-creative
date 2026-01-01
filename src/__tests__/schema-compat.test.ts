import { describe, it, expect } from 'vitest';
import { listTools } from '../handlers.js';

function walkSchema(schema: any, path: string[] = []): Array<{schema: any; path: string[]}> {
  const acc: Array<{schema: any; path: string[]}> = [];
  if (!schema || typeof schema !== 'object') return acc;
  acc.push({ schema, path });
  if (schema.properties && typeof schema.properties === 'object') {
    for (const [k, v] of Object.entries(schema.properties)) {
      acc.push(...walkSchema(v, [...path, 'properties', k]));
    }
  }
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    schema.anyOf.forEach((s: any, i: number) => acc.push(...walkSchema(s, [...path, 'anyOf', String(i)])));
  }
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    schema.oneOf.forEach((s: any, i: number) => acc.push(...walkSchema(s, [...path, 'oneOf', String(i)])));
  }
  if (schema.items) {
    acc.push(...walkSchema(schema.items, [...path, 'items']));
  }
  return acc;
}

function schemaToPath(path: string[]) {
  return path.length > 0 ? path.join('.') : '<root>';
}

describe('tool inputSchema compatibility', () => {
  it('detects invalid array types and missing items', () => {
    const tools = listTools().tools;
    const errors: string[] = [];

    for (const t of tools) {
      const schema = t.inputSchema;
      if (!schema) continue;
      for (const { schema: s, path } of walkSchema(schema)) {
        if (!s) continue;
        // rule 1: type must not be an array (e.g., type: ['string', 'array'])
        if (Array.isArray(s.type)) {
          errors.push(`${t.name}: schema at ${schemaToPath(path)} has invalid 'type' array: ${JSON.stringify(s.type)}`);
        }
        // rule 2: if type === 'array' then items must be present
        if (s.type === 'array' && !s.items) {
          errors.push(`${t.name}: schema at ${schemaToPath(path)} is type 'array' but missing 'items'`);
        }
      }
    }

    if (errors.length > 0) {
      console.error('Schema compatibility errors:\n' + errors.join('\n'));
    }

    expect(errors).toEqual([]);
  });
});
