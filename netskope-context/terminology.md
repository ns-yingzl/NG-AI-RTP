# Netskope Terminology

**Source:** Confluence — [Common Mental Model](https://netskope.atlassian.net/wiki/x/h4BZZwE) (Security Operational Concepts).

When writing prototype copy, labels, headings, and field names, use these terms exactly. They have specific meanings in our product and conflating them confuses users.

## The vocabulary

| Term | Use it for | Don't confuse with |
|------|------------|--------------------|
| **Settings** | Fundamental, system-wide parameters that are typically "set-and-forget." Determines general system behavior. | Configuration |
| **Configuration** | Advanced, specific parameters frequently modified to implement intended functions. More technical than Settings; adapts to changing situations. | Settings |
| **Policy** | High-level business goals or guardrails that lower-level Rules must enforce. | Rule, Configuration |
| **Rule** | Specific, actionable logic — the `IF {Criterion} THEN {Action}` statement that enforces a Policy within the live Configuration. A system is compliant when the Rule is properly applied via the Configuration to fulfill the Policy's intent. | Policy |
| **Object / Entity** | The thing the Rule is protecting/monitoring/managing. Prefer **Object** — it's more common in our product. | Resource |
| **Resource** | Anything leveraged to protect/monitor/manage the Object. Use a functional prefix to disambiguate (e.g., `DLP Profile`, not just `Profile`). | Object |
| **Component** | The specific, definable parts of an Object and Resource, with its own identity distinct from the Object. | (the React kind of "component" — don't conflate in UI copy) |
| **Profile** | A collection of different but related attributes and Components that collectively define an Object. **Avoid** using "Profile" for simple, single-type lists. | Resource |
| **Event** | A specific occurrence resulting from a triggered Rule, providing actionable context. | Alert, Incident |
| **Incident** | A major problem indicated by a series of high-severity negative Events that affect business operations and require immediate investigation. | Event, Alert |
| **Notification** | General system communication informing users about an Event. Can be positive or negative. | Alert |
| **Alert** | High-severity Notification — a critical warning demanding immediate triage and response. | Notification |
| **Log** | Raw, unparsed, fundamental data points for deep forensic analysis and historical tracking. | Event |

## Rules for Claude

1. **Pick the most specific term.** If something is a Rule, don't call it a Policy.
2. **Match casing in UI:** PascalCase for headings ("Real-Time Protection Policies"), sentence case for body copy ("This policy applies to…").
3. **Prefer Object over Entity** in user-facing copy.
4. **Use "Configuration" for tunables, "Settings" for set-and-forget.** When in doubt, ask the designer.
5. **Don't invent new terms.** If you reach for a word that's not in this list (e.g., "schema", "manifest", "preferences"), check whether one of these covers it first.
