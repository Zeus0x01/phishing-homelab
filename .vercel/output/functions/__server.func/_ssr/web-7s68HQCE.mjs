import { i as __toESM } from "../_runtime.mjs";
import { _ as Link, b as require_jsx_runtime, z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as LAB_BANNER, u as useLab } from "./store-smL0uvz7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/web-7s68HQCE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WebLure() {
	const mark = useLab((s) => s.markLure);
	const lureTried = useLab((s) => s.lureTried);
	const [email, setEmail] = (0, import_react.useState)("");
	const [pass, setPass] = (0, import_react.useState)("");
	const [otp, setOtp] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-[#f3f3f3] text-[#1b1b1b]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "bg-[#7a1f1f] px-3 py-2 text-center text-xs text-white",
			children: LAB_BANNER
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto mt-10 w-full max-w-md rounded-sm bg-white p-8 shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xl font-semibold",
					children: "Sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-[#5e5e5e]",
					children: "Training clone of a Microsoft-style portal"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-6 space-y-3",
					onSubmit: (e) => {
						e.preventDefault();
						mark();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-sm",
							children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "mt-1 min-h-11 w-full border border-[#8a8886] px-3",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								autoComplete: "off"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-sm",
							children: ["Password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "password",
								className: "mt-1 min-h-11 w-full border border-[#8a8886] px-3",
								value: pass,
								onChange: (e) => setPass(e.target.value),
								autoComplete: "off"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-sm",
							children: ["Security code", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "mt-1 min-h-11 w-full border border-[#8a8886] px-3",
								value: otp,
								onChange: (e) => setOtp(e.target.value),
								autoComplete: "off"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "min-h-11 w-full bg-[#0067b8] text-sm font-medium text-white",
							children: "Next"
						})
					]
				}),
				lureTried && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-2 border border-[#d83b01] bg-[#fff4ce] p-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: "Lab intercept"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "In a real attack this form would relay credentials and the MFA code to an adversary-in-the-middle kit, then send you to the genuine site. Here nothing is stored or transmitted." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs break-all",
							children: "Host: secure-verify.live/login.php"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/lab",
					className: "mt-6 inline-block text-sm text-[#0067b8] underline",
					children: "Return to lab"
				})
			]
		})]
	});
}
//#endregion
export { WebLure as component };
