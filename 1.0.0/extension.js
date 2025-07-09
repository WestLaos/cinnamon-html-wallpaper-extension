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
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const { find_program_in_path } = imports.gi.GLib;
const Gio = imports.gi.Gio;
const MessageTray = imports.ui.messageTray;
const St = imports.gi.St;
const Main = imports.ui.main;
const Gettext = imports.gettext;
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

	_init: function(uuid) { 
		global.log(`Initializing extension: ${NAME}`);
		this.settings = new Settings.ExtensionSettings(this, uuid);
	},

	bindSettings: function (ui_name, js_name, func = this.on_settings_changed) {
		global.log(`Binding setting: ${ui_name} to ${js_name}`);
		this.settings.bindProperty(
			Settings.BindingDirection.IN,
			ui_name,
			js_name,
			func
		)
	},

	_loop: function () {
	},

	enable: function () {
		global.log(`Enabling extension: ${NAME}`);
		this._loop();
	},

	disable: function () {
		global.log(`Disabling extension: ${NAME}`);
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

  extension = new CinnamonTestExtension(UUID);
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