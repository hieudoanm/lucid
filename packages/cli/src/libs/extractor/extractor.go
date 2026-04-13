package extractor

import (
	"bufio"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/hieudoanm/distilled/src/libs/walker"
)

// SymbolKind describes what kind of symbol was found.
type SymbolKind string

const (
	KindFunction  SymbolKind = "function"
	KindMethod    SymbolKind = "method"
	KindType      SymbolKind = "type"
	KindInterface SymbolKind = "interface"
	KindClass     SymbolKind = "class"
	KindVariable  SymbolKind = "variable"
	KindConstant  SymbolKind = "constant"
)

// Symbol is a named entity declared in a file.
type Symbol struct {
	Name     string
	Kind     SymbolKind
	Line     int
	Receiver string // Go method receiver, if any
	Exported bool
}

// CallEdge represents a "caller calls callee" relationship within a file.
// Cross-file resolution happens later in the graph layer.
type CallEdge struct {
	CallerName string // name of the symbol doing the calling
	CalleeName string // name of the symbol being called (may be unresolved)
	Line       int
}

// FileInfo is the extraction result for a single file.
type FileInfo struct {
	File    walker.File
	Symbols []Symbol
	Calls   []CallEdge
}

// Extract reads a file and returns its symbols and call edges.
func Extract(f walker.File) (*FileInfo, error) {
	src, err := os.ReadFile(f.AbsPath)
	if err != nil {
		return nil, err
	}

	info := &FileInfo{File: f}

	switch f.Lang {
	case walker.LangGo:
		extractGo(string(src), info)
	case walker.LangTypeScript, walker.LangJavaScript:
		extractTS(string(src), info)
	case walker.LangPython:
		extractPython(string(src), info)
	case walker.LangRust:
		extractRust(string(src), info)
	}

	return info, nil
}

// ─── Go ─────────────────────────────────────────────────────────────────────

var (
	goFunc     = regexp.MustCompile(`^func\s+(?:\((\w+)\s+\*?\w+\)\s+)?(\w+)\s*\(`)
	goType     = regexp.MustCompile(`^type\s+(\w+)\s+(struct|interface)\b`)
	goVar      = regexp.MustCompile(`^(?:var|const)\s+(\w+)\b`)
	goCallExpr = regexp.MustCompile(`\b([A-Za-z_]\w*)\s*\(`)
)

func extractGo(src string, info *FileInfo) {
	lines := splitLines(src)
	currentFunc := ""

	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		lineNo := i + 1

		if m := goFunc.FindStringSubmatch(trimmed); m != nil {
			receiver, name := m[1], m[2]
			sym := Symbol{
				Name:     name,
				Kind:     KindFunction,
				Line:     lineNo,
				Receiver: receiver,
				Exported: isExported(name),
			}
			if receiver != "" {
				sym.Kind = KindMethod
			}
			info.Symbols = append(info.Symbols, sym)
			currentFunc = name
			continue
		}

		if m := goType.FindStringSubmatch(trimmed); m != nil {
			kind := KindType
			if m[2] == "interface" {
				kind = KindInterface
			}
			info.Symbols = append(info.Symbols, Symbol{
				Name:     m[1],
				Kind:     kind,
				Line:     lineNo,
				Exported: isExported(m[1]),
			})
			continue
		}

		if m := goVar.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{
				Name:     m[1],
				Kind:     KindVariable,
				Line:     lineNo,
				Exported: isExported(m[1]),
			})
			continue
		}

		// Detect calls inside function bodies
		if currentFunc != "" {
			for _, cm := range goCallExpr.FindAllStringSubmatch(trimmed, -1) {
				callee := cm[1]
				if isGoBuiltin(callee) || callee == currentFunc {
					continue
				}
				info.Calls = append(info.Calls, CallEdge{
					CallerName: currentFunc,
					CalleeName: callee,
					Line:       lineNo,
				})
			}
		}
	}
}

// ─── TypeScript / JavaScript ─────────────────────────────────────────────────

