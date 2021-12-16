# Bodocord

**This is WIP project. We don't recommend use in production.**

Bodocord is a Discord bot to playing board games on Discord.

## Getting Started

**Dependencies:**

- deno
- [denon](https://github.com/denosaurs/denon)
- git
- Discord Account

You need to create your bot from
[Discord Developer Portal](https://discord.com/developers/applications) before
installing.

1. Clone repository

```
git clone https://github.com/sera1mu/bodocord.git
cd bodocord
```

2. Create config

Create a JSON file as appropriate.

```jsonc
// Example config
{
  "loggers": { // Loggers settings
    "system": { // System logger
      "name": "system",
      "level": "info"
    },
    "client": { // Discord Client logger
      "name": "client",
      "level": "warn"
    },
    // See https://getpino.io/#/docs/api?id=options
    "bcdiceAPIServer": "https://bcdice.onlinesession.app"
  }
}
```

3. Set environment variables

```
BC_CONFIG=PATH_TO_CONFIG
BC_TOKEN=YOUR_BOT_TOKEN
```

4. Cache modules

```
deno cache --no-check --unstable --import-map deps.json src/boot.ts
```

5. Start

```
denon start
```

## Usage

WIP

## License

[AGPL-3.0 &copy; Seraimu](https://github.com/sera1mu/bodocord/blob/main/LICENSE)
