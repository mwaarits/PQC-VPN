# Graph Report - .  (2026-07-26)

## Corpus Check
- Corpus is ~10,195 words - fits in a single context window. You may not need a graph.

## Summary
- 105 nodes · 185 edges · 18 communities (9 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- API Data Fetching
- Runtime Dependencies
- Dev Dependencies and Linting
- Page Components and Routing
- Project Configuration
- Package Metadata
- Oxlint Rules
- Mesh Topology
- App Entry Point
- Bluesky Icon
- Discord Icon
- Documentation Icon
- GitHub Icon
- Social Icon
- X Icon
- React Compiler
- TypeScript

## God Nodes (most connected - your core abstractions)
1. `setMockMode()` - 17 edges
2. `react` - 14 edges
3. `getMockMode()` - 9 edges
4. `fetchWithTimeout()` - 9 edges
5. `ErrorAlert()` - 8 edges
6. `MeshTopology()` - 6 edges
7. `React + Vite Template` - 6 edges
8. `scripts` - 5 edges
9. `DarkNetwork()` - 5 edges
10. `fetchStatus()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `React + Vite Template` --conceptually_related_to--> `React Logo`  [INFERRED]
  README.md → src/assets/react.svg
- `React + Vite Template` --conceptually_related_to--> `Vite Logo`  [INFERRED]
  README.md → src/assets/vite.svg
- `Dashboard Hero Image` --conceptually_related_to--> `Dashboard Title: lti-pqc-vpn-dashboard`  [INFERRED]
  src/assets/hero.png → index.html
- `Vite Logo` --semantically_similar_to--> `Vite-Style Favicon Logo`  [INFERRED] [semantically similar]
  src/assets/vite.svg → public/favicon.svg
- `Vite-Style Favicon Logo` --conceptually_related_to--> `Favicon Reference`  [EXTRACTED]
  public/favicon.svg → index.html

## Import Cycles
- None detected.

## Communities (18 total, 9 thin omitted)

### Community 0 - "API Data Fetching"
Cohesion: 0.23
Nodes (17): fetchBenchmark(), fetchDarkNetwork(), fetchLogs(), fetchPQC(), fetchStatus(), fetchWithTimeout(), getMockMode(), MOCK_DATA (+9 more)

### Community 1 - "Runtime Dependencies"
Cohesion: 0.13
Nodes (15): lucide-react, dependencies, lucide-react, react, react-dom, recharts, tailwindcss, @tailwindcss/vite (+7 more)

### Community 2 - "Dev Dependencies and Linting"
Cohesion: 0.18
Nodes (11): oxlint, devDependencies, oxlint, @types/react, @types/react-dom, vite, @vitejs/plugin-react, @types/react (+3 more)

### Community 3 - "Page Components and Routing"
Cohesion: 0.35
Nodes (6): react, fetchPenTest(), App(), Layout(), Sidebar(), PenTestResults()

### Community 4 - "Project Configuration"
Cohesion: 0.20
Nodes (10): Favicon Reference, Dashboard Title: lti-pqc-vpn-dashboard, Vite-Style Favicon Logo, Hot Module Replacement, Oxlint Linting, React + Vite Template, Vite Plugin React, Dashboard Hero Image (+2 more)

### Community 5 - "Package Metadata"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 6 - "Oxlint Rules"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 7 - "Mesh Topology"
Cohesion: 0.70
Nodes (4): fetchTopology(), BankNode(), MeshTopology(), ServerNode()

## Knowledge Gaps
- **40 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+35 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Page Components and Routing` to `API Data Fetching`, `Oxlint Rules`, `Mesh Topology`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `Package Metadata`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `plugins` connect `Oxlint Rules` to `Page Components and Routing`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _40 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._