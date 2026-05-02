/**
 * Print shell hook code
 * For eval "$(ccs hook)" installation into .bashrc/.zshrc
 */
export function hookCommand() {
  const hook = `# ccs-tool shell hook — auto-switch project model config
ccs_hook() {
  builtin "$@"
  local exit_code=$?
  if [ $exit_code -eq 0 ] && command -v ccs >/dev/null 2>&1; then
    ccs auto --quiet 2>/dev/null
  fi
  return $exit_code
}
cd() { ccs_hook cd "$@"; }
pushd() { ccs_hook pushd "$@"; }
popd() { ccs_hook popd "$@"; }`;

  process.stdout.write(hook + '\n');
}
