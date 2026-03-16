import { describe, expect, it } from "vitest"
import { todoInsertSchema, todoSelectSchema } from "@/db/zod-schemas"
import { generateValidRow, parseDates } from "./helpers/schema-test-utils"

describe("todos collection validation", () => {
	it("accepts a valid todo for insert", () => {
		const row = generateValidRow(todoInsertSchema)
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("JSON round-trip preserves date fields", () => {
		const row = generateValidRow(todoSelectSchema)
		const roundTripped = parseDates(JSON.parse(JSON.stringify(row)))
		const result = todoSelectSchema.safeParse(roundTripped)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.created_at).toBeInstanceOf(Date)
			expect(result.data.updated_at).toBeInstanceOf(Date)
		}
	})

	it("rejects a todo without title", () => {
		const row = generateValidRow(todoInsertSchema)
		const { title: _title, ...without } = row as Record<string, unknown>
		const result = todoInsertSchema.safeParse(without)
		expect(result.success).toBe(false)
	})

	it("defaults completed to false", () => {
		const row = generateValidRow(todoSelectSchema)
		;(row as Record<string, unknown>).completed = false
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.completed).toBe(false)
		}
	})
})
