---
name: new-part-template
description: Scaffold a new zerocodejs template DSL fixture and its matching Vitest test case, for adding coverage of a new or edge-case {{field}}/z-for pattern
disable-model-invocation: true
---

# New Part Template

zerocodejs part templates are plain HTML strings (`PartData.body`) using a custom DSL — they are not Vue components, so this skill never scaffolds a `.vue` file. It adds one fixture entry plus one matching test case.

## When to use

When adding test coverage for a new or edge-case template DSL pattern — a new field/choice/validation combination, a new `z-*` control attribute usage, or a regression case for a reported bug.

## Steps

1. Determine which DSL feature(s) the template should demonstrate. Use only syntax already documented in `AGENTS.md` → `## テンプレート記法` — do not invent new syntax:
   - Field notation: `{$field:default}`, `{$field?:default}` (optional), `{$field.group:default}` (grouped), `:textarea`, `:rich`, `:image` suffixes
   - Choice notation: `($field:a|b)` (radio), `($field:a,b)` (checkbox), `($field@:a|b)` (select single), `($field@:a,b)` (select multiple), `label=value` pairs
   - Validation: `:required`, `:max=N`, `:readonly`, `:disabled` (combinable, e.g. `:required:max=50`)
   - Backend data: `{@field}`, `{@field:default}`, `{@a.b}` (nested), `{@items[0]}` / `{@items[0].name}` (array), `{@items.length}`, `/path/{placeholder}` (URL)
   - Control attributes: `z-if="key"`, `z-tag="$tag:h1|h2|h3"`, `z-empty="$field"`, `z-for="item in {@items}"`, `z-slot="name"`
2. Add a new key to `sampleTemplates` in `src/__tests__/fixtures/sample-templates.ts`. Follow the existing naming convention (camelCase, named for the feature it demonstrates — e.g. `zEmptyWithGroupedField`) and keep the template minimal: one DSL feature per entry, matching the style of neighboring entries.
3. Add a matching `it(...)` case to the relevant colocated test file (e.g. `src/core/utils/field-extractor.test.ts` for field/choice/validation extraction, `src/core/utils/template-processor.test.ts` for rendering/control-attribute behavior). Follow the existing `describe`/`it` nesting and assertion style already used for that fixture's category — do not introduce a new test file unless no existing file covers that concern.
4. Run `npx vitest run <path-to-test-file>` and confirm the new test passes before finishing.

## Notes

- Keep the fixture and test in sync — every `sampleTemplates` key added here should be exercised by at least one assertion.
- If the requested pattern isn't expressible with the documented DSL, say so rather than inventing new syntax; new syntax is a `template-processor.ts` design change, out of scope for this skill.
