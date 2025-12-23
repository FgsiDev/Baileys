type IdGetter<T> = (item: T) => string
type Mode = 'append' | 'prepend'

function makeOrderedDictionary<T = any>(idGetter: IdGetter<T>) {
	const array: T[] = []
	const dict: Record<string, T> = {}

	const get = (id: string): T | undefined => dict[id]

	const update = (item: T): boolean => {
		const id = idGetter(item)
		const idx = array.findIndex(i => idGetter(i) === id)
		if (idx >= 0) {
			array[idx] = item
			dict[id] = item
			return true
		}
		return false
	}

	const upsert = (item: T, mode: Mode = 'append'): void => {
		const id = idGetter(item)
		if (get(id)) {
			update(item)
		} else {
			if (mode === 'append') {
				array.push(item)
			} else {
				array.unshift(item)
			}
			dict[id] = item
		}
	}

	const remove = (item: T): boolean => {
		const id = idGetter(item)
		const idx = array.findIndex(i => idGetter(i) === id)
		if (idx >= 0) {
			array.splice(idx, 1)
			delete dict[id]
			return true
		}
		return false
	}

	return {
		array,
		get,
		upsert,
		update,
		remove,
		updateAssign: (id: string, update: Partial<T>): boolean => {
			const item = get(id)
			if (item) {
				Object.assign(item as any, update)
				delete dict[id]
				dict[idGetter(item)] = item
				return true
			}
			return false
		},
		clear: (): void => {
			array.splice(0, array.length)
			for (const key of Object.keys(dict)) {
				delete dict[key]
			}
		},
		filter: (contain: (item: T) => boolean): void => {
			let i = 0
			while (i < array.length) {
				if (!contain(array[i])) {
					delete dict[idGetter(array[i])]
					array.splice(i, 1)
				} else {
					i++
				}
			}
		},
		toJSON: (): T[] => array,
		fromJSON: (newItems: T[]): void => {
			array.splice(0, array.length, ...newItems)
			for (const item of newItems) {
				dict[idGetter(item)] = item
			}
		}
	}
}

export default makeOrderedDictionary
