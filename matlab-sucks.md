yeah, so to make MATLAB usable on linux (if you call that “usable” ;)) you’ll have to do this:

install it
----------
not easy due to license bullshit.

best thing is to run the downloader, then cancel, then run the installer using `kdesu sh install` (or `gksu`), because `sudo sh install` fails with a huge stacktrace revealing horrible incantation on Java’s reflection API.

now it’s probably installed in `/usr/local/MATLAB`. (if you can’t be bothered to use linux’ directory structure, at least go to `/opt/yourshit`, not somewhere else!) but `/usr/local/bin` doesn’t contain a symlink to `/usr/local/MATLAB/somebullshit/bin/matlab`. create it.

now fire up `kmenuedit` or create a `.desktop` file in `/usr/local/share/applications`, with the following as call:

	env -u _JAVA_OPTIONS matlab -desktop

configure it
------------
finally start that godforsaken piece of atrociously wrapped implicitness and immediately call

	`userpath('/user/you/somewhere/sane')`

because the default is `~/Documents/MATLAB` no matter if that folder exists in your language. (you’ll have to delete it because MATLAB immediately created it when starting)

then go to “Settings → MATLAB → Keyboard → Shortcuts” and select “Windows Default Set” if you like your GUI application to behave like every other GUI application.

now you can use it without it not starting up, starting in terminal mode despite no terminal being attached, creating junk directories in your homedir, creating an “error log” containing the information that `$_JAVA_OPTIONS` is set (but we can thank Sun/Oracle for that one), or doing interesting things on standard shortcuts.

using it
--------
don’t.