var (
	tsFunc    = regexp.MustCompile(`(?:^|\s)(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*[(<]`)
	tsArrow   = regexp.MustCompile(`(?:^|\s)(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(`)
	tsClass   = regexp.MustCompile(`(?:^|\s)(?:export\s+)?(?:abstract\s+)?class\s+(\w+)\b`)
	tsIface   = regexp.MustCompile(`(?:^|\s)(?:export\s+)?interface\s+(\w+)\b`)
	tsType    = regexp.MustCompile(`(?:^|\s)(?:export\s+)?type\s+(\w+)\s*=`)
	tsConst   = regexp.MustCompile(`(?:^|\s)(?:export\s+)?const\s+(\w+)\s*[=:]`)
	tsCallExp = regexp.MustCompile(`\b([A-Za-z_]\w*)\s*\(`)
)

func extractTS(src string, info *FileInfo) {
	lines := splitLines(src)
	currentFunc := ""

	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		lineNo := i + 1

		if m := tsFunc.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindFunction, Line: lineNo, Exported: strings.Contains(line, "export")})
			currentFunc = m[1]
			continue
		}
		if m := tsArrow.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindFunction, Line: lineNo, Exported: strings.Contains(line, "export")})
			currentFunc = m[1]
			continue
		}
		if m := tsClass.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindClass, Line: lineNo, Exported: strings.Contains(line, "export")})
			continue
		}
		if m := tsIface.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindInterface, Line: lineNo, Exported: strings.Contains(line, "export")})
			continue
		}
		if m := tsType.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindType, Line: lineNo, Exported: strings.Contains(line, "export")})
			continue
		}
		if m := tsConst.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindConstant, Line: lineNo, Exported: strings.Contains(line, "export")})
			continue
		}

		if currentFunc != "" {
			for _, cm := range tsCallExp.FindAllStringSubmatch(trimmed, -1) {
				callee := cm[1]
				if isTSBuiltin(callee) || callee == currentFunc {
					continue
				}
				info.Calls = append(info.Calls, CallEdge{CallerName: currentFunc, CalleeName: callee, Line: lineNo})
			}
		}
	}
}

// ─── Python ──────────────────────────────────────────────────────────────────

var (
	pyFunc    = regexp.MustCompile(`^(?:async\s+)?def\s+(\w+)\s*\(`)
	pyClass   = regexp.MustCompile(`^class\s+(\w+)\b`)
	pyConst   = regexp.MustCompile(`^([A-Z_][A-Z0-9_]*)\s*=`)
	pyCallExp = regexp.MustCompile(`\b([A-Za-z_]\w*)\s*\(`)
)

func extractPython(src string, info *FileInfo) {
	lines := splitLines(src)
	currentFunc := ""

	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		lineNo := i + 1

		if m := pyFunc.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindFunction, Line: lineNo, Exported: !strings.HasPrefix(m[1], "_")})
			currentFunc = m[1]
			continue
		}
		if m := pyClass.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindClass, Line: lineNo, Exported: !strings.HasPrefix(m[1], "_")})
			continue
		}
		if m := pyConst.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindConstant, Line: lineNo, Exported: true})
			continue
		}

		if currentFunc != "" {
			for _, cm := range pyCallExp.FindAllStringSubmatch(trimmed, -1) {
				callee := cm[1]
				if isPyBuiltin(callee) || callee == currentFunc {
					continue
				}
				info.Calls = append(info.Calls, CallEdge{CallerName: currentFunc, CalleeName: callee, Line: lineNo})
			}
		}
	}
}

// ─── Rust ────────────────────────────────────────────────────────────────────

var (
	rsFunc    = regexp.MustCompile(`(?:^|\s)(?:pub\s+)?(?:async\s+)?fn\s+(\w+)\s*[(<]`)
	rsStruct  = regexp.MustCompile(`(?:^|\s)(?:pub\s+)?struct\s+(\w+)\b`)
	rsTrait   = regexp.MustCompile(`(?:^|\s)(?:pub\s+)?trait\s+(\w+)\b`)
	rsEnum    = regexp.MustCompile(`(?:^|\s)(?:pub\s+)?enum\s+(\w+)\b`)
	rsConst   = regexp.MustCompile(`(?:^|\s)(?:pub\s+)?const\s+(\w+)\s*:`)
	rsCallExp = regexp.MustCompile(`\b([A-Za-z_]\w*)\s*\(`)
)

