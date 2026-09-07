import React, { useState } from "react";
import { useLab, mergedQuestions, computeScore } from "@/lib/store";
import { catalog, getLab } from "@/data/campaign";

export default function LabRoute() {
  const {
    labId,
    setLab,
    callsign,
    setCallsign,
    startedAt,
    start,
    answers,
    setAnswer,
    submitted,
    submit,
    reset,
    extra,
  } = useLab();

  const currentLab = getLab(labId);
  const questions = mergedQuestions(labId, extra);
  const scoreResult = submitted ? computeScore(labId, extra, answers) : null;
  const [activeTab, setActiveTab] = useState<"inbox" | "telemetry" | "questions">("inbox");
  const [selectedEmailId, setSelectedEmailId] = useState<string>(currentLab.emails[0]?.id || "");

  const selectedEmail = currentLab.emails.find((e) => e.id === selectedEmailId) || currentLab.emails[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-6">
      {/* Top Banner & Scenario Switcher */}
      <header className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
            {currentLab.badge}
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">{currentLab.title}</h1>
          <p className="text-slate-400 text-sm">{currentLab.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-mono">Scenario:</label>
          <select
            value={labId}
            onChange={(e) => {
              setLab(e.target.value);
              setSelectedEmailId("");
            }}
            disabled={startedAt !== null && !submitted}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          >
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.minutes}m)
              </option>
            ))}
          </select>

          {!startedAt ? (
            <button
              onClick={start}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-1.5 rounded text-sm transition"
            >
              Start Operation
            </button>
          ) : (
            <button
              onClick={reset}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-sm border border-slate-700 transition"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex gap-2 border-b border-slate-800">
        {(["inbox", "telemetry", "questions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition ${
              activeTab === tab
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab} {tab === "questions" && `(${questions.length})`}
          </button>
        ))}
      </nav>

      {/* Workspace Area */}
      <main className="flex-1">
        {/* INBOX TAB */}
        {activeTab === "inbox" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
            {/* Email List */}
            <div className="border border-slate-800 bg-slate-900/50 rounded-lg p-3 overflow-y-auto flex flex-col gap-2">
              <span className="text-xs font-mono text-slate-500 px-2 pb-1">INBOX ARTIFACTS</span>
              {currentLab.emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmailId(email.id)}
                  className={`text-left p-3 rounded-md border text-sm transition ${
                    selectedEmail?.id === email.id
                      ? "bg-slate-800 border-emerald-500/50 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
                  }`}
                >
                  <div className="font-semibold truncate text-slate-200">{email.from}</div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">{email.subject}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">{email.date}</div>
                </button>
              ))}
            </div>

            {/* Email Viewer */}
            <div className="lg:col-span-2 border border-slate-800 bg-slate-900/30 rounded-lg p-6 flex flex-col gap-4 overflow-y-auto">
              {selectedEmail ? (
                <>
                  <div className="border-b border-slate-800 pb-3 flex flex-col gap-1">
                    <h2 className="text-lg font-bold text-slate-100">{selectedEmail.subject}</h2>
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-500">From:</span> {selectedEmail.from}
                    </div>
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-500">To:</span> {selectedEmail.to}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div
                    className="prose prose-invert max-w-none text-sm text-slate-300 bg-slate-950/40 p-4 rounded border border-slate-850"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  />

                  {/* Raw Headers Inspector */}
                  <details className="mt-2 border border-slate-800 rounded bg-slate-950/70 p-3">
                    <summary className="text-xs font-mono text-emerald-400 cursor-pointer select-none">
                      RFC 5322 Raw Headers
                    </summary>
                    <pre className="mt-2 text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap">
                      {selectedEmail.headers}
                    </pre>
                  </details>

                  {/* Attachment Inspector */}
                  {selectedEmail.attachmentContent && (
                    <details className="border border-slate-800 rounded bg-slate-950/70 p-3">
                      <summary className="text-xs font-mono text-amber-400 cursor-pointer select-none">
                        Attachment: {selectedEmail.attachmentName} ({selectedEmail.attachmentType?.toUpperCase()})
                      </summary>
                      <pre className="mt-2 text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap">
                        {selectedEmail.attachmentContent}
                      </pre>
                    </details>
                  )}
                </>
              ) : (
                <div className="text-slate-500 text-sm">Select an artifact to examine.</div>
              )}
            </div>
          </div>
        )}

        {/* TELEMETRY TAB */}
        {activeTab === "telemetry" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-800 bg-slate-900/40 p-4 rounded-lg flex flex-col gap-3">
              <h3 className="text-sm font-mono text-emerald-400 border-b border-slate-800 pb-2">WHOIS LOOKUPS</h3>
              {Object.entries(currentLab.telemetry.whois).map(([domain, data]) => (
                <div key={domain} className="bg-slate-950/60 p-3 rounded border border-slate-800 text-xs font-mono">
                  <div className="text-slate-200 font-bold mb-1">{domain}</div>
                  <div className="text-slate-400">{data}</div>
                </div>
              ))}
            </div>

            <div className="border border-slate-800 bg-slate-900/40 p-4 rounded-lg flex flex-col gap-3">
              <h3 className="text-sm font-mono text-emerald-400 border-b border-slate-800 pb-2">DNS RECORDS</h3>
              {Object.entries(currentLab.telemetry.dns).map(([domain, records]) => (
                <div key={domain} className="bg-slate-950/60 p-3 rounded border border-slate-800 text-xs font-mono">
                  <div className="text-slate-200 font-bold mb-1">{domain}</div>
                  {records.map((r, i) => (
                    <div key={i} className="text-slate-400">{r}</div>
                  ))}
                </div>
              ))}
            </div>

            {currentLab.telemetry.logs && (
              <div className="md:col-span-2 border border-slate-800 bg-slate-900/40 p-4 rounded-lg flex flex-col gap-2">
                <h3 className="text-sm font-mono text-amber-400 border-b border-slate-800 pb-2">REVERSE PROXY / ACCESS LOGS</h3>
                <pre className="text-xs font-mono text-slate-400 bg-slate-950 p-3 rounded overflow-x-auto">
                  {currentLab.telemetry.logs.join("\n")}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === "questions" && (
          <div className="max-w-3xl flex flex-col gap-6">
            {submitted && scoreResult && (
              <div className="p-4 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-200 flex justify-between items-center">
                <span className="font-semibold">Lab Submitted</span>
                <span className="text-lg font-mono font-bold">
                  Score: {scoreResult.score} / {scoreResult.total} pts
                </span>
              </div>
            )}

            {questions.map((q, idx) => {
              const currentAnswer = answers[q.id] || "";
              const detail = scoreResult?.detail.find((d) => d.id === q.id);

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-lg border bg-slate-900/50 flex flex-col gap-3 ${
                    submitted
                      ? detail?.ok
                        ? "border-emerald-600/50"
                        : "border-rose-600/50"
                      : "border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-slate-100">
                      {idx + 1}. {q.prompt}
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {q.points} pts
                    </span>
                  </div>

                  {q.kind === "choice" && q.options ? (
                    <div className="flex flex-col gap-2 mt-2">
                      {q.options.map((opt, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer hover:text-white"
                        >
                          <input
                            type="radio"
                            name={q.id}
                            disabled={submitted}
                            checked={currentAnswer === String(i) || currentAnswer === opt}
                            onChange={() => setAnswer(q.id, String(i))}
                            className="accent-emerald-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      disabled={submitted}
                      value={currentAnswer}
                      placeholder="Type your answer here..."
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      className="mt-2 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                    />
                  )}

                  {submitted && q.explanation && (
                    <div className="text-xs text-slate-400 border-t border-slate-800 pt-2 mt-1">
                      <span className="font-semibold text-slate-300">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}

            {!submitted && (
              <button
                onClick={submit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded text-sm transition"
              >
                Submit Answers for Scoring
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
