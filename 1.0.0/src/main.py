# GTK
import gi
gi.require_version("Gtk", "3.0")
from gi.repository import Gtk, GdkPixbuf

# Packages
import sys, os, json, subprocess
from pathlib import Path

class ConfigurationMenuWindow:
    def __init__(self):
        self.builder = Gtk.Builder()
        self.builder.set_translation_domain("cinnamon-test-extension@laoswest")
        self.builder.add_from_file(str(Path.joinpath(Path.cwd(), "1.0.0", "res", "configMenu.glade" )))
        self.builder.connect_signals(self)

    def show(self):
        # Create a simple GTK window
        self.builder.get_object("window_main").show_all()

        # Show the configuration window
        Gtk.main()

    # GTK signal handlers
    def on_destroy(self, widget):
        sys.exit(0)

if __name__ == "__main__":
    config_menu = ConfigurationMenuWindow()
    config_menu.show()