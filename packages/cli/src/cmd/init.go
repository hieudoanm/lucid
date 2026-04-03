package cmd

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/spf13/cobra"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize environment variables",
	Run: func(cmd *cobra.Command, args []string) {
		reader := bufio.NewReader(os.Stdin)

		fmt.Println("🚀 Starting initialization...")
		fmt.Println()

		// Telegram API Token
		fmt.Print("🤖 Enter Telegram API Token: ")
		telegramToken, _ := reader.ReadString('\n')
		telegramToken = strings.TrimSpace(telegramToken)
		if err := setEnv("TELEGRAM_API_TOKEN", telegramToken); err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error setting TELEGRAM_API_TOKEN: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("✅ TELEGRAM_API_TOKEN=%s\n", maskValue(telegramToken))

		fmt.Println()

		// OpenRouter API Key
		fmt.Print("🔑 Enter OpenRouter API Key: ")
		openRouterKey, _ := reader.ReadString('\n')
		openRouterKey = strings.TrimSpace(openRouterKey)
		if err := setEnv("OPEN_ROUTER_API_KEY", openRouterKey); err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error setting OPEN_ROUTER_API_KEY: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("✅ OPEN_ROUTER_API_KEY=%s\n", maskValue(openRouterKey))

		fmt.Println()
		fmt.Println("🎉 Initialization complete!")
	},
}

func maskValue(s string) string {
	if len(s) < 10 {
		return "*****"
	}
	return s[:5] + "*****" + s[len(s)-5:]
}

func setEnv(key, value string) error {
	shell := os.Getenv("SHELL")
	var profile string
	if strings.Contains(shell, "zsh") {
		profile = os.Getenv("HOME") + "/.zshrc"
	} else {
		profile = os.Getenv("HOME") + "/.bashrc"
	}

	sedCmd := exec.Command("sed", "-i", "", "/^export "+key+"=/d", profile)
	_ = sedCmd.Run()

	f, err := os.OpenFile(profile, os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("could not open %s: %w", profile, err)
	}
	defer f.Close()

	_, err = fmt.Fprintf(f, "\nexport %s=%q\n", key, value)
	if err != nil {
		return fmt.Errorf("could not write to %s: %w", profile, err)
	}

	return os.Setenv(key, value)
}

func init() {
	rootCmd.AddCommand(initCmd)
}
