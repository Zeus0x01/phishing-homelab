import { _ as Link, b as require_jsx_runtime, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as totalPoints, o as questions, r as computeScore, u as useLab } from "./store-smL0uvz7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/debrief-DqRsWxFC.js
var import_jsx_runtime = require_jsx_runtime();
function Debrief() {
	const nav = useNavigate();
	const answers = useLab((s) => s.answers);
	const reset = useLab((s) => s.reset);
	const { score, detail } = computeScore(answers);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-bg px-4 py-10 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-2xl space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-primary uppercase",
					children: "Debrief"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-semibold",
					children: "Qualification result"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-5xl tabular-nums text-primary",
					children: [score, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-lg text-muted",
						children: ["/", totalPoints]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted",
					children: [
						"Indicative cutoff ~",
						70,
						". Training scorer only — not the live event."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: detail.map((d) => {
						const q = questions.find((x) => x.id === d.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [q?.prompt, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-1 block font-mono text-xs text-muted",
								children: ["Your answer: ", answers[d.id] || "—"]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: d.ok ? "text-pass" : "text-crit",
								children: d.ok ? d.points : 0
							})]
						}, d.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/lab",
						className: "min-h-11 rounded-md border border-border px-4 py-2 text-sm",
						children: "Review lab"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-bg",
						onClick: () => {
							reset();
							nav({ to: "/" });
						},
						children: "Reset attempt"
					})]
				})
			]
		})
	});
}
//#endregion
export { Debrief as component };
