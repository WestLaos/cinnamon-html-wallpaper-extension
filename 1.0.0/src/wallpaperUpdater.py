# Gio
import gi
from gi.repository import Gio, GLib

# GDK
gi.require_version("Gdk", "3.0")
from gi.repository import Gdk

gi.require_version('Wnck', '3.0')
from gi.repository import Wnck

# Packages
import os, subprocess
from pathlib import Path

# Check if there are any maximized windows on the current workspace
# If there are, do not update the wallpaper
scr = Wnck.Screen.get_default()
scr.force_update()
windows = scr.get_windows()

for w in windows: 
    if w.is_visible_on_workspace(scr.get_active_workspace()) and w.is_maximized():
        exit(0)

# Get the directories
directory = Path(os.path.split(os.path.realpath(__file__))[0]).parent 

res_dir = Path.joinpath(directory, "res")
wallpapers_dir = Path.joinpath(res_dir,  "wallpapers")

html_path = str(Path.joinpath(wallpapers_dir, "test.html"))
image_path = f'{res_dir}/output.jpg'
image_uri = GLib.filename_to_uri(image_path, None)

display = Gdk.Display.get_default()
monitor = display.get_primary_monitor()
geometry = monitor.get_geometry()
background_settings = Gio.Settings.new("org.cinnamon.desktop.background")

if os.path.exists(html_path):
    # Render the HTML to an image using wkhtmltoimage
    subprocess.run(['wkhtmltoimage', '-q', '--height', str(geometry.height), '--width', str(geometry.width),html_path, image_path])

    if os.path.exists(image_path):
        if not background_settings["picture-uri"] is image_uri: background_settings["picture-uri"] = image_uri
    else:
        print(f"Image URI does not exist: {image_uri}")
        exit(1)
else:
    print(f"HTML file does not exist: {html_path}")
    exit(1)