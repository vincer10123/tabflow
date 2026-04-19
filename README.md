# tabflow

A CLI tool to manage and restore browser tab sessions from the terminal.

## Installation

```bash
npm install -g tabflow
```

## Usage

Save your current browser tabs as a named session, list saved sessions, and restore them anytime.

```bash
# Save current tabs as a session
tabflow save work-session

# List all saved sessions
tabflow list

# Restore a session
tabflow restore work-session

# Delete a session
tabflow delete work-session
```

Sessions are stored locally and can be restored across browser restarts or system reboots.

## Commands

| Command | Description |
|---|---|
| `save <name>` | Save current tabs as a named session |
| `list` | List all saved sessions |
| `restore <name>` | Open all tabs from a session |
| `delete <name>` | Remove a saved session |

## Requirements

- Node.js v14 or higher
- A supported browser (Chrome, Firefox, or Edge)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)