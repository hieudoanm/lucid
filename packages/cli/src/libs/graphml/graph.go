package graphml

import (
	"fmt"
	"strings"

	"github.com/hieudoanm/distilled/src/libs/extractor"
)

// NodeKind classifies a graph node.
type NodeKind string

const (
	NodeFile      NodeKind = "file"
	NodeFunction  NodeKind = "function"
	NodeMethod    NodeKind = "method"
	NodeType      NodeKind = "type"
	NodeInterface NodeKind = "interface"
	NodeClass     NodeKind = "class"
	NodeVariable  NodeKind = "variable"
	NodeConstant  NodeKind = "constant"
)

// EdgeKind classifies a graph edge.
type EdgeKind string

const (
	EdgeContains EdgeKind = "contains" // file → symbol
	EdgeCalls    EdgeKind = "calls"    // symbol → symbol
)

// Node is a vertex in the graph.
type Node struct {
	ID       string
	Kind     NodeKind
	Label    string
	File     string // relative path of owning file
	Line     int
	Lang     string
	Exported bool
}

// Edge is a directed relationship between two nodes.
type Edge struct {
	ID     string
	Source string
	Target string
	Kind   EdgeKind
	Line   int
}

// Graph holds the full codebase graph.
type Graph struct {
	Nodes    []*Node
	Edges    []*Edge
	nodeByID map[string]*Node
	// symbolIndex maps a bare symbol name → list of node IDs (for call resolution)
	symbolIndex map[string][]string
	edgeCounter int
}

// NewGraph creates an empty graph.
func NewGraph() *Graph {
	return &Graph{
		nodeByID:    make(map[string]*Node),
		symbolIndex: make(map[string][]string),
	}
}

// AddFile ingests extraction results, creating nodes and contains edges.
func (g *Graph) AddFile(info *extractor.FileInfo) {
	// File node
	fileID := sanitizeID("file:" + info.File.RelPath)
	fileNode := &Node{
		ID:    fileID,
		Kind:  NodeFile,
		Label: info.File.RelPath,
		File:  info.File.RelPath,
		Lang:  string(info.File.Lang),
	}
	g.addNode(fileNode)

	// Symbol nodes + contains edges
	for _, sym := range info.Symbols {
		symID := sanitizeID(fmt.Sprintf("sym:%s:%s:%d", info.File.RelPath, sym.Name, sym.Line))
		symNode := &Node{
			ID:       symID,
			Kind:     symbolKind(sym.Kind),
			Label:    sym.Name,
			File:     info.File.RelPath,
			Line:     sym.Line,
			Lang:     string(info.File.Lang),
			Exported: sym.Exported,
		}
		g.addNode(symNode)

		// Register in symbol index by bare name for call resolution
		g.symbolIndex[sym.Name] = append(g.symbolIndex[sym.Name], symID)

		// contains edge: file → symbol
		g.addEdge(&Edge{
			ID:     g.nextEdgeID(),
			Source: fileID,
			Target: symID,
			Kind:   EdgeContains,
			Line:   sym.Line,
		})
	}

	// Store pending call edges; they'll be resolved later
	for _, call := range info.Calls {
		// Find caller symbol node in this file
		callerID := g.findSymbolInFile(call.CallerName, info.File.RelPath)
		if callerID == "" {
			continue
		}
		// Store as a pending edge with callee name as target (resolved in ResolveCallEdges)
		g.Edges = append(g.Edges, &Edge{
			ID:     g.nextEdgeID(),
			Source: callerID,
			Target: "UNRESOLVED:" + call.CalleeName, // sentinel
			Kind:   EdgeCalls,
			Line:   call.Line,
		})
	}
}

// ResolveCallEdges replaces UNRESOLVED:name targets with actual node IDs.
// When a name matches multiple symbols, edges are created to each.
func (g *Graph) ResolveCallEdges() {
	resolved := make([]*Edge, 0, len(g.Edges))

	for _, e := range g.Edges {
		if !strings.HasPrefix(e.Target, "UNRESOLVED:") {
			resolved = append(resolved, e)
			continue
		}

		calleeName := strings.TrimPrefix(e.Target, "UNRESOLVED:")
		targets, ok := g.symbolIndex[calleeName]
		if !ok {
			continue // drop unresolvable calls
		}

		for i, t := range targets {
			edgeID := e.ID
			if i > 0 {
				edgeID = g.nextEdgeID()
			}
			resolved = append(resolved, &Edge{
				ID:     edgeID,
				Source: e.Source,
				Target: t,
				Kind:   EdgeCalls,
				Line:   e.Line,
			})
		}
	}

	g.Edges = resolved
}

// NodeCount returns the number of nodes.
func (g *Graph) NodeCount() int { return len(g.Nodes) }

// EdgeCount returns the number of edges.
func (g *Graph) EdgeCount() int { return len(g.Edges) }

// ─── Private helpers ─────────────────────────────────────────────────────────

func (g *Graph) addNode(n *Node) {
	if _, exists := g.nodeByID[n.ID]; !exists {
		g.Nodes = append(g.Nodes, n)
		g.nodeByID[n.ID] = n
	}
}

func (g *Graph) addEdge(e *Edge) {
	g.Edges = append(g.Edges, e)
}

func (g *Graph) nextEdgeID() string {
	g.edgeCounter++
	return fmt.Sprintf("e%d", g.edgeCounter)
}

func (g *Graph) findSymbolInFile(name, relPath string) string {
	candidates := g.symbolIndex[name]
	for _, id := range candidates {
		if n, ok := g.nodeByID[id]; ok && n.File == relPath {
			return id
		}
	}
	return ""
}

func symbolKind(k extractor.SymbolKind) NodeKind {
	switch k {
	case extractor.KindFunction:
		return NodeFunction
	case extractor.KindMethod:
		return NodeMethod
	case extractor.KindType:
		return NodeType
	case extractor.KindInterface:
		return NodeInterface
	case extractor.KindClass:
		return NodeClass
	case extractor.KindVariable:
		return NodeVariable
	case extractor.KindConstant:
		return NodeConstant
	default:
		return NodeFunction
	}
}

// sanitizeID replaces characters that are invalid in XML IDs.
func sanitizeID(s string) string {
	r := strings.NewReplacer(
		"/", "_",
		"\\", "_",
		".", "_",
		" ", "_",
		":", "_",
		"-", "_",
	)
	return r.Replace(s)
}
