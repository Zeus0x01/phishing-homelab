import { b as require_jsx_runtime, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as LAB_BANNER, u as useLab } from "./store-smL0uvz7.mjs";
import { a as QrCode, d as Clock, l as Globe, o as Paperclip, r as ShieldAlert, s as Mail } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BP5vRmv6.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const nav = useNavigate();
	const start = useLab((s) => s.start);
	const startedAt = useLab((s) => s.startedAt);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10 sm:py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-xs leading-relaxed text-warn",
					children: LAB_BANNER
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-[0.2em] text-primary uppercase",
							children: "Qualification · Individual · 30:00"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-sans text-3xl font-semibold tracking-tight sm:text-4xl",
							children: "Operation Nightwire"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted text-pretty leading-relaxed",
							children: "Hands-on investigation lab. One campaign, many questions. Analyze spoofed and non-spoofed mail, a cloned sign-in page, an HTML attachment lure, QR and SMS samples, then score the exam. Nothing is sent off this device."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						{
							icon: Mail,
							t: "Inbox artifacts",
							d: "Spoofed brand mail, vendor BEC, IT look-alike"
						},
						{
							icon: Globe,
							t: "Web lure",
							d: "Clone portal for analysis only"
						},
						{
							icon: Paperclip,
							t: "Attachment",
							d: "HTML file posing as a PDF"
						},
						{
							icon: QrCode,
							t: "Other vectors",
							d: "QR, SMS, callback ticket"
						}
					].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3 rounded-lg border border-border bg-surface p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(x.icon, { className: "mt-0.5 size-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: x.t
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: x.d
						})] })]
					}, x.t))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 font-medium text-bg",
						onClick: () => {
							if (!startedAt) start();
							nav({ to: "/lab" });
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4" }), startedAt ? "Resume lab" : "Start 30-minute clock"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "inline-flex items-center gap-2 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4" }), " Points per question · highest totals advance"]
					})]
				})
			]
		})
	});
}
//#endregion
export { Home as component };
