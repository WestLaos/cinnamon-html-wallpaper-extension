/**
 * @name  Cinnamon-Extension-Test
 * @version 1.0.0
 * @alias West
 * @since 2025-07-06
 * 
 * @description Main application file
 */

/******************** Constants ********************/

const Util = imports.misc.util;
const Settings = imports.ui.settings;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

/******************** Variables ********************/

let UUID;
let NAME;
let PATH;

let extension;

/******************** Extension ********************/

function CinnamonHTMLWallpaperExtension(uuid) {
	this._init(uuid);
}

CinnamonHTMLWallpaperExtension.prototype = {

	/**
	 * Initializes the extension.
	 */
	_init: function(uuid) { 
		this.settings = new Settings.ExtensionSettings(this, uuid);
		this.loop = new GLib.MainLoop(null, false);
		this.loopEnabled = false;
	},

	bindSettings: function (ui_name, js_name, func = this.on_settings_changed) {
		this.settings.bindProperty(
			Settings.BindingDirection.IN,
			ui_name,
			js_name,
			func
		)
	},

	/**
	 * Calls run the python script resposible for setting the wallpaper.
	 */
	_loop: function () {
		if (!this.loopEnabled) {
			return GLib.SOURCE_REMOVE;
		}
		
		global.log("Loop")

		try {
        	let bus = Gio.DBus.session;
        	let proxy = Gio.DBusProxy.new_sync(bus, Gio.DBusProxyFlags.NONE, null,
				'org.cinnamon.HtmlWallpaperWindow', 	// bus name
				'/org/cinnamon/HtmlWallpaperWindow', 	// object path
				'org.cinnamon.HtmlWallpaperWindow', 	// interface name
				null
			);

        	proxy.call_sync('Reload', null, Gio.DBusCallFlags.NONE, -1, null);
		} catch (e) {
        	global.logError(e, `${NAME}: Error calling wallpaper updater D-Bus service`);
    	}

		GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10000, () => this._loop());
    	return GLib.SOURCE_REMOVE;
	},

	/**
	 * Starts the main loop of the extension.
	 */
	enable: function () {
		try {
			let venvPython = `${PATH.substring(0, PATH.lastIndexOf('/'))}/venv/bin/python3`;
			let script = `${PATH}/src/htmlWallpaperWindow.py`;
			let cmd = `${venvPython} ${script}`;
			GLib.spawn_command_line_async(cmd);
		} catch(e) {
			global.logError(e, `${NAME}: Error running wallpaper updater script`);
		}

		// this.loopEnabled = true;
		// GLib.timeout_add(
    	// 	GLib.PRIORITY_DEFAULT,
    	// 	10000, 
    	// 	() => this._loop()
		// );
	},

	/**
	 * Stops the main loop of the extension.
	 */
	disable: function () {
		this.loopEnabled = false;

		try {
        	let bus = Gio.DBus.session;
        	let proxy = Gio.DBusProxy.new_sync(bus, Gio.DBusProxyFlags.NONE, null,
            	'org.cinnamon.HtmlWallpaperWindow',
            	'/org/cinnamon/HtmlWallpaperWindow',
            	'org.cinnamon.HtmlWallpaperWindow',
            	null
        	);
        	proxy.call_sync('Quit', null, Gio.DBusCallFlags.NONE, -1, null);
    	} catch (e) {
        	global.logError(e, `${NAME}: Error calling Quit on wallpaper updater D-Bus service`);
    	}
	}
}

/******************** Methods ********************/

/**
 * Called when extension is loaded
 */
function init(extensionMeta) {
  UUID = extensionMeta['uuid'];
  NAME = extensionMeta['name'];
  PATH = imports.ui.extensionSystem.extensionMeta[UUID].path;

  extension = new CinnamonHTMLWallpaperExtension(UUID);
}

/**
 * Called when extension is enabled
 */
function enable() {
  extension.enable();
}

/**
 * Called when extension gets disabled
 */
function disable() {
	extension.disable();
}