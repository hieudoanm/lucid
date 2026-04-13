package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/distilled/src/libs/extractor"
	"github.com/hieudoanm/distilled/src/libs/graphml"
	"github.com/hieudoanm/distilled/src/libs/walker"
)

var (
	dir     string
	out     string
	exclude string
	verbose bool
)

var scanCmd = &cobra.Command{
	Use:   "scan",
	Short: "Scan a codebase and generate a GraphML file",
	RunE: func(cmd *cobra.Command, args []string) error {
		absDir, err := filepath.Abs(dir)
		if err != nil {
			return fmt.Errorf("error resolving directory: %w", err)
		}

		excludeSet := parseExcludeList(exclude)

		if verbose {
			fmt.Fprintf(os.Stderr, "scanning %s\n", absDir)
		}

		// Walk the codebase
		files, err := walker.Walk(absDir, excludeSet)
		if err != nil {
			return fmt.Errorf("walk error: %w", err)
		}

		if verbose {
			fmt.Fprintf(os.Stderr, "found %d source files\n", len(files))
		}

		// Extract symbols and calls from each file
		graph := graphml.NewGraph()

		for _, f := range files {
			if verbose {
				fmt.Fprintf(os.Stderr, "  extracting: %s\n", f.RelPath)
			}

			info, err := extractor.Extract(f)
			if err != nil {
				fmt.Fprintf(os.Stderr, "  warning: skipping %s: %v\n", f.RelPath, err)
				continue
			}

			graph.AddFile(info)
		}

		// Resolve cross-file call edges
		graph.ResolveCallEdges()

		// Write GraphML
		if err := graphml.Write(graph, out); err != nil {
			return fmt.Errorf("write error: %w", err)
		}

		fmt.Printf("graph written to %s\n", out)
		fmt.Printf("  nodes: %d  edges: %d\n", graph.NodeCount(), graph.EdgeCount())

		return nil
	},
}

func init() {
	rootCmd.AddCommand(scanCmd)

	scanCmd.Flags().StringVar(&dir, "dir", ".", "Root directory to scan")
	scanCmd.Flags().StringVar(&out, "out", "codebase.graphml", "Output .graphml file path")
	scanCmd.Flags().StringVar(&exclude, "exclude", ".git,node_modules,vendor,dist,.next,__pycache__", "Comma-separated directories to exclude")
	scanCmd.Flags().BoolVar(&verbose, "verbose", false, "Print progress to stderr")
}

func parseExcludeList(s string) map[string]bool {
	m := make(map[string]bool)
	for _, part := range strings.Split(s, ",") {
		part = strings.TrimSpace(part)
		if part != "" {
			m[part] = true
		}
	}
	return m
}
