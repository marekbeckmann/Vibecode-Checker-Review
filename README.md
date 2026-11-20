# Review des *Vibecode-Checker* von *BYB Labs × WBS.LEGAL*

> [!IMPORTANT]
> *German/Deutsch:* Die Webanwendung, die in diesem Test genutzt wurde, ist vollständig durch ein Sprachmodell (`Claude Sonnet 5.5 (Medium)`) entwickelt worden. Das Sprachmodell hat auch die Beschreibungen, Fundstellen und Schweregrade in den Tabellen erstellt. Die Auswertung (welches Tool was gefunden hat) und die Interpretation der Ergebnisse wurden vollständig von einem Menschen durchgeführt. Alle Zitate von Websites sind mit einem Verweis auf ihre Quelle und dem Datum des letzten Aufrufs gekennzeichnet. Eine Kopie der Website des Vibecode-Checkers zum Zeitpunkt des letzten Aufrufs sowie die Reports beider Tools liegen im [Anhang](#anhang--appendix).
>
> *English/Englisch:* The web application used in this test was developed entirely by a language model (`Claude Sonnet 5.5 (Medium)`). The language model also wrote the descriptions, locations and severities in the tables. The evaluation (which tool found what) and the interpretation of the results were carried out entirely by a human. All quotes from websites are marked with a reference to their source and the date of last access. A copy of the Vibecode-Checker website as of the time of last access and the reports of both tools are included in the [appendix](#anhang--appendix).

---

*See english version [below](#what-is-the-vibecode-checker-by-byb-labs--wbslegal)*

- [Review des *Vibecode-Checker* von *BYB Labs × WBS.LEGAL*](#review-des-vibecode-checker-von-byb-labs--wbslegal)
  - [Was ist der *Vibecode-Checker* von *BYB Labs × WBS.LEGAL*](#was-ist-der-vibecode-checker-von-byb-labs--wbslegal)
    - [Kosten](#kosten)
  - [Vergleich](#vergleich)
    - [Methodik](#methodik)
    - [Einfach](#einfach)
    - [Moderat](#moderat)
    - [Schwer](#schwer)
    - [Sehr schwer](#sehr-schwer)
    - [Compliance](#compliance)
    - [Zusätzlich gefunden](#zusätzlich-gefunden)
  - [Fazit](#fazit)
  - [What is the *Vibecode-Checker* by *BYB Labs × WBS.LEGAL*](#what-is-the-vibecode-checker-by-byb-labs--wbslegal)
    - [Costs](#costs)
  - [Comparison](#comparison)
    - [Methodology](#methodology)
    - [Easy](#easy)
    - [Moderate](#moderate)
    - [Hard](#hard)
    - [Very hard](#very-hard)
    - [Compliance Issues](#compliance-issues)
    - [Additional findings](#additional-findings)
  - [Conclusion](#conclusion)
  - [Anhang / Appendix](#anhang--appendix)
    - [Selbst testen / How to run](#selbst-testen--how-to-run)
      - [Setup](#setup)
      - [Demo Daten / Demo Data](#demo-daten--demo-data)
    - [Prompt(s)](#prompts)
    - [Website Vibecode-Checker](#website-vibecode-checker)
    - [Report Vibecode-Checker](#report-vibecode-checker)
    - [Report Cloudflare Skill](#report-cloudflare-skill)

## Was ist der *Vibecode-Checker* von *BYB Labs × WBS.LEGAL*

Der [Vibecode-Checker](https://vibecode-checker.de) (derzeit als Beta gekennzeichnet) soll Menschen, die Anwendungen mit Hilfe künstlicher Intelligenz (ChatGPT, Claude etc.) entwickeln, dabei helfen, Sicherheitslücken und ähnliche Probleme in ihren Anwendungen aufzudecken, um sie vor rechtlichen Konsequenzen zu schützen. Betrieben wird das Tool von der BYB Agency GmbH (BYB Labs); WBS.LEGAL übernimmt die Rechtsberatung in einem separaten Termin.

> Der Free Scan zeigt dir, was technisch und rechtlich vor dem Livegang noch fehlt. Dein Quelltext bleibt dabei in deinem Browser.
>
> *https://vibecode-checker.de, zuletzt aufgerufen am 20.11.2026*

### Kosten

Mit Stand 20.11.2026 bietet der [Vibecode-Checker](https://vibecode-checker.de) drei Preisstufen: den Free Scan (0 €), den Quick Scan (49 € pro Monat) und den Deep Scan (99 € pro Monat). Für den hier ausgeführten Test wurde die kostenfreie Version genutzt, daher beziehen sich alle Resultate nur auf diese. Über die anderen Scans kann und wird keine Aussage getroffen. In der kostenfreien Version wirbt der Scan mit folgenden Funktionen:
- Technischer Durchlauf und Gesamtbild als Balken
- Je zwei Blocker und Risiken und zwei bestandene Prüfungen
- Sammel-Prompt für die gezeigten Probleme

Die genauen Resultate für die hier veröffentlichte Webapp werden [später](#vergleich) gezeigt und erläutert. Wir vergleichen den [Vibecode-Checker](https://vibecode-checker.de) mit dem von [Cloudflare](https://www.cloudflare.com) veröffentlichten [security-audit-skill](https://github.com/cloudflare/security-audit-skill), der auf GitHub kostenfrei zur Verfügung steht und in Kombination mit einem Sprachmodell wie bspw. [Claude](https://claude.ai) genutzt werden kann. Für diesen Vergleich wurde aus Kostengründen `Gemini 4 Hydrogen (Medium)` als Sprachmodell gewählt.

Der Lauf des Cloudflare Skills verbrauchte insgesamt rund 147,5k Input-, 61,9k Output- und 8,2k Thinking-Tokens. Er lief über ein bestehendes Gemini-Pro-Abo und verursachte daher keine zusätzlichen Kosten. Zu den [API-Preisen](https://aistudio.google.com/docs/pricing) für `Gemini 4 Hydrogen` (1,50 US-$ Input bzw. 7,50 US-$ Output inkl. Thinking je 1 Mio. Tokens, zuletzt aufgerufen am 20.11.2026) entspräche das rund 0,75 US-$.

## Vergleich

Das Sprachmodell, das die Webanwendung erstellt hat, wurde instruiert, *absichtlich* Sicherheits- und Complianceverstöße einzubauen. Im Folgenden befindet sich eine Übersicht der geplant eingebauten Sicherheitslücken, deren Einstufung und jeweils, welches Tool sie gefunden bzw. nicht gefunden hat. Lücken, die nicht geplant waren, aber trotzdem gefunden wurden, stehen unter [Zusätzlich gefunden](#zusätzlich-gefunden).

### Methodik

- **Vibecode-Checker:** Hochgeladen wurde [`gravel-store.zip`](./gravel-store.zip) (Quellcode inkl. `node_modules/` und Datenbank, ohne `README.md` und Planungsdateien). Die Adresse der laufenden App konnte nicht angegeben werden, da sie nur lokal läuft. Laut Report wurden deshalb 41 weitere Prüfpunkte nicht geprüft. Laut Website prüft der Free Scan anhand der Adresse unter anderem „Sicherheit, Impressum, Datenschutz“ der Seite; Security-Header (E1), Impressum (C1) und Datenschutzerklärung (C2) konnten also gar nicht geprüft werden.
- **Kostenfreie Version:** Der Free Scan zeigt höchstens zwei Blocker, zwei Risiken und zwei bestandene Prüfungen. Laut Report stehen aber nur 2 von 26 entschiedenen Prüfpunkten gegen die App (1 Blocker, 1 Risiko). Es wurden also keine weiteren Befunde wegen der Begrenzung der kostenfreien Version ausgeblendet.
- **Fälschlich als „erfüllt“ bewertet:** Der Vibecode-Checker hat zwei Prüfungen ausdrücklich als „ERFÜLLT“ eingestuft: „Deine eigene Schnittstelle nimmt nicht von jeder fremden Seite Anfragen an“ und „Keine Serverfunktion gefunden, die ohne Aufruferprüfung schreibt und jede Herkunft annimmt“. Beides trifft nicht zu (siehe H2). Die Lücke wurde also nicht nur übersehen, sondern als sicher bestätigt.
- **Cloudflare Skill:** `README.md`, `AGENTS.md`, `PLAN.md` und `TODO.md` wurden **vor** der Ausführung aus dem Projektordner verschoben, damit das Sprachmodell die Liste der eingebauten Lücken nicht lesen konnte. Der Skill konnte auf dem Testsystem keinen Code ausführen und stufte seine Funde daher als „needs validation“ (nicht „confirmed“) ein; sie zählen hier trotzdem als gefunden. Punkte, die nur in den „Hardening Notes“ des Reports stehen, zählen als teilweise gefunden.
- **Compliance:** Der Cloudflare Skill ist ein reines Security-Audit und prüft keine rechtlichen Anforderungen. Dass er C1 und C2 nicht findet, ist daher zu erwarten und kein Versäumnis des Skills.

Legende: ✅ gefunden · ❌ nicht gefunden · ✅❌ teilweise gefunden · ❌⚠️ nicht gefunden und fälschlich als „erfüllt“ bewertet. Die Quellen finden sich im [Anhang](#anhang--appendix).

### Einfach

| Schweregrad | Beschreibung                                                                                           | Fundstelle *(Datei:Zeile)*                                                                                   | Gefunden vom [Vibecode-Checker](https://vibecode-checker.de) | Gefunden vom Cloudflare Skill |
| ----------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------: | :---------------------------: |
| MEDIUM      | E1: Keine Security-Header, `X-Powered-By` aktiv, vollständige Stacktraces in Fehlerantworten           | `server.js:11` (keine Security-Header, `x-powered-by` nicht deaktiviert), Stacktraces in `server.js:39`        |                              ❌                               |              ✅❌              |
| HIGH        | E2: Veraltetes jQuery 3.3.1 wird ohne SRI von einem CDN geladen, dazu das verwundbare `lodash@4.17.15` | `views/partials/header.ejs:8`, `package.json:19`                                                             |                              ✅❌                              |              ✅❌              |
| HIGH        | E3: Reflected XSS in `/search?q=` durch nicht escapte Ausgabe                                          | `views/search.ejs:2`                                                                                         |                              ❌                               |               ✅               |

### Moderat

| Schweregrad | Beschreibung                                                                                              | Fundstelle *(Datei:Zeile)*                                        | Gefunden vom [Vibecode-Checker](https://vibecode-checker.de) | Gefunden vom Cloudflare Skill |
| ----------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | :----------------------------------------------------------: | :---------------------------: |
| CRITICAL    | M1: SQL-Injection in `/api/products?category=`                                                            | `routes/products.js:13`                                           |                              ❌                               |               ✅               |
| CRITICAL    | M2: MD5-Passwörter ohne Salt, schwaches JWT-Secret `gravel123`, Auth-Cookie ohne HttpOnly/Secure/SameSite | `services/auth.js:4`, `services/auth.js:7`, `services/auth.js:27` |                              ❌                               |               ✅               |
| CRITICAL    | M3: IDOR bei `GET /api/orders/:id` (keine Prüfung des Besitzers)                                          | `routes/orders.js:25-26`                                          |                              ❌                               |               ✅               |

### Schwer

| Schweregrad | Beschreibung                                                                                          | Fundstelle *(Datei:Zeile)*                       | Gefunden vom [Vibecode-Checker](https://vibecode-checker.de) | Gefunden vom Cloudflare Skill |
| ----------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------ | :----------------------------------------------------------: | :---------------------------: |
| HIGH        | H1: Checkout vertraut dem vom Client gelieferten `unitPrice` und `quantity` (negative Summen möglich) | `routes/orders.js:44`, `routes/orders.js:55`     |                              ❌                               |               ✅               |
| HIGH        | H2: CORS spiegelt jede Origin inkl. Credentials; kein CSRF-Schutz beim Profil-Update                  | `middleware/cors.js:4-5`, `routes/account.js:16` |                             ❌⚠️                              |               ✅               |
| CRITICAL    | H3: SSRF in `POST /api/tools/fetch-spec`, umgehbare `localhost`-Blocklist                             | `routes/tools.js:12`, `routes/tools.js:16`       |                              ❌                               |               ✅               |

### Sehr schwer

| Schweregrad | Beschreibung                                                                               | Fundstelle *(Datei:Zeile)*                                       | Gefunden vom [Vibecode-Checker](https://vibecode-checker.de) | Gefunden vom Cloudflare Skill |
| ----------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | :----------------------------------------------------------: | :---------------------------: |
| CRITICAL    | VH1: Second-Order-SQL-Injection über den gespeicherten `company_name` im Firmenbericht     | `routes/orders.js:19` (gespeichert in `routes/account.js:18-20`) |                              ❌                               |               ✅               |
| HIGH        | VH2: Race Condition bei der Gutscheineinlösung (Prüfung, asynchroner Schritt, dann Update) | `routes/vouchers.js:19-26`                                       |                              ❌                               |               ✅               |
| HIGH        | VH3: Path Traversal in ein Nachbarverzeichnis (`startsWith` ohne abschließenden Separator) | `routes/datasheets.js:15`                                        |                              ❌                               |               ✅               |

### Compliance

| Schweregrad | Beschreibung                                                                         | Fundstelle *(Datei:Zeile)* | Gefunden vom [Vibecode-Checker](https://vibecode-checker.de) | Gefunden vom Cloudflare Skill |
| ----------- | ------------------------------------------------------------------------------------ | -------------------------- | :----------------------------------------------------------: | :---------------------------: |
| MEDIUM      | C1: Falsches und unvollständiges Impressum                                           | `views/impressum.ejs:3-4`  |                              ❌                               |    ❌ *(nicht im Umfang)*      |
| HIGH        | C2: Datenschutzerklärung enthält ausschließlich „We don't collect anything, promise“ | `views/datenschutz.ejs:3`  |                              ❌                               |    ❌ *(nicht im Umfang)*      |

### Zusätzlich gefunden

Neben den geplanten Lücken hat der Cloudflare Skill weitere Probleme gemeldet, die nicht absichtlich eingebaut wurden. Sie wurden nicht eingestuft.

| Beschreibung                                                                                                                                  | Fundstelle *(Datei:Zeile)*                         | Gefunden vom [Vibecode-Checker](https://vibecode-checker.de) | Gefunden vom Cloudflare Skill |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | :----------------------------------------------------------: | :---------------------------: |
| Z1: Jeder Nutzer kann seinen `company_name` frei ändern und so über den Firmenbericht die Bestellungen fremder Firmen lesen (ohne SQL-Injection) | `routes/account.js:19`, `routes/orders.js:19`      |                              ❌                               |               ✅               |
| Z2: Beim Start werden automatisch Konten mit schwachen, fest einprogrammierten Passwörtern angelegt (als Demo-Daten beabsichtigt)              | `server.js:9`, `db/seed.js:38-40`                  |                              ❌                               |               ✅               |
| Z3: Logout entwertet das JWT nicht serverseitig, ein abgefangenes Token bleibt 7 Tage gültig                                                   | `routes/auth.js:34-37`, `services/auth.js:18`      |                              ❌                               |               ✅               |
| Z4: Interner Endpunkt `/internal/metrics` ist über die SSRF (H3) von außen erreichbar                                                          | `routes/tools.js:24-26`                            |                              ❌                               |               ✅               |

## Fazit

Der Vergleich deutet darauf hin, dass Codeanalyse auf Schwachstellen, gerade für *Vibecoder*, nicht kostspielig sein muss, um die wichtigsten Fehler aufzudecken: Der Lauf des Cloudflare Skills hätte zu API-Preisen rund 0,75 US-$ gekostet. Einschränkend gilt, dass nur eine einzige App mit je einem Lauf pro Tool getestet wurde und keiner der Funde des Cloudflare Skills durch Ausführung bestätigt ist. Nicht Teil des Scopes waren statische Code-Analyse-Tools und Linter. Für ein *Produktivsystem* ist es aber durchaus empfehlenswert, nicht allein auf ein Tool (KI oder *konventionell*) zu setzen. Die Kombination beider bringt für Menschen ohne technisches Verständnis vermutlich den höchsten Mehrwert. Ein großer Vorteil künstlicher Intelligenz liegt in der Fähigkeit, Kontexte zu verstehen und gefundene Schwachstellen selbstständig zu beheben; Letzteres war nicht Teil dieses Tests. Es sollte aber immer ein *human in the loop* bleiben, um z. B. ein halluzinierendes Sprachmodell zu erkennen. Außerdem ist es empfehlenswert, unterschiedliche Sprachmodelle einzusetzen, d. h. das Sprachmodell, das ein Feature oder gar die gesamte Anwendung entwickelt hat, sollte nicht seinen eigenen Code analysieren.

---

## What is the *Vibecode-Checker* by *BYB Labs × WBS.LEGAL*

> [!IMPORTANT]
> The following was translated from the original [German](#was-ist-der-vibecode-checker-von-byb-labs--wbslegal) to English by an AI model (`Claude Sonnet 5.5 (Medium)`)

The [Vibecode-Checker](https://vibecode-checker.de) (currently labeled as beta) is meant to help people who build applications with the help of artificial intelligence (ChatGPT, Claude, etc.) uncover security vulnerabilities and similar issues in their applications, in order to protect them from legal consequences. The tool is operated by BYB Agency GmbH (BYB Labs); WBS.LEGAL provides legal advice in a separate appointment.

> The Free Scan shows you what is still missing technically and legally before going live. Your source code stays in your browser.
>
> *https://vibecode-checker.de, last accessed on 20.11.2026* (translated)

### Costs

As of 20.11.2026, the [Vibecode-Checker](https://vibecode-checker.de) offers three pricing tiers: the Free Scan (€0), the Quick Scan (€49 per month) and the Deep Scan (€99 per month). The free version was used for the test performed here, so all results refer to that version only. No statement can or will be made about the other scans. In the free version, the scan advertises the following features:
- Technical run and overall picture as a bar
- Two blockers, two risks and two passed checks each
- Combined prompt for the issues shown

The exact results for the web app published here are shown and explained [later](#comparison). We compare the [Vibecode-Checker](https://vibecode-checker.de) with the [security-audit-skill](https://github.com/cloudflare/security-audit-skill) published by [Cloudflare](https://www.cloudflare.com), which is freely available on GitHub and can be used in combination with a language model such as [Claude](https://claude.ai). For cost reasons, `Gemini 4 Hydrogen (Medium)` was chosen as the language model for this comparison.

The Cloudflare Skill run used a total of roughly 147.5k input, 61.9k output and 8.2k thinking tokens. It ran on an existing Gemini Pro subscription and therefore caused no additional cost. At the [API prices](https://aistudio.google.com/docs/pricing) for `Gemini 4 Hydrogen` (US$1.50 input and US$7.50 output incl. thinking per 1M tokens, last accessed on 20.11.2026), this would amount to roughly US$0.75.

## Comparison

The language model that built the web application was instructed to *deliberately* introduce security and compliance violations. Below is an overview of the planned vulnerabilities, their severity, and which tool found or missed each of them. Vulnerabilities that were not planned but were found anyway are listed under [Additional findings](#additional-findings).

### Methodology

- **Vibecode-Checker:** [`gravel-store.zip`](./gravel-store.zip) was uploaded (source code incl. `node_modules/` and database, without `README.md` and planning files). The address of the running app could not be provided because it only runs locally. According to the report, 41 further checks were therefore not performed. According to the website, the Free Scan uses the address to check, among other things, the site's "security, Impressum, privacy policy" (translated); security headers (E1), Impressum (C1) and privacy policy (C2) could therefore not be checked at all.
- **Free version:** The Free Scan shows at most two blockers, two risks and two passed checks. However, the report states that only 2 of 26 decided checks count against the app (1 blocker, 1 risk). So no further findings were hidden because of the free version's limit.
- **Wrongly rated as "passed":** The Vibecode-Checker explicitly rated two checks as "ERFÜLLT" (passed): "Your own API does not accept requests from any foreign site" and "No server function found that writes without checking the caller and accepts any origin" (translated). Neither is true (see H2). The vulnerability was not just missed, it was confirmed as safe.
- **Cloudflare Skill:** `README.md`, `AGENTS.md`, `PLAN.md` and `TODO.md` were moved out of the project folder **before** the run, so the language model could not read the list of planted vulnerabilities. The skill could not execute code on the test system and therefore rated its findings as "needs validation" (not "confirmed"); they still count as found here. Issues listed only in the report's "Hardening Notes" count as partially found.
- **Compliance:** The Cloudflare Skill is a pure security audit and does not check legal requirements. Missing C1 and C2 is therefore expected and not a shortcoming of the skill.

Legend: ✅ found · ❌ not found · ✅❌ partially found · ❌⚠️ not found and wrongly rated as "passed". The sources are in the [appendix](#anhang--appendix).

### Easy

| Severity | Description                                                                             | Issue in *(File:Line)*                                                                                 | Found by [Vibecode-Checker](https://vibecode-checker.de) | Found by Cloudflare Skill |
| -------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | :------------------------------------------------------: | :-----------------------: |
| MEDIUM   | E1: No security headers, `X-Powered-By` left on, full stack traces in error responses   | `server.js:11` (no security headers, `x-powered-by` not disabled), stack traces at `server.js:39`        |                            ❌                             |            ✅❌            |
| HIGH     | E2: Outdated jQuery 3.3.1 loaded from CDN without SRI, plus vulnerable `lodash@4.17.15` | `views/partials/header.ejs:8`, `package.json:19`                                                       |                            ✅❌                            |            ✅❌            |
| HIGH     | E3: Reflected XSS in `/search?q=` via unescaped output                                  | `views/search.ejs:2`                                                                                   |                            ❌                             |             ✅             |

### Moderate

| Severity | Description                                                                                           | Issue in *(File:Line)*                                            | Found by [Vibecode-Checker](https://vibecode-checker.de) | Found by Cloudflare Skill |
| -------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | :------------------------------------------------------: | :-----------------------: |
| CRITICAL | M1: SQL injection in `/api/products?category=`                                                        | `routes/products.js:13`                                           |                            ❌                             |             ✅             |
| CRITICAL | M2: Unsalted MD5 passwords, weak JWT secret `gravel123`, auth cookie without HttpOnly/Secure/SameSite | `services/auth.js:4`, `services/auth.js:7`, `services/auth.js:27` |                            ❌                             |             ✅             |
| CRITICAL | M3: IDOR on `GET /api/orders/:id` (no ownership check)                                                | `routes/orders.js:25-26`                                          |                            ❌                             |             ✅             |

### Hard

| Severity | Description                                                                               | Issue in *(File:Line)*                           | Found by [Vibecode-Checker](https://vibecode-checker.de) | Found by Cloudflare Skill |
| -------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------ | :------------------------------------------------------: | :-----------------------: |
| HIGH     | H1: Checkout trusts client-supplied `unitPrice` and `quantity` (negative totals possible) | `routes/orders.js:44`, `routes/orders.js:55`     |                            ❌                             |             ✅             |
| HIGH     | H2: CORS reflects any Origin with credentials; no CSRF protection on profile update       | `middleware/cors.js:4-5`, `routes/account.js:16` |                           ❌⚠️                            |             ✅             |
| CRITICAL | H3: SSRF in `POST /api/tools/fetch-spec`, bypassable `localhost` blocklist                | `routes/tools.js:12`, `routes/tools.js:16`       |                            ❌                             |             ✅             |

### Very hard

| Severity | Description                                                                          | Issue in *(File:Line)*                                      | Found by [Vibecode-Checker](https://vibecode-checker.de) | Found by Cloudflare Skill |
| -------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------- | :------------------------------------------------------: | :-----------------------: |
| CRITICAL | VH1: Second-order SQL injection via stored `company_name` used in company report     | `routes/orders.js:19` (stored at `routes/account.js:18-20`) |                            ❌                             |             ✅             |
| HIGH     | VH2: Voucher redemption race condition (check, async step, then update)              | `routes/vouchers.js:19-26`                                  |                            ❌                             |             ✅             |
| HIGH     | VH3: Path traversal into sibling directory (`startsWith` without trailing separator) | `routes/datasheets.js:15`                                   |                            ❌                             |             ✅             |

### Compliance Issues

| Severity | Description                                                                                  | Issue in *(File:Line)*    | Found by [Vibecode-Checker](https://vibecode-checker.de) | Found by Cloudflare Skill |
| -------- | -------------------------------------------------------------------------------------------- | ------------------------- | :------------------------------------------------------: | :-----------------------: |
| MEDIUM   | C1: Bogus and incomplete Impressum                                                           | `views/impressum.ejs:3-4` |                            ❌                             |   ❌ *(out of scope)*      |
| HIGH     | C2: Datenschutzerklärung (privacy policy) contains only "We don't collect anything, promise" | `views/datenschutz.ejs:3` |                            ❌                             |   ❌ *(out of scope)*      |

### Additional findings

Besides the planned vulnerabilities, the Cloudflare Skill reported further issues that were not introduced deliberately. They have not been rated.

| Description                                                                                                                      | Issue in *(File:Line)*                        | Found by [Vibecode-Checker](https://vibecode-checker.de) | Found by Cloudflare Skill |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | :------------------------------------------------------: | :-----------------------: |
| Z1: Any user can freely change their `company_name` and thereby read other companies' orders via the company report (no SQL injection needed) | `routes/account.js:19`, `routes/orders.js:19` |                            ❌                             |             ✅             |
| Z2: Accounts with weak, hardcoded passwords are created automatically on startup (intended as demo data)                         | `server.js:9`, `db/seed.js:38-40`             |                            ❌                             |             ✅             |
| Z3: Logout does not invalidate the JWT server-side; a captured token stays valid for 7 days                                      | `routes/auth.js:34-37`, `services/auth.js:18` |                            ❌                             |             ✅             |
| Z4: Internal endpoint `/internal/metrics` is reachable from outside via the SSRF (H3)                                            | `routes/tools.js:24-26`                       |                            ❌                             |             ✅             |

## Conclusion

The comparison suggests that code analysis for vulnerabilities does not have to be expensive, especially for *vibecoders*, in order to uncover the most important flaws: at API prices, the Cloudflare Skill run would have cost roughly US$0.75. As a limitation, only a single app was tested with one run per tool, and none of the Cloudflare Skill's findings have been confirmed by execution. Static code analysis tools and linters were not part of the scope. For a *production system*, however, it is certainly advisable not to rely on a single tool (AI or *conventional*) alone. For people without technical understanding, the combination of both probably brings the most value. A major strength of artificial intelligence lies in its ability to understand context and to fix the vulnerabilities it finds on its own; the latter was not part of this test. There should always be a *human in the loop*, e.g. to spot a hallucinating language model. It is also advisable to use different language models, i.e. the model that developed a feature or even the entire application should not analyze its own code.

## Anhang / Appendix

### Selbst testen / How to run

> [!CAUTION]
> Du solltest diese Webanwendung **niemals** öffentlich verfügbar machen, sie enthält schwerwiegende Sicherheitslücken und dient **ausschließlich** Demonstrationszwecken.
>
> You should **never** make this web application publicly available. It contains severe security vulnerabilities and is intended **exclusively** for demonstration purposes.

#### Setup

Voraussetzung / Requirement: Node.js >= 22

```shell
npm install
npm start # Startet die App unter / Starts the app at http://127.0.0.1:3000
```

Zum Zurücksetzen der SQLite-Datenbank auf die Demo-Daten (Server vorher beenden) / To reset the SQLite database to the demo data (stop the server first):

```shell
npm run reset-db
```

#### Demo Daten / Demo Data

| Account                   | Password   | Role     |
| ------------------------- | ---------- | -------- |
| `admin@gravelcraft.local` | `admin123` | admin    |
| `alice@example.com`       | `alice123` | customer |
| `bob@example.com`         | `bob123`   | customer |

### Prompt(s)

Die Prompts sind unverändert wiedergegeben. Die Tabellen oben weichen vom geforderten Format ab (ohne Emoji, zusätzliche Tabellen für Compliance und zusätzliche Funde). / The prompts are reproduced verbatim. The tables above deviate from the requested format (no emoji, additional tables for compliance and additional findings).

```markdown
I want to test a website security analyzer, designed to detect misconfigurations, security issues, compliance issues and so forth. To do that, I need a "honeypot" webapp, which you are going to design. It needn't be sophisticated in any way, shape or form, but satisfy the following:

- Have a total of 12 security related issues (of which the first six from OWASP TOP 10 **must** be included)
  - three "should be easy to spot"
  - three "moderately hard to spot"
  - three "hard to spot"
  - three "very hard to spot"
- Have a total of two compliance issues
  - "Impressum" incorrect
    - just fill some bogus and incomplete information
  - "Datenschutzerklärung" incorrect
    - there should be nothing written except *"We don't collect anything, promise"*

The demo webapp should be a simple Onlineshop for different types of *gravel*. To allow misconfigurations and subsequently exploits it should have an according tech stack (i.e. hard to allow `sql-injection` without any database backend). 

The list of exploits that end up present in the webapp, should be written to `README.md` four tables (for the four categories mentioned above). The tables should be constructed as folows:

| Severity | Description | Issue in *(File:Line)* | Found by [Vibecode-Checker](https://vibecode-checker.de) | Found by Cloudflare Skill |
| -------- | ----------- | ---------------------- | -------------------------------------------------------- | ------------------------- |
|          |             |                        |                                                          |                           |


Severity can be any of the following:
- 🔴 CRITICAL
- 🟠 HIGH
- 🟡 MEDIUM
- 🔵 LOW
- 🟢 INFO

**Important:** The last two columns will be filled out by me, so leave them blank for all rows.

---

**TODO:** Write `PLAN.md`, `TODO.md` aswell as `AGENTS.md` to implement this project. Do not implement anything yet, as I want to review those files, before we continue.
```

```markdown
Implement the web application according to `PLAN.md`.
```

### Website [Vibecode-Checker](https://vibecode-checker.de)

Kopie vom 20.11.2026 / Copy as of 20.11.2026: [`anhang/website_vibecoder-checker_20_11_2026.pdf`](./anhang/website_vibecoder-checker_20_11_2026.pdf)

### Report [Vibecode-Checker](https://vibecode-checker.de)

Verfügbar unter / Available in [`anhang/vibecode-checker-report.pdf`](./anhang/vibecode-checker-report.pdf). Die hochgeladene Datei liegt unter / The uploaded file is available at [`gravel-store.zip`](./gravel-store.zip).

### Report Cloudflare Skill

Verfügbar unter / Available in [`anhang/cloudflare-results`](./anhang/cloudflare-results)
