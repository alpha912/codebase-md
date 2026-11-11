# Security Policy

## Reporting a Vulnerability

Report suspected vulnerabilities privately through GitHub's
**Report a vulnerability** button on the repository's
[Security tab](https://github.com/alpha912/codebase-md/security). If you cannot
use GitHub's form, write to the contact address in the
[Code of Conduct](CODE_OF_CONDUCT.md#enforcement) with "SECURITY" in the
subject.

Include the extension version (or commit), your VS Code version and platform,
what an attacker can do, and the smallest workspace layout or file that
reproduces it. Please do not open public issues or pull requests for
undisclosed vulnerabilities, and do not attach private code or real
credentials.

The project has one maintainer and reports are handled on a best-effort basis.
You can normally expect a first reply within a week, and a disclosure date
agreed with you once a fix is ready. Reporters are credited in the release
notes unless they ask not to be.

## Supported Versions

Security fixes go into the next release; only the latest release is supported.

| Version | Supported |
| --- | --- |
| Latest 4.x release | Yes |
| 3.x and earlier | No; upgrade to the latest release |

## Scope

CodebaseMD reads files from a workspace folder and writes one document to a
file, the clipboard or an editor. It makes no network requests. The following
are in scope:

- **Leaving the workspace:** any way to make an export include a file outside
  the chosen workspace folder, including through symbolic links, junctions,
  `..` segments or crafted selections.
- **Bypassing exclusions:** content or paths that appear in an export although
  `.gitignore`, `.codebaseignore`, `codebaseMD.exclude`, the size limit or the
  binary check should have removed them.
- **Output injection:** source text that breaks out of a Markdown code fence
  or produces malformed or misleading XML.
- **Git handling:** a repository or Git configuration that makes the extension
  run an external program (diff drivers, textconv filters, pagers, prompts) or
  that exposes excluded content through a diff.
- **Untrusted workspaces:** any Git operation that runs before the workspace
  is trusted.
- **Resource exhaustion:** a workspace that makes an export hang or exhaust
  memory in a way the size limits and cancellation should prevent.
- **Release integrity:** problems in the CI and release workflow.

Out of scope:

- **Secrets that redaction misses.** Redaction is a documented heuristic, not
  a guarantee. Missed patterns are welcome as ordinary bug reports with a
  synthetic example; reports that redaction leaks or logs the *matched values*
  are in scope.
- Vulnerabilities in dependencies that the extension does not reach. Report
  those upstream, and tell us if CodebaseMD exposes them.
- What happens to an export after it leaves the editor, for example the
  handling of pasted text by another tool or service.

## Assurance

What has been done: file collection resolves every path, checks that it stays
inside the workspace folder and rejects symbolic links in every path
component; redaction runs before any transformation and reports only counts;
Markdown fences are sized so embedded backticks cannot close them, and XML
output is escaped, including control characters; Git is invoked without a
shell, with literal pathspecs, with terminal prompts disabled and with
external diff and textconv programs turned off, and only in trusted
workspaces. These behaviours are covered by unit tests. Workflow actions are
pinned to commit hashes, the workflow token is read-only except in the release
job, dependencies are audited in CI, and each release ships with a SHA-256
checksum.

What has not been done: no independent security audit and no fuzzing. Treat
an export as something to review before you share it.
