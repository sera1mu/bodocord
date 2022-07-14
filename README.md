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
  "bcdiceAPIServer": "https://bcdice.onlinesession.app"
}
```

3. Set environment variables

```
BC_CONFIG=PATH_TO_CONFIG
BC_TOKEN=YOUR_BOT_TOKEN
```

4. Cache modules

```
deno cache --unstable src/boot.ts
```

5. Start

```
deno task start
```

## Usage

- `/linux` :: Send
  [this GIF](https://tenor.com/view/linux-trash-linuxbad-gif-18671901) to
  channel. (For testing)
  - Example: `/linux`
- `/dice [sides?: number]` :: Roll the dice. You can specify from 2 to
  1000-sided dice.
  - Example: `/dice` `/dice 100`
- `/bcdice info` :: Displays information about the BCDice API server.
  - Example: `/bcdice info`
- `/bcdice systems [system?: string]` :: Displays information about the game
  system with the specified ID.
  - Example: `/bcdice systems` `/bcdice systems DiceBot`
- `/bcdice roll [system: string] [command: string]` :: Roll the dice with
  BCDice.
  - Example: `/bcdice roll DiceBot 3D6+1>=9`

## License

[AGPL-3.0 &copy; Seraimu](https://github.com/sera1mu/bodocord/blob/main/LICENSE)