func extractRust(src string, info *FileInfo) {
	lines := splitLines(src)
	currentFunc := ""

	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		lineNo := i + 1

		if m := rsFunc.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindFunction, Line: lineNo, Exported: strings.Contains(line, "pub ")})
			currentFunc = m[1]
			continue
		}
		if m := rsStruct.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindType, Line: lineNo, Exported: strings.Contains(line, "pub ")})
			continue
		}
		if m := rsTrait.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindInterface, Line: lineNo, Exported: strings.Contains(line, "pub ")})
			continue
		}
		if m := rsEnum.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindType, Line: lineNo, Exported: strings.Contains(line, "pub ")})
			continue
		}
		if m := rsConst.FindStringSubmatch(trimmed); m != nil {
			info.Symbols = append(info.Symbols, Symbol{Name: m[1], Kind: KindConstant, Line: lineNo, Exported: strings.Contains(line, "pub ")})
			continue
		}

		if currentFunc != "" {
			for _, cm := range rsCallExp.FindAllStringSubmatch(trimmed, -1) {
				callee := cm[1]
				if isRsBuiltin(callee) || callee == currentFunc {
					continue
				}
				info.Calls = append(info.Calls, CallEdge{CallerName: currentFunc, CalleeName: callee, Line: lineNo})
			}
		}
	}
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func splitLines(src string) []string {
	var lines []string
	scanner := bufio.NewScanner(strings.NewReader(src))
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	return lines
}

func isExported(name string) bool {
	if name == "" {
		return false
	}
	c := name[0]
	return c >= 'A' && c <= 'Z'
}

func isGoBuiltin(name string) bool {
	builtins := map[string]bool{
		"append": true, "cap": true, "close": true, "complex": true, "copy": true,
		"delete": true, "imag": true, "len": true, "make": true, "new": true,
		"panic": true, "print": true, "println": true, "real": true, "recover": true,
		"string": true, "int": true, "uint": true, "bool": true, "byte": true,
		"rune": true, "error": true, "float64": true, "float32": true,
		"int64": true, "int32": true, "uint64": true, "uint32": true,
		"fmt": true, "os": true, "err": true,
	}
	return builtins[name]
}

func isTSBuiltin(name string) bool {
	builtins := map[string]bool{
		"console": true, "setTimeout": true, "setInterval": true, "clearTimeout": true,
		"parseInt": true, "parseFloat": true, "isNaN": true, "isFinite": true,
		"String": true, "Number": true, "Boolean": true, "Array": true, "Object": true,
		"Promise": true, "JSON": true, "Math": true, "Date": true, "Error": true,
		"require": true, "import": true, "export": true, "typeof": true, "instanceof": true,
		"if": true, "for": true, "while": true, "switch": true, "return": true,
	}
	return builtins[name]
}

func isPyBuiltin(name string) bool {
	builtins := map[string]bool{
		"print": true, "len": true, "range": true, "type": true, "isinstance": true,
		"int": true, "str": true, "float": true, "bool": true, "list": true, "dict": true,
		"set": true, "tuple": true, "enumerate": true, "zip": true, "map": true,
		"filter": true, "sorted": true, "reversed": true, "open": true, "super": true,
		"getattr": true, "setattr": true, "hasattr": true, "dir": true, "vars": true,
	}
	return builtins[name]
}

func isRsBuiltin(name string) bool {
	builtins := map[string]bool{
		"println": true, "print": true, "eprintln": true, "eprint": true,
		"vec": true, "format": true, "panic": true, "assert": true, "todo": true,
		"unimplemented": true, "unreachable": true, "dbg": true, "Some": true, "None": true,
		"Ok": true, "Err": true, "Box": true, "String": true, "Vec": true,
		"if": true, "for": true, "while": true, "match": true, "return": true,
	}
	return builtins[name]

}

// FileBaseName returns the base name of a file path without extension.
func FileBaseName(path string) string {
	base := filepath.Base(path)
	ext := filepath.Ext(base)
	return strings.TrimSuffix(base, ext)
}
