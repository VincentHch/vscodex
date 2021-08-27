# VSCodex

Visual Studio Code extension to support the new codex API by OpenAI.

An access is required in order to use the API. This access is granted through an **API key** and the key must be in the environment variable as `OPENAI_API_KEY`. You can also specify the API key in the extension settings although this might be less secure.

```
echo 'export OPENAI_API_KEY=********' >> ~/.bashrc
```

## Building and installing extension

```
npm install -g vsce && npm run build:install
```


## Features

For now there is only one command:\
"OpenAI - Complete snippet" `vscodex.predict`\
**Shortcut**: `ctrl+enter`

![animation](assets/animation.gif)
