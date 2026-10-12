# Install Data Kit

## Claude app (web or desktop)

1. Download [data-kit.zip](https://aeleraqi.github.io/data-kit/data-kit.zip). It contains one folder, `data-kit/`, with `SKILL.md` inside. Don't unpack it.
2. Open [claude.ai/customize/skills](https://claude.ai/customize/skills) on the web or in the desktop app (Customize → Skills).
3. Upload the zip and turn the skill on.
4. Start a new chat and ask, for example: «كم بلغ التضخم في مصر والأردن والمغرب منذ ٢٠٢٢؟»

If you build the zip yourself, zip the `data-kit` folder, not the file alone: a `SKILL.md` at the root of the zip isn't recognised.

## Claude Code and Codex

Download [SKILL.md](https://raw.githubusercontent.com/aeleraqi/data-kit/main/SKILL.md) and save it in a folder named `data-kit`. Keep the filename in capitals. The file holds the instructions, 28 source guides, example requests and the licence. It needs no other files.

| Client | In one project | For all your projects on this machine |
| --- | --- | --- |
| Claude Code | `.claude/skills/data-kit/SKILL.md` | `~/.claude/skills/data-kit/SKILL.md` |
| Codex | `.agents/skills/data-kit/SKILL.md` | `~/.agents/skills/data-kit/SKILL.md` |

`~` is your home folder. Start a new session if the client doesn't pick up the skill.

Invoke `/data-kit` in Claude Code or `$data-kit` in Codex, then ask, in Arabic or English:

> كم بلغ التضخم في مصر والأردن والمغرب منذ ٢٠٢٠؟ أعطني الأرقام والمصدر وتاريخ التحديث.

Then keep going: add a country, ask for a chart, or ask for the same table from the IMF.

If you installed an earlier version under `arab-data-kit`, delete that folder so the client doesn't load both.

## Tools and access

Your session needs a way to fetch URLs or run HTTP requests, with network access allowed. Without that, the assistant can write the request but can't check the answer.

Most routes are open. Three need something extra:

- NASA FIRMS needs a free MAP_KEY.
- Copernicus Data Space and NASA Earthdata (Black Marble files) need a free account to download files. Searching their catalogues is open.
- CAPMAS and the ESCWA portal have no public API. You download files by hand.

Keep keys in your usual secret store, not in prompts or commits.

These paths cover Claude Code and Codex. A folder on your machine does not install the skill in Claude's web or desktop apps; those use account-level skill settings.

References: [Agent Skills format](https://agentskills.io/specification), [Claude Code skills](https://code.claude.com/docs/en/skills).
