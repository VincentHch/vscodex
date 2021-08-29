# VSCodex

Visual Studio Code extension to support the new codex API by OpenAI.

An *API key* (access token) is required in order to use this extension. This token is issued by OpenAI and must be in an environment variable named `OPENAI_API_KEY`. You can alternatively specify the API key in the extension settings although this might be less secure, and is generally discouraged.

```
echo 'export OPENAI_API_KEY=********' >> ~/.bashrc
```

## Building and installing extension

```
npm install -g vsce && npm run build:install
```

## Features

https://user-images.githubusercontent.com/48289861/131251824-f8ffc248-fd96-4792-8df6-a5fc779eb03d.mov

### Complete snippet (`vscodex.predict`)
**Shortcut**: `ctrl+enter`

### Set level and complete snippet
**Shortcut**: `ctrl+shift+enter`

To avoid predicting more code than needed, stop-sequences can be specified like `class`. A level can be set and modified in the extension.
* Function-level: will only complete your function
* Class-level: will only complete your class
* File-level: No restrictions
* Custom-level: User specified stop sequence.




