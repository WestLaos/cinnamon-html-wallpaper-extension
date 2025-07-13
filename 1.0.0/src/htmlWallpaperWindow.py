import sys, os, gi, subprocess, json, configparser, signal
from pathlib import Path

from pydbus import SessionBus

gi.require_version("Gdk", "3.0")
from gi.repository import Gio, GLib, Gdk

# GTK
gi.require_version("Gtk", "3.0")
from gi.repository import Gtk, GdkPixbuf

from Xlib import display
from Xlib.ext import shape

from PyQt5.QtCore import Qt, QUrl, QTimer, QObject, pyqtSlot, QVariant, QProcess, pyqtSignal
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtGui import QPixmap, QScreen
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtWebChannel import QWebChannel

class Backend(QObject):

    @pyqtSlot(str)
    def launch(self, exec_cmd):
        subprocess.Popen(exec_cmd, shell=True, start_new_session=True, cwd=os.path.expanduser("~"))

    @pyqtSlot(result=QVariant)
    def getDesktopSettings(self):
        font = subprocess.check_output([
            "gsettings", "get", "org.nemo.desktop", "font"
        ]).decode("utf-8").strip().strip("'")
        
        *name_parts, size = font.split()
        name = " ".join(name_parts)

        return {"name": name, "size": int(size) }
        
    @pyqtSlot(result=QVariant)
    def getDesktopIcons(self):
        icons = []
        icon_size = Gtk.icon_size_lookup(Gtk.IconSize.DIALOG).height
        desktop_theme = Gtk.IconTheme.get_for_screen(Gdk.Screen.get_default())

        icon_visible = subprocess.check_output([
            "gsettings", "get", "org.nemo.desktop", "show-desktop-icons"
        ]).decode("utf-8").strip().strip("'")

        if not bool(icon_visible):
            return icons

        for file in Path.home().joinpath("Desktop").glob("*.desktop"):
            config = configparser.ConfigParser(interpolation=None)
            config.read(file)

            entry = config["Desktop Entry"]

            icon_name = entry.get("Icon", "")
            icon_path = desktop_theme.lookup_icon(icon_name, icon_size, 0).get_filename()

            icons.append({
                "name": entry.get("Name", file.stem),
                "icon": icon_path if icon_path else None,
                "size": icon_size,
                "exec": entry.get("Exec", fallback="")
            })

            def myFunc(e):
                return e['year']

            icons.sort(key=(lambda x: x["name"]))

        return icons

class HtmlWallpaperWindow(QMainWindow):
    """
    <node>
        <interface name='org.cinnamon.HtmlWallpaperWindow'>
            <method name='Reload'/>
            <method name='Quit'/>
        </interface>
    </node>
    """

    def __init__(self):
        super().__init__()

        self.DIRECTORY: Path = Path(os.path.split(os.path.realpath(__file__))[0]).parent

        self.setWindowTitle("HtmlWallpaperWindow")
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.Tool| Qt.WindowStaysOnBottomHint)

        self.view = QWebEngineView(self)
        self.view.setFocusPolicy(Qt.NoFocus)
        self.setCentralWidget(self.view)

        self.channel = QWebChannel()
        self.backend = Backend()
        self.channel.registerObject("backend", self.backend)

        self.view.page().setWebChannel(self.channel)
        self.view.load(QUrl.fromLocalFile(str(self.DIRECTORY.joinpath("res", "wallpaper.html"))))

        self.showMaximized()

    def Reload(self):
        self.view.reload()

    def Quit(self):
        self.view.close()
        QApplication.quit()


# D-Bus service setup
if __name__ == "__main__":
    #import signal
    signal.signal(signal.SIGINT, signal.SIG_DFL)  # allow Ctrl+C to work

    app = QApplication(sys.argv)

    # Register D-Bus interface
    bus = SessionBus()
    bus.publish("org.cinnamon.HtmlWallpaperWindow", HtmlWallpaperWindow())

    sys.exit(app.exec_())