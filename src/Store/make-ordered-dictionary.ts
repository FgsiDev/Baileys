function makeOrderedDictionary<T>(idGetter: (item: T) => string) {
	const array: T[] = []
	const dict: Record<string, T> = {}

	const get = (id: string): T | undefined => dict[id]

	const rebuildDict = () => {
		for (const k of Object.keys(dict)) delete dict[k]
		for (const item of array) {
			dict[idGetter(item)] = item
		}
	}

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

	const upsert = (item: T, mode: 'append' | 'prepend') => {
		const id = idGetter(item)
		if (dict[id]) {
			update(item)
		} else {
			mode === 'append' ? array.push(item) : array.unshift(item)
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
			const item = dict[id]
			if (!item) return false
			Object.assign(item, update)
			const newId = idGetter(item)
			if (newId !== id) {
				delete dict[id]
				dict[newId] = item
			}
			return true
		},
		clear: () => {
			array.length = 0
			for (const k of Object.keys(dict)) delete dict[k]
		},
		filter: (contain: (item: T) => boolean) => {
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
		toJSON: (): T[] => [...array],
		fromJSON: (newItems: T[]) => {
			array.splice(0, array.length, ...newItems)
			rebuildDict()
		}
	}
}

export default makeOrderedDictionary
