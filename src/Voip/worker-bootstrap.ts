import * as worker_threads_1 from 'node:worker_threads'
import * as path from 'node:path'
import * as os from 'node:os'
import * as fs from 'node:fs'
import * as crypto from 'node:crypto'
import * as vm from 'node:vm'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
// Worker context polyfills. This file is heavily de-typed because it hosts an
// emscripten/browser runtime inside a worker thread where many globals are
// installed at runtime; annotating every member would be brittle.
/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyRecord = Record<PropertyKey, any>
declare const globalThis: AnyRecord
declare const global: AnyRecord
// NOTE: do not declare a binding whose name contains the letters "dirname" or
// "filename" here — the tsc-esm-fix build transform blindly rewrites such
// identifiers into invalid template-literal bindings in emitted ESM.
const _moduleFilename = fileURLToPath(import.meta.url)
const _moduleDirname = path.dirname(_moduleFilename)
const _require = createRequire(import.meta.url)
const typedWorkerData = worker_threads_1.workerData
if (typeof process === 'undefined') {
	global.process = {
		cwd: () => _moduleDirname || '.',
		env: {} as Record<string, string>,
		platform: 'linux',
		version: 'v18.0.0',
		versions: {} as AnyRecord,
		nextTick: (fn: (...args: any[]) => void, ...args: any[]) => setImmediate(fn, ...args),
		exit: (code: any) => {
			throw new Error(`Process exit: ${code}`)
		},
		on: () => this || {},
		off: () => this || {},
		once: () => this || {},
		emit: () => true
	} as any
} else if (!process.cwd) {
	process.cwd = () => _moduleDirname || '.'
}
global.babelHelpers = {
	extends: function (target: any, ...sources: any[]) {
		for (const source of sources) {
			if (source != null) {
				for (const key in source) {
					target[key] = source[key]
				}
			}
		}
		return target
	},
	inheritsLoose: function (subClass: any, superClass: any) {
		subClass.prototype = Object.create(superClass.prototype)
		subClass.prototype.constructor = subClass
		subClass.__proto__ = superClass
	},
	taggedTemplateLiteralLoose: function (strings: any, raw: any) {
		if (!raw) raw = strings.slice(0)
		strings.raw = raw
		return strings
	},
	asyncToGenerator: function (fn: any) {
		return function (this: any) {
			const self = this
			const args = Array.from(arguments)
			return new Promise(function (resolve, reject) {
				const gen = fn.apply(self, args)
				function step(key: string, arg: any) {
					try {
						const info = gen[key](arg)
						const value = info.value
						if (info.done) {
							resolve(value)
						} else {
							Promise.resolve(value).then(
								function (val) {
									step('next', val)
								},
								function (err) {
									step('throw', err)
								}
							)
						}
					} catch (error) {
						reject(error)
					}
				}
				step('next', undefined)
			})
		}
	},
	createClass: function (Constructor: any, protoProps: any[], staticProps: any[]) {
		if (protoProps) {
			for (const descriptor of protoProps) {
				descriptor.enumerable = descriptor.enumerable || false
				descriptor.configurable = true
				if ('value' in descriptor) descriptor.writable = true
				Object.defineProperty(Constructor.prototype, descriptor.key, descriptor)
			}
		}
		if (staticProps) {
			for (const staticDescriptor of staticProps) {
				staticDescriptor.enumerable = staticDescriptor.enumerable || false
				staticDescriptor.configurable = true
				if ('value' in staticDescriptor) staticDescriptor.writable = true
				Object.defineProperty(Constructor, staticDescriptor.key, staticDescriptor)
			}
		}
		return Constructor
	},
	classCallCheck: function (instance: any, Constructor: any) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError('Cannot call a class as a function')
		}
	},
	defineProperty: function (obj: any, key: any, value: any) {
		if (key in obj) {
			Object.defineProperty(obj, key, {
				value: value,
				enumerable: true,
				configurable: true,
				writable: true
			})
		} else {
			obj[key] = value
		}
		return obj
	},
	objectSpread: function (target: any) {
		for (var i = 1; i < arguments.length; i++) {
			var source: any = arguments[i] != null ? arguments[i] : {}
			var ownKeys: any[] = Object.keys(source)
			if (typeof Object.getOwnPropertySymbols === 'function') {
				ownKeys = ownKeys.concat(
					Object.getOwnPropertySymbols(source).filter(function (sym) {
						return Object.getOwnPropertyDescriptor(source, sym)?.enumerable
					})
				)
			}
			ownKeys.forEach(function (key) {
				target[key] = source[key]
			})
		}
		return target
	},
	objectSpread2: function (target: any) {
		for (var i = 1; i < arguments.length; i++) {
			var source: any = arguments[i] != null ? arguments[i] : {}
			if (i % 2) {
				Object.keys(source).forEach(function (key) {
					target[key] = source[key]
				})
			} else if (Object.getOwnPropertyDescriptors) {
				Object.defineProperties(target, Object.getOwnPropertyDescriptors(source))
			} else {
				Object.keys(source).forEach(function (key) {
					Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key) as PropertyDescriptor)
				})
			}
		}
		return target
	},
	wrapNativeSuper: function (Class: any) {
		const _cache = typeof Map === 'function' ? new Map() : undefined
		function Wrapper(this: any) {
			return _construct(Class, arguments, _getPrototypeOf(this).constructor)
		}
		function _construct(Parent: any, args: any, Class: any) {
			if (typeof Reflect !== 'undefined' && Reflect.construct) {
				return Reflect.construct(Parent, args, Class)
			}
			const a: any[] = [null]
			a.push.apply(a, args)
			const BoundClass: any = (Function.bind as any).apply(Parent, a)
			const instance: any = new BoundClass()
			if (Class) Object.setPrototypeOf(instance, Class.prototype)
			return instance
		}
		function _getPrototypeOf(o: any) {
			return (
				Object.getPrototypeOf ||
				function (o: any) {
					return o.__proto__
				}
			)
		}
		if (typeof Class !== 'function') return Class
		if (_cache) {
			if (_cache.has(Class)) return _cache.get(Class)
			_cache.set(Class, Wrapper)
		}
		Wrapper.prototype = Object.create(Class.prototype, {
			constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true }
		})
		return Object.setPrototypeOf(Wrapper, Class)
	},
	isNativeFunction: function (fn: any) {
		return Function.toString.call(fn).indexOf('[native code]') !== -1
	},
	getPrototypeOf: function (o: any) {
		return Object.getPrototypeOf ? Object.getPrototypeOf(o) : o.__proto__
	},
	setPrototypeOf: function (o: any, p: any) {
		return Object.setPrototypeOf ? Object.setPrototypeOf(o, p) : ((o.__proto__ = p), o)
	},
	assertThisInitialized: function (self: any) {
		if (self === void 0) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
		}
		return self
	},
	possibleConstructorReturn: function (self: any, call: any) {
		if (call && (typeof call === 'object' || typeof call === 'function')) return call
		return global.babelHelpers.assertThisInitialized(self)
	},
	inherits: function (subClass: any, superClass: any) {
		if (typeof superClass !== 'function' && superClass !== null) {
			throw new TypeError('Super expression must either be null or a function')
		}
		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: { value: subClass, writable: true, configurable: true }
		})
		if (superClass) Object.setPrototypeOf(subClass, superClass)
	},
	construct: function (Parent: any, args: any, Class: any) {
		if (typeof Reflect !== 'undefined' && Reflect.construct) {
			return Reflect.construct(Parent, args, Class)
		}
		const a: any[] = [null]
		a.push.apply(a, args)
		const Constructor: any = (Function.bind as any).apply(Parent, a)
		const instance = new Constructor()
		if (Class) Object.setPrototypeOf(instance, Class.prototype)
		return instance
	},
	isNativeReflectConstruct: function () {
		if (typeof Reflect === 'undefined' || !Reflect.construct) return false
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}))
			return true
		} catch (e) {
			return false
		}
	}
}
if (typeof global.require === 'undefined') {
	global.require = _require
}
const _originalProcess = global.process
const _originalRequire = global.require
const hideNodeEnv = () => {
	try {
		delete global.process
	} catch (e) {
		global.process = undefined
	}
	try {
		delete global.require
	} catch (e) {
		global.require = undefined
	}
}
const restoreNodeEnv = () => {
	global.process = _originalProcess
	global.require = _originalRequire
}
type ModuleEntry = { factory: (...args: any[]) => any; deps: unknown[]; flags?: any }
type ModuleSlot = { exports: any } | undefined
const __modules: Record<string, ModuleSlot> = {}
const __moduleFactories: Record<string, ModuleEntry> = {}
global.__d = function (name: string, deps: any, factory: any, flags: any) {
	if (typeof deps === 'function') {
		factory = deps
		deps = []
	}
	__moduleFactories[name] = { factory, deps, flags }
}
const importDefaultModule = (name: string) => {
	const value = global.__r(name)
	return value && value.__esModule ? value.default : value
}
const importAllModule = (name: string) => {
	const value = global.__r(name)
	if (value == null) {
		return { default: value }
	}
	if (value.__esModule) {
		return value
	}
	if (typeof value !== 'object' && typeof value !== 'function') {
		return { default: value }
	}
	const namespace: Record<string, any> = {}
	for (const key of Object.keys(value)) {
		namespace[key] = value[key]
	}
	namespace.default = value
	return namespace
}
global.__r = function (name: string) {
	if (__modules[name]) return __modules[name]!.exports
	const moduleFactory = __moduleFactories[name]
	if (!moduleFactory) throw new Error(`Module "${name}" not found`)
	const module = { exports: {} }
	__modules[name] = module as any
	try {
		moduleFactory.factory(global, global.__r, importDefaultModule, importAllModule, null, module, module.exports)
	} catch (e) {
		delete __modules[name]
		throw e
	}
	return module.exports
}
__modules['Promise'] = { exports: Promise }
const bxFunc = function (id: any) {
	return id
}
bxFunc.getURL = function (_id: any, _opts: any) {
	return ''
}
__modules['bx'] = { exports: bxFunc }
__modules['WorkerBundleResource'] = {
	exports: {
		createDedicatedWebWorker: function () {
			return null
		}
	}
}
__modules['WorkerClient'] = { exports: { init: function () {} } }
__modules['WorkerMessagePort'] = {
	exports: { WorkerSyncedMessagePort: function () {} }
}
__modules['WAWebVoipWebWasmWorkerResource'] = { exports: {} }
if (typeof self === 'undefined') global.self = global
global.self = global
if (typeof global.window === 'undefined') global.window = global
global.importScripts = function (...urls: string[]) {
	for (const url of urls) {
		try {
			const code = fs.readFileSync(url, 'utf8')
			eval(code)
		} catch (e) {}
	}
}
if (typeof global.location === 'undefined') {
	global.location = {
		href: _moduleFilename,
		origin: 'file://',
		protocol: 'file:',
		host: '',
		hostname: '',
		port: '',
		pathname: _moduleFilename,
		search: '',
		hash: ''
	}
}
global.postMessage = function (data: any, transfer: any) {
	if (worker_threads_1.parentPort) worker_threads_1.parentPort.postMessage(data, transfer)
}
const messageListeners: Array<(e: { data: any }) => void> = []
global.addEventListener = function (type: string, handler: (e: { data: any }) => void) {
	if (type === 'message') {
		messageListeners.push(handler)
		if (worker_threads_1.parentPort)
			worker_threads_1.parentPort.on('message', data => {
				handler({ data })
			})
	}
}
class SimpleHook<T> {
	listeners: T[] = []
	add = (fn: T): T => {
		this.listeners.push(fn)
		return fn
	}
	remove = (fn: T): boolean => {
		const idx = this.listeners.indexOf(fn)
		if (idx >= 0) {
			this.listeners.splice(idx, 1)
			return true
		}
		return false
	}
	clear = () => {
		this.listeners = []
	}
	call = (data: any) => {
		for (const fn of this.listeners) {
			try {
				;(fn as (data?: any) => void)(data)
			} catch {}
		}
	}
}
class WorkerSyncedMessagePort {
	$1: Record<string, SimpleHook<any>> = {}
	onUnhandledMessage = new SimpleHook()
	onMessage = new SimpleHook()
	onPostMessage = new SimpleHook()
	onError = new SimpleHook()
	$2: any
	name: string
	constructor(port: any, name: string) {
		this.$2 = port
		this.name = name
		if (worker_threads_1.parentPort) {
			worker_threads_1.parentPort.on('message', data => {
				this.onMessageHandler(data)
			})
		}
	}
	onMessageHandler(data: any) {
		try {
			this.onMessage.call(data)
			let handled = false
			const dispatch = (key: any) => {
				if (!key) return
				const hook = this.$1[key]
				if (hook) {
					handled = true
					hook.call(data)
				}
			}
			dispatch(data.type)
			if (data.cmd !== data.type) dispatch(data.cmd)
			if (!handled) this.onUnhandledMessage.call(data)
		} catch (e) {
			this.onError.call(e)
		}
	}
	postMessage(data: any, transfer?: any) {
		this.onPostMessage.call(data)
		if (worker_threads_1.parentPort) {
			if (transfer) worker_threads_1.parentPort.postMessage(data, transfer)
			else worker_threads_1.parentPort.postMessage(data)
		}
	}
	addMessageListener(type: string, fn: (data: any) => void) {
		let hook = this.$1[type]
		if (!hook) {
			hook = new SimpleHook()
			this.$1[type] = hook
		}
		return hook.add(fn as any)
	}
	removeMessageListener(type: string, fn: (data: any) => void) {
		const hook = this.$1[type]
		return !!hook && hook.remove(fn as any)
	}
	removeAllMessageListeners(type: string) {
		const hook = this.$1[type]
		if (hook) hook.clear()
	}
}
let WABinary = {
	Binary: {
		build: function (data: any) {
			return {
				readByteArrayView: function () {
					if (data instanceof Uint8Array) return data
					if (typeof data === 'string') return new TextEncoder().encode(data)
					if (Array.isArray(data)) return new Uint8Array(data)
					if (Buffer.isBuffer(data)) return new Uint8Array(data)
					if (data instanceof ArrayBuffer) return new Uint8Array(data)
					if (ArrayBuffer.isView(data)) {
						return new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
					}
					if (typeof data === 'object' && data !== null && typeof data.length === 'number') {
						const arr = new Uint8Array(data.length)
						for (let i = 0; i < data.length; i++) arr[i] = data[i] || 0
						return arr
					}
					return new Uint8Array(0)
				}
			}
		}
	}
}
let WACryptoHkdfSync = {
	hkdf: function (key: any, salt: any, info: any, length: number) {
		const prk = crypto
			.createHmac('sha256', salt || Buffer.alloc(32))
			.update(key)
			.digest()
		const n = Math.ceil(length / 32)
		const okm = Buffer.alloc(n * 32)
		let prev = Buffer.alloc(0)
		for (let i = 0; i < n; i++) {
			prev = crypto
				.createHmac('sha256', prk)
				.update(Buffer.concat([prev, info || Buffer.alloc(0), Buffer.from([i + 1])]))
				.digest()
			prev.copy(okm, i * 32)
		}
		return new Uint8Array(okm.slice(0, length))
	}
}
class Sha256HMacBuilder {
	hmac: any
	constructor(key: any) {
		this.hmac = crypto.createHmac('sha256', key)
	}
	update(data: any) {
		this.hmac.update(data)
		return this
	}
	finish() {
		return new Uint8Array(this.hmac.digest())
	}
}
const WACryptoSha256HmacBuilder = { Sha256HMacBuilder }
const WAWebVoipPersistentFS = {
	getVoipPersistentDirectoryPath: function () {
		return typedWorkerData?.storageDir || path.join(os.tmpdir(), 'elaina-voip')
	},
	initPersistentFS: async function (_module: any) {
		return Promise.resolve()
	}
}
let WAWebVoipJsWorkerMessageHandler = {
	handleJsWorkerMessage: function () {}
}
const getPreferredLoaderModuleNames = () => {
	return [
		typedWorkerData?.loaderModuleName,
		'WAWebVoipWebWasmLoader',
		'WAWebVoipWebWasmLoader.worker',
		'WAWebVoipWebWasmLoader_ProdLab_internal.worker',
		'WAWebVoipWebWasmLoader_ProdLabvideo_internal.worker'
	].filter((value, index, array) => !!value && array.indexOf(value) === index)
}
const resolveLoaderModule = () => {
	for (const moduleName of getPreferredLoaderModuleNames()) {
		try {
			const loaderModule = global.__r(moduleName)
			const resolved = loaderModule?.default ?? loaderModule
			if (typeof resolved === 'function') {
				return resolved
			}
		} catch (e) {}
	}
	return null
}
const nullthrows = (value: any) => {
	if (value == null) throw new Error('Got unexpected null or undefined')
	return value
}
const asyncToGeneratorRuntime = {
	asyncToGenerator: function (fn: any) {
		return function (this: any, ...args: any[]) {
			const gen = fn.apply(this, args)
			return new Promise((resolve, reject) => {
				function step(key: string, arg: any) {
					try {
						const info = gen[key](arg)
						const value = info.value
						if (info.done) resolve(value)
						else
							Promise.resolve(value).then(
								val => step('next', val),
								err => step('throw', err)
							)
					} catch (e) {
						reject(e)
					}
				}
				step('next', undefined)
			})
		}
	}
}
const e = new WorkerSyncedMessagePort(global.self, 'VoipWebWasmWorker')
global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks = {
	onSignalingXmpp: function (n: any) {
		e.postMessage({
			type: 'waWasmWorkerCompatibleCallback',
			__name: 'onSignalingXmpp',
			peerJid: n.peerJid,
			callId: n.callId,
			xmlPayload: n.xmlPayload
		})
	},
	onCallEvent: function (n: any) {
		e.postMessage({
			type: 'waWasmWorkerCompatibleCallback',
			__name: 'onCallEvent',
			eventType: n.eventType,
			userData: n.userData,
			eventDataJson: n.eventDataJson
		})
	},
	sendDataToRelay: function (n: any) {
		const t = n.data
		const r = n.len
		const o = n.ip
		const a = n.port
		e.postMessage({
			type: 'waWasmWorkerCompatibleCallback',
			__name: 'sendDataToRelay',
			data: t,
			len: r,
			ip: o,
			port: a
		})
		return r || (t ? t.length || t.byteLength || 0 : 0)
	},
	loggingCallback: function (n: any) {
		try {
			e.postMessage(Object.assign({ type: 'waWasmWorkerCompatibleCallback', __name: 'loggingCallback' }, n))
		} catch (err) {}
	},
	initCaptureDriverJS: function (n: any) {
		e.postMessage(Object.assign({ type: 'waWasmWorkerCompatibleCallback', __name: 'initCaptureDriverJS' }, n))
		return 0
	},
	startCaptureJS: function () {
		e.postMessage({
			type: 'waWasmWorkerCompatibleCallback',
			__name: 'startCaptureJS'
		})
		return 0
	},
	stopCaptureJS: function () {
		e.postMessage({
			type: 'waWasmWorkerCompatibleCallback',
			__name: 'stopCaptureJS'
		})
		return 0
	},
	initPlaybackDriverJS: function (n: any) {
		e.postMessage(Object.assign({ type: 'waWasmWorkerCompatibleCallback', __name: 'initPlaybackDriverJS' }, n))
		return 0
	},
	startPlaybackJS: function () {
		e.postMessage({
			type: 'waWasmWorkerCompatibleCallback',
			__name: 'startPlaybackJS'
		})
		return 0
	},
	stopPlaybackJS: function () {
		e.postMessage({
			type: 'waWasmWorkerCompatibleCallback',
			__name: 'stopPlaybackJS'
		})
		return 0
	},
	startVideoCaptureJS: function (n: any) {
		e.postMessage(Object.assign({ type: 'waWasmWorkerCompatibleCallback', __name: 'startVideoCaptureJS' }, n))
		return 0
	},
	stopVideoCaptureJS: function () {
		e.postMessage({
			type: 'waWasmWorkerCompatibleCallback',
			__name: 'stopVideoCaptureJS'
		})
		return 0
	},
	onVideoFrameWasmToJs: function (n: any) {
		e.postMessage(
			{
				type: 'waWasmWorkerCompatibleCallback',
				__name: 'onVideoFrameWasmToJs',
				userJid: n.userJid,
				frameBuffer: n.frameBuffer,
				width: n.width,
				height: n.height,
				orientation: n.orientation,
				format: n.format,
				timestamp: n.timestamp,
				isKeyFrame: n.isKeyFrame
			},
			[n.frameBuffer]
		)
	},
	startDesktopCaptureJS: function (n: any) {
		e.postMessage(Object.assign({ type: 'waWasmWorkerCompatibleCallback', __name: 'startDesktopCaptureJS' }, n))
		return 0
	},
	stopDesktopCaptureJS: function () {
		e.postMessage({
			type: 'waWasmWorkerCompatibleCallback',
			__name: 'stopDesktopCaptureJS'
		})
		return 0
	},
	cryptoHkdfExtractWithSaltAndExpand: function (t: any) {
		const i = new Uint8Array(t.key_)
		const l = t.salt_ ? new Uint8Array(t.salt_) : undefined
		const s = WABinary.Binary.build(t.info_).readByteArrayView()
		return WACryptoHkdfSync.hkdf(i, l, s, t.length)
	},
	hmacSha256KeyGenerator: function (t: any) {
		const r = new Uint8Array(t.data_)
		const a = new Uint8Array(t.key_)
		return new Sha256HMacBuilder(a).update(r).finish()
	},
	isParticipantKnownContact: function (_t: any) {
		return false
	},
	getPersistentDirectoryPath: function () {
		return WAWebVoipPersistentFS.getVoipPersistentDirectoryPath()
	},
	getBrowserAudioProcessingStatus: function () {
		return 7
	},
	getBweModelPath: function () {
		return null
	},
	videoFrameConsumed: function () {},
	dataChannelStateCallback: function () {}
}
let wasmLoader: any = null
if (typedWorkerData && (typedWorkerData.loaderCode || typedWorkerData.workerModulesCode)) {
	try {
		const modulePrelude = 'var __d = global.__d, __r = global.__r;\n'
		const savedCallbacks = global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks
		if (typedWorkerData.workerModulesCode) {
			const workerScript = new vm.Script(modulePrelude + typedWorkerData.workerModulesCode, {
				filename: 'workerModulesCode-SEM22icu2S7.js'
			})
			workerScript.runInThisContext()
		}
		if (typedWorkerData.loaderCode) {
			const loaderScript = new vm.Script(modulePrelude + typedWorkerData.loaderCode, {
				filename: 'loaderCode-1eFv_3F3hOU.js'
			})
			loaderScript.runInThisContext()
		}
		if (!global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks?.loggingCallback) {
			global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks = savedCallbacks
			if (global.self !== global.self) {
				global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks = savedCallbacks
			}
		}
		if (global.self !== global.self) {
			if (global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks) {
				global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks = global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks
			} else if (global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks) {
				global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks = global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks
			}
			global.self = global.self
		}
		wasmLoader = resolveLoaderModule()
		try {
			const jsWorkerModule = global.__r('WAWebVoipJsWorkerMessageHandler')
			if (jsWorkerModule) {
				WAWebVoipJsWorkerMessageHandler = jsWorkerModule.default ?? jsWorkerModule
			}
		} catch (e) {}
	} catch (e) {}
}
if (!wasmLoader) {
	const resourcesPath = typedWorkerData?.resourcesPath || path.join(_moduleDirname, 'wasm-resources')
	const rsrcPath = path.join(resourcesPath, 'loader.js')
	if (fs.existsSync(rsrcPath)) {
		try {
			const loaderCode = fs.readFileSync(rsrcPath, 'utf8')
			const savedCallbacks = global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks
			const script = new vm.Script(loaderCode, { filename: rsrcPath })
			script.runInThisContext()
			if (!global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks?.loggingCallback) {
				global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks = savedCallbacks
			}
			wasmLoader = resolveLoaderModule()
		} catch (e) {}
	}
}
let s: AnyRecord = {}
let u = false
let _: any = null
let jsWorkerRawVideoFramePtr = 0
let jsWorkerRawVideoFrameSize = 0
const c = (condition: any, msg: any) => {
	if (!condition) throw 'Assertion failed: ' + msg
}
const d = (..._args: any[]) => {}
const m = (...args: any[]) => {
	const text = args.join(' ')
	global.postMessage({
		cmd: 'alert',
		text: text,
		threadId: s._pthread_self ? s._pthread_self() : undefined
	})
}
const p = d
global.self.alert = m
s.instantiateWasm = function (imports: any, successCallback: any) {
	const wasmModule = nullthrows(s.wasmModule)
	s.wasmModule = null
	const instance = new WebAssembly.Instance(wasmModule, imports)
	return successCallback(instance)
}
global.self.onunhandledrejection = function (event: any) {
	throw event.reason ?? event
}
const getActiveWasmModule = () => {
	return _ || global.self.__waModule || s
}
const releaseJsWorkerRawVideoFrameBuffer = (moduleRef: any) => {
	if (jsWorkerRawVideoFramePtr && moduleRef && typeof moduleRef._free === 'function') {
		try {
			moduleRef._free(jsWorkerRawVideoFramePtr)
		} catch {}
	}
	jsWorkerRawVideoFramePtr = 0
	jsWorkerRawVideoFrameSize = 0
}
const handleRawVideoFrameOnJsWorker = (msg: any) => {
	const moduleRef = getActiveWasmModule()
	const sendFrameFn = msg?.useDesktopCapture ? moduleRef?.onDesktopCaptureDataFromJs : moduleRef?.onVideoDataFromJs
	const frameBuffer = msg?.frameBuffer
	const width = Math.max(0, Math.trunc(Number(msg?.width || 0)))
	const height = Math.max(0, Math.trunc(Number(msg?.height || 0)))
	const fps = Math.max(1, Math.trunc(Number(msg?.fps || 0)) || 1)
	const orientation = Math.trunc(Number(msg?.orientation || 0))
	const format = Math.trunc(Number(msg?.format || 0))
	const timestamp = Math.trunc(Number(msg?.timestamp || 0))
	if (
		!moduleRef ||
		typeof moduleRef._malloc !== 'function' ||
		typeof moduleRef._free !== 'function' ||
		typeof sendFrameFn !== 'function' ||
		!(frameBuffer instanceof ArrayBuffer || ArrayBuffer.isView(frameBuffer))
	) {
		return
	}
	const bytes = ArrayBuffer.isView(frameBuffer)
		? new Uint8Array(frameBuffer.buffer, frameBuffer.byteOffset, frameBuffer.byteLength)
		: new Uint8Array(frameBuffer)
	if (bytes.byteLength === 0 || width <= 0 || height <= 0) {
		return
	}
	if (!jsWorkerRawVideoFramePtr || jsWorkerRawVideoFrameSize < bytes.byteLength) {
		releaseJsWorkerRawVideoFrameBuffer(moduleRef)
		jsWorkerRawVideoFramePtr = Number(moduleRef._malloc(bytes.byteLength)) || 0
		jsWorkerRawVideoFrameSize = jsWorkerRawVideoFramePtr ? bytes.byteLength : 0
	}
	if (!jsWorkerRawVideoFramePtr || jsWorkerRawVideoFrameSize < bytes.byteLength) {
		return
	}
	moduleRef.GROWABLE_HEAP_U8().set(bytes, jsWorkerRawVideoFramePtr)
	try {
		sendFrameFn.call(moduleRef, jsWorkerRawVideoFramePtr, bytes.byteLength, width, height, fps, format, orientation)
	} catch (error) {
		if ((error as any)?.name !== 'BindingError') {
			throw error
		}
		try {
			sendFrameFn.call(moduleRef, jsWorkerRawVideoFramePtr, bytes.byteLength, width, height, fps, format)
		} catch (legacyError) {
			if ((legacyError as any)?.name !== 'BindingError') {
				throw legacyError
			}
			sendFrameFn.call(
				moduleRef,
				jsWorkerRawVideoFramePtr,
				bytes.byteLength,
				width,
				height,
				orientation,
				format,
				timestamp
			)
		}
	}
}
function f(t: any) {
	try {
		if (t.cmd === 'load') {
			const wasmModule = t.wasmModule
			const wasmMemory = t.wasmMemory
			const workerID = t.workerID
			const handlers = t.handlers
			const pendingMessages: any[] = []
			function g(msg: any) {
				pendingMessages.push(msg)
			}
			e.removeMessageListener('cmd', f as any)
			e.addMessageListener('cmd', g as any)
			global.self.startWorker = function (module: any) {
				global.self.__waModule = module
				global.__waModule = module
				s = module
				e.postMessage({ type: 'cmd', cmd: 'loaded' })
				for (const msg of pendingMessages) f(msg)
				e.removeMessageListener('cmd', g as any)
				e.addMessageListener('cmd', f as any)
			}
			s.wasmModule = wasmModule
			function h(name: string) {
				s[name] = function () {
					const args = Array.from(arguments as any)
					e.postMessage({
						type: 'cmd',
						cmd: 'callHandler',
						callHandler: { handler: name, args: args }
					})
				}
			}
			for (const handler of handlers) h(handler)
			s.wasmMemory = wasmMemory
			s.buffer = s.wasmMemory.buffer
			s.workerID = workerID
			s.ENVIRONMENT_IS_PTHREAD = true
			if (!s.WhatsAppVoipWasmWorkerCompatibleCallbacks) {
				s.WhatsAppVoipWasmWorkerCompatibleCallbacks = global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks
			}
			if (wasmLoader) {
				hideNodeEnv()
				wasmLoader(s).then(
					asyncToGeneratorRuntime.asyncToGenerator(function* (module: any) {
						if (!module.WhatsAppVoipWasmWorkerCompatibleCallbacks) {
							module.WhatsAppVoipWasmWorkerCompatibleCallbacks = global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks
						}
						if (!s.WhatsAppVoipWasmWorkerCompatibleCallbacks?.loggingCallback) {
							s.WhatsAppVoipWasmWorkerCompatibleCallbacks = global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks
						}
						_ = module
						try {
							yield WAWebVoipPersistentFS.initPersistentFS(_)
						} catch (err) {}
					})
				)
			} else {
				e.postMessage({ type: 'cmd', cmd: 'loaded' })
			}
		} else if (t.cmd === 'run') {
			const pthread_ptr = t.pthread_ptr
			if (s.__emscripten_thread_init) s.__emscripten_thread_init(pthread_ptr, 0, 0, 1)
			if (s.__emscripten_thread_mailbox_await) s.__emscripten_thread_mailbox_await(pthread_ptr)
			c(!!pthread_ptr, 'pthread_ptr is required in event ' + t.cmd)
			if (s.establishStackSpace) s.establishStackSpace()
			if (s.PThread) s.PThread.receiveObjectTransfer(t)
			if (s.PThread) s.PThread.threadInitTLS()
			if (!u) {
				if (s.__embind_initialize_bindings) s.__embind_initialize_bindings()
				u = true
			}
			try {
				if (s.invokeEntryPoint) s.invokeEntryPoint(t.start_routine, t.arg)
			} catch (err) {
				if (err !== 'unwind') throw err
			}
		} else if (t.cmd === 'cancel') {
			if (s._pthread_self && s._pthread_self()) {
				if (s.__emscripten_thread_exit) s.__emscripten_thread_exit(-1)
			}
		} else if (t.target !== 'setimmediate') {
			if (t.cmd === 'checkMailbox') {
				if (u && s.checkMailbox) s.checkMailbox()
			} else if (t.cmd === 'jsWorkerCmd') {
				return
			} else if (t.cmd) {
				p('worker.js received unknown command ' + t.cmd)
				p(t)
			}
		}
	} catch (err: any) {
		p('worker.js onmessage() captured an uncaught exception: ' + err)
		if (err?.stack) p(err.stack)
		if (s.__emscripten_thread_crashed) s.__emscripten_thread_crashed()
		throw err
	}
}
e.addMessageListener('cmd', f)
e.addMessageListener('jsWorkerCmd', function (msg: any) {
	try {
		if (msg?.jsWorkerCmd === 'pushRawVideoFrame') {
			return handleRawVideoFrameOnJsWorker(msg)
		}
		if (msg?.jsWorkerCmd === 'releaseRawVideoFrameBuffer') {
			return releaseJsWorkerRawVideoFrameBuffer(getActiveWasmModule())
		}
		return (WAWebVoipJsWorkerMessageHandler as any).handleJsWorkerMessage(_ as any, msg)
	} catch (err) {
		throw err
	}
})
e.addMessageListener('waWasmWorkerCompatibleCallback', function (msg: any) {
	const callbackName = msg.__name
	if (!callbackName) return
	if (!global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks) return
	if (typeof global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks[callbackName] !== 'function') return
	try {
		if (['startCaptureJS', 'startPlaybackJS', 'stopCaptureJS', 'stopPlaybackJS'].includes(callbackName)) {
			global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks[callbackName]()
		} else {
			const args: Record<string, any> = {}
			for (const key in msg) {
				if (key !== 'type' && key !== '__name' && !key.startsWith('__')) args[key] = msg[key]
			}
			global.self.WhatsAppVoipWasmWorkerCompatibleCallbacks[callbackName](args)
		}
	} catch (err) {}
})
if (worker_threads_1.parentPort) {
	worker_threads_1.parentPort.postMessage({ type: 'worker_ready' })
}
