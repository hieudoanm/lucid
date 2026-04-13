package graphml

import (
	"encoding/xml"
	"fmt"
	"os"
	"strconv"
	"time"
)

// ─── GraphML XML schema structs ───────────────────────────────────────────────

type graphMLDoc struct {
	XMLName xml.Name  `xml:"graphml"`
	XMLNS   string    `xml:"xmlns,attr"`
	XSI     string    `xml:"xmlns:xsi,attr"`
	Schema  string    `xml:"xsi:schemaLocation,attr"`
	Keys    []keyDef  `xml:"key"`
	Graph   graphElem `xml:"graph"`
}

type keyDef struct {
	ID       string `xml:"id,attr"`
	For      string `xml:"for,attr"`
	AttrName string `xml:"attr.name,attr"`
	AttrType string `xml:"attr.type,attr"`
}

type graphElem struct {
	ID          string     `xml:"id,attr"`
	EdgeDefault string     `xml:"edgedefault,attr"`
	Meta        []dataElem `xml:"data"`
	Nodes       []nodeElem `xml:"node"`
	Edges       []edgeElem `xml:"edge"`
}

type nodeElem struct {
	ID   string     `xml:"id,attr"`
	Data []dataElem `xml:"data"`
}

type edgeElem struct {
	ID     string     `xml:"id,attr"`
	Source string     `xml:"source,attr"`
	Target string     `xml:"target,attr"`
	Data   []dataElem `xml:"data"`
}

type dataElem struct {
	Key   string `xml:"key,attr"`
	Value string `xml:",chardata"`
}

// ─── Key definitions ──────────────────────────────────────────────────────────

var nodeKeys = []keyDef{
	{ID: "d_kind", For: "node", AttrName: "kind", AttrType: "string"},
	{ID: "d_label", For: "node", AttrName: "label", AttrType: "string"},
	{ID: "d_file", For: "node", AttrName: "file", AttrType: "string"},
	{ID: "d_line", For: "node", AttrName: "line", AttrType: "int"},
	{ID: "d_lang", For: "node", AttrName: "lang", AttrType: "string"},
	{ID: "d_exported", For: "node", AttrName: "exported", AttrType: "boolean"},
}

var edgeKeys = []keyDef{
	{ID: "e_kind", For: "edge", AttrName: "kind", AttrType: "string"},
	{ID: "e_line", For: "edge", AttrName: "line", AttrType: "int"},
}

var graphKeys = []keyDef{
	{ID: "g_generated", For: "graph", AttrName: "generated", AttrType: "string"},
	{ID: "g_version", For: "graph", AttrName: "version", AttrType: "string"},
}

// Write serialises the graph to a GraphML file at path.
func Write(g *Graph, path string) error {
	doc := buildDoc(g)

	f, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("create file: %w", err)
	}
	defer f.Close()

	if _, err := f.WriteString(xml.Header); err != nil {
		return err
	}

	enc := xml.NewEncoder(f)
	enc.Indent("", "  ")
	if err := enc.Encode(doc); err != nil {
		return fmt.Errorf("encode graphml: %w", err)
	}
	return enc.Flush()
}

func buildDoc(g *Graph) graphMLDoc {
	// Collect all key definitions
	keys := make([]keyDef, 0, len(nodeKeys)+len(edgeKeys)+len(graphKeys))
	keys = append(keys, graphKeys...)
	keys = append(keys, nodeKeys...)
	keys = append(keys, edgeKeys...)

	// Graph-level metadata
	graphMeta := []dataElem{
		{Key: "g_generated", Value: time.Now().UTC().Format(time.RFC3339)},
		{Key: "g_version", Value: "1"},
	}

	// Build node elements
	nodes := make([]nodeElem, 0, len(g.Nodes))
	for _, n := range g.Nodes {
		nodes = append(nodes, nodeElem{
			ID: n.ID,
			Data: []dataElem{
				{Key: "d_kind", Value: string(n.Kind)},
				{Key: "d_label", Value: n.Label},
				{Key: "d_file", Value: n.File},
				{Key: "d_line", Value: strconv.Itoa(n.Line)},
				{Key: "d_lang", Value: n.Lang},
				{Key: "d_exported", Value: strconv.FormatBool(n.Exported)},
			},
		})
	}

	// Build edge elements
	edges := make([]edgeElem, 0, len(g.Edges))
	for _, e := range g.Edges {
		edges = append(edges, edgeElem{
			ID:     e.ID,
			Source: e.Source,
			Target: e.Target,
			Data: []dataElem{
				{Key: "e_kind", Value: string(e.Kind)},
				{Key: "e_line", Value: strconv.Itoa(e.Line)},
			},
		})
	}

	return graphMLDoc{
		XMLNS:  "http://graphml.graphdrawing.org/graphml",
		XSI:    "http://www.w3.org/2001/XMLSchema-instance",
		Schema: "http://graphml.graphdrawing.org/graphml http://graphml.graphdrawing.org/graphml/1.0/graphml.xsd",
		Keys:   keys,
		Graph: graphElem{
			ID:          "codebase",
			EdgeDefault: "directed",
			Meta:        graphMeta,
			Nodes:       nodes,
			Edges:       edges,
		},
	}
}
