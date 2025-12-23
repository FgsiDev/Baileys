export class ObjectRepository<T = any> {
	private entityMap: Map<string, T>

	constructor(entities: Record<string, T> = {}) {
		this.entityMap = new Map<string, T>(Object.entries(entities))
	}

	findById(id: string): T | undefined {
		return this.entityMap.get(id)
	}

	findAll(): T[] {
		return Array.from(this.entityMap.values())
	}

	upsertById(id: string, entity: T): void {
		this.entityMap.set(id, { ...(entity as any) })
	}

	deleteById(id: string): boolean {
		return this.entityMap.delete(id)
	}

	count(): number {
		return this.entityMap.size
	}

	toJSON(): T[] {
		return this.findAll()
	}
}
