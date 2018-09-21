
Debian
====================
This directory contains files used to package compchaind/compchain-qt
for Debian-based Linux systems. If you compile compchaind/compchain-qt yourself, there are some useful files here.

## compchain: URI support ##


compchain-qt.desktop  (Gnome / Open Desktop)
To install:

	sudo desktop-file-install compchain-qt.desktop
	sudo update-desktop-database

If you build yourself, you will either need to modify the paths in
the .desktop file or copy or symlink your compchain-qt binary to `/usr/bin`
and the `../../share/pixmaps/compchain128.png` to `/usr/share/pixmaps`

compchain-qt.protocol (KDE)

