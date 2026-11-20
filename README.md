# dsh-plugin-compat-lab

**Verify a plugin really loads, runs three scenarios and uninstalls cleanly in an isolated profile; keep a clear version matrix.**

This is one of 14 read-only observability plugins for the DSH agent lifecycle (theme: **Plugin Compatibility Lab**). It reads only metadata from session events — never prompts, tool bodies, or file contents — and makes no network calls.

## Install

```powershell
dsh plugin --profile web add dsh-plugin-compat-lab
```

Requires Node `^22.19.0 || >=24` and DSH `>=0.2.0-rc.2 <0.3.0`.

## 30-second demo

1. Use DSH normally for a few turns.
2. In any session, type `/compat-lab`.
3. You get a compact, read-only report; use `/compat-lab --json` for machine-readable output.

```text
[compat-lab] 0/0 plugin(s) clean · 0 scenario(s) · 0 residue finding(s)
  no install/uninstall events observed yet
```

## What it reads

Session event metadata only: event types, tool names, token counts, and route names. Credential-looking values are redacted before display. No file contents or prompts are read, stored, or transmitted.

## License

MIT — SSHOOTING.
