<!-- omit in toc -->
# Git Cleaner

<!-- omit in toc -->
## Contents

- [📘 Description](#-description)
  - [Features](#features)
- [🚢 Installation](#-installation)
- [🔧 Usage](#-usage)
  - [Commands](#commands)
  - [Examples](#examples)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 📘 Description

Git Cleaner CLI is a command-line tool designed to delete Git resources past any given period of time.

### Features

- **Delete tags:** Deletes all tags from an organization or repository that are marked as stale.

## 🚢 Installation

To install Git Cleaner CLI from the source, follow these steps:

```bash
curl -s -L https://github.com/gbh-tech/git-cleaner/releases/download/v0.3.0/git-cleaner-darwin-x64.tar.gz | tar xz
chmod +x git-cleaner
sudo mv git-cleaner /usr/local/bin
```

## 🔧 Usage

Once installed, you can use the git-cleaner command to generate .env files based on Werf or 1Password.

### Commands

- **tags:** Delete all stale tags of any given period if they are older than the minimum to remain.

### Examples

To generate a .env file using Werf:

```bash
./git-cleaner tag -o gbh-tech -r cockpit-api -n 5
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (git checkout -b feature-branch).
3. Make your changes.
4. Commit your changes (git commit -m 'Add new feature').
5. Push to the branch (git push origin feature-branch).
6. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.
