import { describe, expect, it } from "vitest"
import { todoSelectSchema, todoInsertSchema } from "@/db/zod-schemas"
import { generateValidRow, generateRowWithout } from "./helpers/schema-test-utils"

describe("todoSelectSchema", () => {
	it("validates a valid row", () => {
		const row = generateValidRow(todoSelectSchema)
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("rejects a row without id", () => {
		const row = generateRowWithout(todoSelectSchema, "id")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("rejects a row without title", () => {
		const row = generateRowWithout(todoSelectSchema, "title")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("rejects a row without completed", () => {
		const row = generateRowWithout(todoSelectSchema, "completed")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("parses ISO date strings for created_at", () => {
		const row = generateValidRow(todoSelectSchema)
		;(row as Record<string, unknown>).created_at = new Date().toISOString()
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.created_at).toBeInstanceOf(Date)
		}
	})
})

describe("todoInsertSchema", () => {
	it("validates a valid insert row", () => {
		const row = generateValidRow(todoInsertSchema)
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("rejects a row without title", () => {
		const row = generateRowWithout(todoInsertSchema, "title")
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(false)
	})
})
