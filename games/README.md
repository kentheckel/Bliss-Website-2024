# Arcade unlock

The Games folder is a discoverable Easter egg. Trash → Passwords → passwords.txt
reveals `touchgrass`. Entering it unlocks all four games for the current tab via
sessionStorage. This public puzzle is separate from the server-side admin and
deck password; it does not protect private data.

`access.js` supplies the shared note, password check, and gate markup.
`js/arcade-access.js` connects the desktop and phone experiences. `guard.js` runs
before each game page and returns locked visitors to `/?app=games&game=…`.
After unlocking, only an allowlisted game path can be resumed. The Games folder
has a Lock games control. If adding another game, include the two head scripts
and add its path to `access.js` as well as the desktop/phone game lists.
