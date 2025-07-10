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

		this.sourceId = GLib.timeout_add(
    		GLib.PRIORITY_DEFAULT,
    		500, 
    		() => this._loop()
		);
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
		
		try {
			GLib.spawn_command_line_async("/usr/bin/env python3 " + PATH  + "/src/wallpaperUpdater.py");
			
			// This way of running the script is just for testing purposes.
			// In production, you should use GLib.spawn_command_line_async or similar methods to
			// let [res, out, err, status] = GLib.spawn_command_line_sync("/usr/bin/env python3 " + PATH  + "/src/wallpaperUpdater.py");
			// if (res) {
			// 	global.log("stdout: " + out.toString());
			// 	if (err && err.length > 0) {
			// 		global.log("stderr: " + err.toString());
			// 	}
			// } else {
			// 	global.logError(`${NAME}: Failed to run wallpaper updater script`);
			// }
		} catch(e) {
			global.logError(e, `${NAME}: Error running wallpaper updater script`);
		}

		return GLib.SOURCE_CONTINUE;
	},

	/**
	 * Starts the main loop of the extension.
	 */
	enable: function () {
		this.loopEnabled = true;
		this.loop.runAsync();
	},

	/**
	 * Stops the main loop of the extension.
	 */
	disable: function () {
		this.loopEnabled = false;
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