# vscodex README

Visual Studio Code extension to support new codex API by OpenAI.

An access is required in order to use the API. This access is granted through an **API key** and the key must be in the environment variable as `OPENAI_API_KEY`.

```
echo 'export OPENAI_API_KEY=********' >> ~/.bashrc
```

## Building vsix

```
npm install -g vsce
npm install
npm run compile
vsce package
code --install-extension ./vscodex-*.vsix
```

## Features

For now there is only one command:\
"OpenAI - Complete snippet" `vscodex.predict`\
**Shortcut**: `ctrl+enter`

![animation](assets/animation.gif)
