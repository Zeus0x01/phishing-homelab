import { i as __toESM } from "../_runtime.mjs";
import { _ as Link, b as require_jsx_runtime, v as useNavigate, z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as engine, c as sms, d as voice, i as emails, l as totalPoints, n as attachmentSource, o as questions, r as computeScore, s as remainingMs, t as LAB_BANNER, u as useLab } from "./store-smL0uvz7.mjs";
import { a as QrCode, c as Inbox, f as Activity, i as Radio, n as Shield, u as FileSearch } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lab-BXDKZNyc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Timer({ startedAt, onExpire }) {
	const [left, setLeft] = (0, import_react.useState)(() => remainingMs(startedAt));
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => {
			const n = remainingMs(startedAt);
			setLeft(n);
			if (n <= 0) onExpire?.();
		}, 250);
		return () => clearInterval(t);
	}, [startedAt, onExpire]);
	const m = Math.floor(left / 6e4);
	const s = Math.floor(left % 6e4 / 1e3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `font-mono tabular-nums text-sm tracking-wide ${left < 3e5 ? "text-crit" : "text-primary"}`,
		children: [
			String(m).padStart(2, "0"),
			":",
			String(s).padStart(2, "0")
		]
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var tabs = [
	{
		id: "inbox",
		label: "Inbox",
		icon: Inbox
	},
	{
		id: "engine",
		label: "Engine",
		icon: Activity
	},
	{
		id: "attach",
		label: "Attachment",
		icon: FileSearch
	},
	{
		id: "vectors",
		label: "Other vectors",
		icon: QrCode
	},
	{
		id: "exam",
		label: "Questions",
		icon: Shield
	}
];
function Lab() {
	const nav = useNavigate();
	const startedAt = useLab((s) => s.startedAt);
	const submitted = useLab((s) => s.submitted);
	const submit = useLab((s) => s.submit);
	const [tab, setTab] = (0, import_react.useState)("inbox");
	const [sel, setSel] = (0, import_react.useState)("e1");
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const email = emails.find((e) => e.id === sel) ?? emails[0];
	(0, import_react.useEffect)(() => setHydrated(true), []);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { className: "min-h-dvh bg-bg" });
	if (!startedAt) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center bg-bg p-6 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md space-y-4 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Clock has not started."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "text-primary underline",
				children: "Back to briefing"
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "font-mono text-xs tracking-widest text-primary uppercase",
						children: "PhishLab"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden text-muted sm:inline",
						children: "·"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "Nightwire"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-auto flex items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, {
							startedAt,
							onExpire: () => submit()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-10 rounded-md bg-primary px-3 text-sm font-medium text-bg",
							onClick: () => {
								submit();
								nav({ to: "/debrief" });
							},
							children: "Submit"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-b border-warn/30 bg-warn/10 px-4 py-1.5 text-[11px] text-warn",
				children: LAB_BANNER
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex gap-1 overflow-x-auto border-b border-border px-2 py-2",
				children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTab(t.id),
					className: cn("inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm", tab === t.id ? "bg-raised text-fg" : "text-muted"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "size-4" }), t.label]
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1",
				children: [
					tab === "inbox" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InboxPane, {
						email,
						sel,
						setSel
					}),
					tab === "engine" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnginePane, {}),
					tab === "attach" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachPane, {}),
					tab === "vectors" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VectorsPane, {}),
					tab === "exam" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExamPane, { submitted })
				]
			})
		]
	});
}
function AuthPill({ v, label }) {
	const ok = v === "pass";
	const bad = v === "fail";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("rounded px-1.5 py-0.5 font-mono text-[10px] uppercase", ok && "bg-pass/15 text-pass", bad && "bg-crit/15 text-crit", !ok && !bad && "bg-muted/15 text-muted"),
		children: [
			label,
			" ",
			v
		]
	});
}
function InboxPane({ email, sel, setSel }) {
	const [showHdr, setShowHdr] = (0, import_react.useState)(true);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid lg:grid-cols-[280px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "border-b border-border lg:border-r lg:border-b-0",
			children: emails.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setSel(e.id),
				className: cn("flex w-full flex-col items-start gap-0.5 border-b border-border px-4 py-3 text-left", sel === e.id ? "bg-raised" : "bg-transparent"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-sm font-medium",
							children: e.fromName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] text-muted",
							children: e.folder
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate text-xs text-fg",
						children: e.subject
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "line-clamp-1 text-xs text-muted",
						children: e.preview
					})
				]
			}, e.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "min-w-0 p-4 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPill, {
							label: "spf",
							v: email.auth.spf
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPill, {
							label: "dkim",
							v: email.auth.dkim
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPill, {
							label: "dmarc",
							v: email.auth.dmarc
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded bg-raised px-1.5 py-0.5 font-mono text-[10px] text-muted uppercase",
							children: email.kind
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: email.subject
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 break-all text-sm text-muted",
					children: [
						email.fromName,
						" · ",
						email.fromAddr,
						" → ",
						email.to
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs text-muted",
					children: email.date
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "email-body mt-6 space-y-3 text-sm leading-relaxed [&_.urg]:font-medium [&_.urg]:text-crit [&_.mono]:break-all [&_.mono]:font-mono [&_.mono]:text-xs [&_.mono]:text-primary [&_a]:text-primary [&_a]:underline",
					dangerouslySetInnerHTML: { __html: email.html.replace("data-href=\"lure\"", "href=\"/web\"") }
				}),
				email.attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-sm text-warn",
					children: [
						"Attachment: ",
						email.attachments[0].name,
						" — inspect in Attachment tab"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "mt-6 text-xs text-primary underline",
					onClick: () => setShowHdr((s) => !s),
					children: [showHdr ? "Hide" : "Show", " raw headers"]
				}),
				showHdr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-3 max-h-64 overflow-auto rounded-lg border border-border bg-raised p-3 font-mono text-[11px] leading-relaxed text-muted whitespace-pre-wrap",
					children: email.headers
				})
			]
		})]
	});
}
function EnginePane() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-4xl gap-4 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-muted",
						children: ["Campaign ", engine.campaignId]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: "Discover-Phish"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-crit",
						children: engine.status
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-4xl font-medium tabular-nums text-primary",
					children: [engine.score, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-base text-muted",
						children: "/100"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 text-sm font-medium",
					children: "Techniques"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-wrap gap-2",
					children: engine.techniques.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-md bg-raised px-2 py-1 text-xs text-muted",
						children: t
					}, t))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-3 text-sm font-medium",
						children: "URL chain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "space-y-2 font-mono text-xs break-all text-primary",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["0 ", engine.url.original] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["1 ", engine.url.hop1] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["2 ", engine.url.final] })
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-3 text-sm font-medium",
						children: "Infrastructure"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "IP"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-mono",
								children: engine.infra.ip
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "ASN"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: engine.infra.asn }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Domain"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-mono",
								children: engine.infra.domain
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Created"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
								engine.infra.created,
								" (",
								engine.infra.ageDays,
								" days)"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "SSL"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: engine.infra.ssl }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Registrar"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
								engine.infra.registrar,
								" · privacy ",
								engine.infra.privacy ? "on" : "off"
							] })
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					engine.sandbox,
					" Similar mails in org: ",
					engine.similar,
					"."
				]
			})
		]
	});
}
function AttachPane() {
	const mark = useLab((s) => s.markAttach);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-4 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: "Attachment inspector"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Filename claims PDF. Real type is HTML. This is a static sample — it does not execute."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-surface p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-sm",
					children: "Invoice_90441.pdf.html · 18 KB · text/html"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-3 min-h-10 rounded-md border border-border px-3 text-sm",
					onClick: mark,
					children: "Mark inspected"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "overflow-auto rounded-xl border border-border bg-raised p-4 font-mono text-[11px] leading-relaxed text-muted",
				children: attachmentSource
			})
		]
	});
}
function VectorsPane() {
	const qrScanned = useLab((s) => s.qrScanned);
	const markQr = useLab((s) => s.markQr);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-3xl gap-4 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "QR (quishing)"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Printed as a benefits enrollment code. Lab decode only — no camera required."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-28 grid-cols-7 gap-0.5 rounded-md bg-fg p-2",
							"aria-hidden": true,
							children: Array.from({ length: 49 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("rounded-[1px]", (i * 7 + 3) % 5 === 0 ? "bg-bg" : "bg-fg") }, i))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-bg",
							onClick: markQr,
							children: "Decode in lab"
						})]
					}),
					qrScanned && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 break-all font-mono text-xs text-primary",
						children: "Payload: https://secure-verify.live/qr/benefits"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "SMS"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							sms.time,
							" · from ",
							sms.from
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 rounded-lg bg-raised p-3 text-sm",
						children: sms.body
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-medium",
					children: ["Callback / vishing ticket ", voice.ticket]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: voice.note
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm",
				children: [
					"Open the cloned portal:",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/web",
						className: "text-primary underline",
						children: "/web"
					})
				]
			})
		]
	});
}
function ExamPane({ submitted }) {
	const answers = useLab((s) => s.answers);
	const setAnswer = useLab((s) => s.setAnswer);
	const result = (0, import_react.useMemo)(() => computeScore(answers), [answers]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-6 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					questions.length,
					" questions · ",
					totalPoints,
					" points. Submit from the header when done."
				]
			}),
			questions.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "space-y-2 rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("legend", {
						className: "px-1 text-sm font-medium",
						children: [
							i + 1,
							". ",
							q.prompt,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-xs text-muted",
								children: [q.points, " pts"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: q.hint
					}),
					q.kind === "choice" && q.choices ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: q.choices.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 cursor-pointer items-start gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "radio",
								name: q.id,
								className: "mt-1",
								checked: answers[q.id] === c,
								onChange: () => setAnswer(q.id, c),
								disabled: submitted
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c })]
						}, c))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "min-h-11 w-full rounded-md border border-border bg-raised px-3 text-sm",
						value: answers[q.id] ?? "",
						onChange: (e) => setAnswer(q.id, e.target.value),
						disabled: submitted,
						placeholder: "Answer"
					})
				]
			}, q.id)),
			submitted && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-primary",
				children: [
					"Live tally ",
					result.score,
					"/",
					totalPoints
				]
			})
		]
	});
}
//#endregion
export { Lab as component };
