#!/bin/zsh
set -e

rst_dir="$HOME/Dev/Rust/rust-rst"
export PATH="$rst_dir/target/debug:$PATH"

(
	cd $rst_dir
	cargo build
)

{
	for file in posts/*.rst
	do
		content="$(rst -f json "$file" | sed 's/\\/\\\\/g')"
		echo "{\"file\": \"$file\", \"content\": $content }"
	done
} | jq '[.]'
