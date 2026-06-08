# Questionnaire Node Extraction Plan

This plan defines the process for applying the `questionnaire-parser` skill to extract graph nodes from `Key Vulnerability Questions.docx`. It incorporates mandatory section-by-section user verification to ensure accuracy before final JSON generation.

## Objective
Systematically parse the Word document into a verified Bayesian Belief Network (BBN) node schema, strictly adhering to the `questionnaire-parser` constraints (Word ingestion, specific numbering, dynamic array handling, and skipping Section 3).

## Phased Execution Plan

### 1. Document Ingestion
*   **Action:** Extract plain text from `Key Vulnerability Questions.docx` (using R's `officer` package or similar).
*   **Verification:** Confirm the raw text accurately preserves section headers and the `number.number[letter]` question numbering format.

### 2. Section 1 Processing & Review
*   **Action:** Apply the parser to identify top-level questions in Section 1. Extract the `node_id`, `question_text`, `allowed_states`, and conditional skip-logic (`implied_edges`).
*   **Verification:** Display a markdown summary of Section 1's extracted questions to the user. **Pause execution and wait for explicit user approval.**

### 3. Section 2 Processing (Dynamic Arrays) & Review
*   **Action:** Apply the *Template Extraction Strategy*. Identify the repeating child questions, group them under a `template_node`, and set `downstream_action_required` to "AGGREGATION".
*   **Verification:** Display the extracted template structure and internal child questions to the user. **Pause execution and wait for explicit user approval.**

### 4. Section 3 Omission Enforcement
*   **Action:** Detect Section 3 and strictly bypass all content within it.
*   **Verification:** Report to the user that Section 3 was successfully skipped and display the boundary of Section 4 to confirm nothing was incorrectly captured.

### 5. Remaining Sections Processing & Review
*   **Action:** Parse any remaining sections (Section 4 onwards) following the standard extraction rules.
*   **Verification:** Present the extracted nodes for each subsequent section individually. **Pause execution and wait for explicit user approval per section.**

### 6. Final JSON Compilation
*   **Action:** Only after all sections have been individually approved, compile the verified data into the final `project_nodes` JSON dictionary.
*   **Verification:** Validate the JSON against the schema in `SKILL.md` and save the output as `extracted_nodes.json` in the `Extraction` subfolder.
