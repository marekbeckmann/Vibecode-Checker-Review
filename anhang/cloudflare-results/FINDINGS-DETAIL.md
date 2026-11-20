# Findings Detail — GravelCraft (`wbs-vibecode-checker`)

Zero `confirmed` (`medium`, `high`, or `critical`) findings were recorded in this run because target-controlled execution was blocked on this macOS host (`Darwin 27.3.0 arm64`), which cannot enforce the required OS-level sandbox controls (isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory, process, and disk limits).

All 17 source-verified boundary issues are documented with complete repository-relative traces, evidence, blockers, and bounded validation plans in [NEEDS-VALIDATION.md](NEEDS-VALIDATION.md).
