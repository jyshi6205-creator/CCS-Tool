# ccs-tool

Claude Code model configuration switcher — switch API endpoints, models, and keys with a single command.

## Installation

```bash
git clone https://github.com/jyshi6205-creator/CCS-Tool.git /tmp/ccs && cd /tmp/ccs && npm install && npm link
```

## Quick Start

```bash
# Initialize (import existing config or create new)
ccs init

# Add a profile
ccs add

# Switch profiles
ccs check              # interactive selection
ccs check my-profile   # by name
ccs 1                  # by index number

# Per-project auto-switch (optional)
eval "$(ccs hook)"     # add to .bashrc/.zshrc
ccs pin                # bind current directory to active profile
```

## Commands

| Command | Description |
|------|------|
| `ccs init` | Initialize, import existing Claude Code settings |
| `ccs add` | Add a new profile |
| `ccs check [profile]` | Switch profile (interactive, by name/ID, or by index) |
| `ccs <number>` | Quick switch by index (e.g. `ccs 1`) |
| `ccs list` | List all profiles (with index numbers) |
| `ccs current` | Show the currently active profile |
| `ccs edit [name]` | Edit a profile |
| `ccs clone [name]` | Clone a profile |
| `ccs remove` | Remove a profile |
| `ccs test [name]` | Test API connectivity |
| `ccs export` | Export profiles |
| `ccs import <file>` | Import profiles |
| `ccs restore` | Restore from backup |
| `ccs pin [profile]` | Bind current directory to a profile |
| `ccs unpin` | Unbind current directory |
| `ccs pins` | List all project bindings |
| `ccs auto` | Auto-switch based on current directory |
| `ccs hook` | Print shell hook code |

## Environment Variables

| Variable | Description |
|------|------|
| `CCS_CONFIG` | Custom config directory path |
| `CCS_CLAUDE_SETTINGS` | Custom Claude Code settings path |

## Config File Locations

- Config: `~/.ccs-tool/config.json`
- Backups: `~/.ccs-tool/backups/`
- Target: `~/.claude/settings.json`
- Project marker: `<project-root>/.ccs-tool.json`

## Features

- **Index switching**: `ccs list` shows index numbers, `ccs <n>` switches with one keystroke
- **Per-project auto-switch**: `ccs pin` binds a directory, `ccs hook` installs a shell hook
- **Multi-profile management**: save multiple API configurations
- **Fast switching**: switch providers with a single command
- **Auto backup**: automatic backups with restore support
- **Import/export**: sync profiles across machines
- **Connectivity test**: verify API reachability
- **Profile cloning**: quickly create a new profile from an existing one
- **Secure export**: API keys are redacted by default on export

## Per-Project Auto-Switch

Bind different model profiles to different projects — auto-switch when entering a directory:

```bash
# Install shell hook (add to .bashrc or .zshrc)
eval "$(ccs hook)"

# Bind current directory to the active profile
cd ~/work/project-a
ccs pin

# Or bind to a specific profile
ccs pin my-profile

# List all bindings
ccs pins

# Unbind
ccs unpin
```

## Examples

### Add a profile

```bash
ccs add
# Interactive prompts for name, API URL, token, model, etc.
```

### Quick switch

```bash
ccs check my-profile           # by name
ccs check p-mobll78sd1t3       # by ID
ccs 2                          # by index
```

### Test connectivity

```bash
ccs test my-profile    # test a specific profile
ccs test               # test the active profile
```

### Import / Export

```bash
ccs export -o backup.json                 # export (redacted)
ccs export -o backup.json --include-secrets  # export (with keys)
ccs import backup.json                    # import
ccs import backup.json --replace          # import and replace all
```

## Development

```bash
npm install
npm test
npm link
ccs --help
```

## License

MIT
