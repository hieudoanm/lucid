package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var dreamingCmd = &cobra.Command{
	Use: "dreaming",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("Dreaming")
	},
}

func dreaming() {
	rootCmd.AddCommand(dreamingCmd)
}
