import {
	Badge,
	Box,
	Button,
	Checkbox,
	Container,
	Flex,
	Heading,
	IconButton,
	Spinner,
	Text,
	TextField,
} from "@radix-ui/themes";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, Inbox, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { todosCollection } from "@/db/collections/todos";
import type { Todo } from "@/db/zod-schemas";

export const Route = createFileRoute("/")({
	ssr: false,
	loader: async () => {
		await todosCollection.preload();
		return null;
	},
	component: TodoPage,
});

type Filter = "all" | "active" | "completed";

function TodoPage() {
	const [newTitle, setNewTitle] = useState("");
	const [filter, setFilter] = useState<Filter>("all");

	const { data: todos, isLoading } = useLiveQuery(
		(q) => {
			let query = q.from({ todo: todosCollection });
			if (filter === "active") {
				query = query.where(({ todo }) =>
					eq(todo.completed, false),
				) as typeof query;
			} else if (filter === "completed") {
				query = query.where(({ todo }) =>
					eq(todo.completed, true),
				) as typeof query;
			}
			return query.orderBy(({ todo }) => todo.created_at, "asc");
		},
		[filter],
	);

	const { data: allTodos } = useLiveQuery(
		(q) => q.from({ todo: todosCollection }),
		[],
	);
	const activeCount = allTodos?.filter((t) => !t.completed).length ?? 0;
	const completedCount = allTodos?.filter((t) => t.completed).length ?? 0;

	const handleAdd = () => {
		const title = newTitle.trim();
		if (!title) return;
		todosCollection.insert({
			id: crypto.randomUUID(),
			title,
			completed: false,
			created_at: new Date(),
			updated_at: new Date(),
		});
		setNewTitle("");
	};

	const handleToggle = (todo: Todo) => {
		todosCollection.update(todo.id, (draft) => {
			draft.completed = !draft.completed;
			draft.updated_at = new Date();
		});
	};

	const handleDelete = (id: string) => {
		todosCollection.delete(id);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") handleAdd();
	};

	return (
		<Container size="2" py="6">
			<Flex direction="column" gap="5">
				{/* Header */}
				<Flex justify="between" align="center">
					<Flex align="center" gap="2">
						<CheckSquare size={24} color="var(--violet-9)" />
						<Heading size="7">Todos</Heading>
					</Flex>
					<Flex gap="2">
						<Badge variant="soft" color="blue">
							{activeCount} active
						</Badge>
						<Badge variant="soft" color="green">
							{completedCount} done
						</Badge>
					</Flex>
				</Flex>

				{/* Add input */}
				<Flex gap="2">
					<Box style={{ flex: 1 }}>
						<TextField.Root
							placeholder="What needs to be done?"
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							onKeyDown={handleKeyDown}
							size="3"
						/>
					</Box>
					<Button size="3" onClick={handleAdd} disabled={!newTitle.trim()}>
						<Plus size={16} />
						Add
					</Button>
				</Flex>

				{/* Filter tabs */}
				<Flex gap="2">
					{(["all", "active", "completed"] as Filter[]).map((f) => (
						<Button
							key={f}
							variant={filter === f ? "solid" : "soft"}
							color={filter === f ? "violet" : "gray"}
							size="2"
							onClick={() => setFilter(f)}
							style={{ textTransform: "capitalize" }}
						>
							{f}
						</Button>
					))}
				</Flex>

				{/* Todo list */}
				{isLoading ? (
					<Flex align="center" justify="center" py="9">
						<Spinner size="3" />
					</Flex>
				) : todos && todos.length === 0 ? (
					<Flex direction="column" align="center" gap="3" py="9">
						<Inbox size={48} strokeWidth={1} color="var(--gray-8)" />
						<Text size="3" color="gray">
							{filter === "all"
								? "No todos yet. Add one above!"
								: filter === "active"
									? "No active todos."
									: "No completed todos."}
						</Text>
					</Flex>
				) : (
					<Flex direction="column" gap="2">
						{todos?.map((todo) => (
							<TodoItem
								key={todo.id}
								todo={todo}
								onToggle={handleToggle}
								onDelete={handleDelete}
							/>
						))}
					</Flex>
				)}
			</Flex>
		</Container>
	);
}

function TodoItem({
	todo,
	onToggle,
	onDelete,
}: {
	todo: Todo;
	onToggle: (todo: Todo) => void;
	onDelete: (id: string) => void;
}) {
	return (
		<Flex
			align="center"
			gap="3"
			p="3"
			style={{
				background: "var(--color-panel-solid)",
				border: "1px solid var(--gray-4)",
				borderRadius: "var(--radius-3)",
				transition: "background 0.15s",
			}}
		>
			<Checkbox
				checked={todo.completed}
				onCheckedChange={() => onToggle(todo)}
				size="2"
			/>
			<Text
				size="3"
				style={{
					flex: 1,
					textDecoration: todo.completed ? "line-through" : "none",
					color: todo.completed ? "var(--gray-9)" : undefined,
				}}
			>
				{todo.title}
			</Text>
			<IconButton
				size="1"
				variant="ghost"
				color="red"
				onClick={() => onDelete(todo.id)}
				aria-label="Delete todo"
			>
				<Trash2 size={14} />
			</IconButton>
		</Flex>
	);
}
