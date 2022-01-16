/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'android-scrcpy-remote-extension';

const {GObject, St} = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new PanelMenu.Button(0);
        let box = new St.BoxLayout({style_class: 'panel-status-menu-box'});
        this._icon = new St.Icon({style_class: 'system-status-icon'});
        this.redraw();

        box.add_child(this._icon);
        this._indicator.add_child(box);

        this._indicator.connect('button-press-event', () => {
            if (this._scrcpy) {
                this._scrcpy.force_exit();
                delete this._scrcpy;
            } else {
                this._scrcpy = Gio.Subprocess.new(
                    ['/opt/scrcpy/bin/scrcpy', '--stay-awake', '--turn-screen-off'],
                    Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
                );
            }
            this.redraw();
        });

        Main.panel.addToStatusArea(this._uuid, this._indicator, 0, "right");
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }

    redraw() {
        let filename = this._scrcpy ? 'enabled.svg' : 'disabled.svg';
        this._icon.set_gicon(Gio.icon_new_for_string(Me.path + '/icons/' + filename));
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
