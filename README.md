# FCB in Niger - Prevalence Analysis

This project implements a Bayesian Belief Network (BBN) to estimate "vulnerability to begging" scores based on field questionnaire responses in Niger. It provides a full pipeline from document-based question extraction to interactive graph construction and statistical inference.

## Project Overview

The core objective is to map individual questionnaire responses as nodes in a directed acyclic graph (DAG). By defining conditional dependencies (edges) between these nodes, we can computationally aggregate responses to calculate a final vulnerability score for each respondent.

## Phased Implementation

### 1. Node Extraction
*   **Status:** Completed
*   **Location:** `1. Key Questions/1. Extraction`
*   **Description:** Systematically parses the questionnaire Word documents into a standardized JSON schema. Each question is represented as a vertex with defined states, bounds, and skip-logic.

### 2. Interactive Graph Builder
*   **Status:** Completed
*   **Location:** `1. Key Questions/2. Graph Builder`
*   **Tech Stack:** React 19, Vite, React Flow (@xyflow/react), Tauri 2.0
*   **Description:** A standalone desktop application (packaged via Tauri) that allows researchers to visually define edges between extracted nodes. It features:
    *   Drag-and-drop node placement.
    *   Visual edge creation for conditional dependencies.
    *   JSON export/import for graph structures.

### 3. Edge Construction & Validation
*   **Status:** In Progress
*   **Description:** Establishing the logical flow of dependencies using the Graph Builder tool. This phase includes ensuring the graph is a valid Directed Acyclic Graph (DAG) and aligns with the theoretical vulnerability framework.

### 4. Bayesian Modeling (Backend)
*   **Status:** Planned
*   **Tech Stack:** R (`bnlearn`, `gRain`, `igraph`)
*   **Description:** Implementation of the statistical backend to define Conditional Probability Tables (CPTs) and perform belief propagation.

## Tech Stack

*   **Frontend:** React (TypeScript), React Flow
*   **Desktop Wrapper:** Tauri (Rust)
*   **Data Processing:** Python, R
*   **Statistics:** R (Planned)

## Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [Rust](https://www.rust-lang.org/) (for building the Tauri desktop app)
*   [R](https://www.r-project.org/) (for statistical analysis)

### Development - Graph Builder
```bash
cd "1. Key Questions/2. Graph Builder"
npm install
npm run dev
```

### Building the Desktop Application
```bash
cd "1. Key Questions/2. Graph Builder"
npm run tauri build
```

## Repository Structure

*   `1. Key Questions/`: Contains the questionnaire documents and the extraction/UI tools.
    *   `1. Extraction/`: Scripts and output for parsing the `.docx` questionnaire.
    *   `2. Graph Builder/`: Source code for the interactive visual tool.
*   `Themes/`: Visual assets and references for report styling.
