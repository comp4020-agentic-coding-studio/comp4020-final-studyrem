// Who did what, to stdout: `flyctl logs -a <repo>` is the only thing that
// has to read this. One line per action, event first so it's easy to grep.
export function audit(event: string, fields: Record<string, string | undefined> = {}): void {
  const parts = Object.entries(fields)
    .filter((e): e is [string, string] => e[1] !== undefined)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`);
  console.log(["audit", `event=${event}`, ...parts].join(" "));
}
