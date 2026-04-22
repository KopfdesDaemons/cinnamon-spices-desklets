const St = imports.gi.St;
const Tooltips = imports.ui.tooltips;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext;
const Gio = imports.gi.Gio;

const UUID = "devtest-minecraft-server-status@KopfdesDaemons";

Gettext.bindtextdomain(UUID, GLib.get_user_data_dir() + "/locale");

function _(str) {
  return Gettext.dgettext(UUID, str);
}

var UiHelper = class {
  getHeader(options) {
    const { scaleSize, reloadCallback } = options;
    const header = new St.BoxLayout();
    const reloadButtonStyle = `width: ${1.6 * scaleSize}em; height: ${1.6 * scaleSize}em; padding: ${0.2 * scaleSize}em;`;

    const headline = new St.Label({ text: _("Minecraft Server Status") });
    header.add(headline, { y_fill: false });

    // Reload button
    const reloadButton = new St.Button({
      style_class: "minecraft-server-status-reload-button",
      style: reloadButtonStyle,
    });
    reloadButton.connect("clicked", reloadCallback);
    const reloadIcon = new St.Icon({
      icon_name: "view-refresh-symbolic",
      icon_type: St.IconType.SYMBOLIC,
      style: reloadButtonStyle,
    });
    new Tooltips.Tooltip(reloadButton, _("Reload"));
    reloadButton.set_child(reloadIcon);
    const spacer = new St.Bin({ x_expand: true });
    header.add(spacer);
    header.add_child(reloadButton);

    return header;
  }

  getServerListItem(options) {
    const { name, status, scaleSize } = options;

    const item = new St.BoxLayout();
    item.set_style(`height: ${scaleSize * 3}em;`);

    // Favicon
    if (status.faviconPath) {
      const gicon = Gio.FileIcon.new(Gio.File.new_for_path(status.faviconPath));
      const icon = new St.Icon({
        gicon: gicon,
        icon_size: Math.round(scaleSize * 24),
        style: `width: ${scaleSize * 1.5}em; height: ${scaleSize * 1.5}em; margin-right: ${scaleSize * 0.5}em;`,
      });
      const iconBox = new St.Bin({ child: icon });
      item.add(iconBox, { y_fill: false, y_align: St.Align.MIDDLE });
    }

    // Name
    const nameLabel = new St.Label({ text: name });
    item.add(nameLabel, { y_fill: false, y_align: St.Align.MIDDLE });

    // Free Space
    const spacer = new St.Bin({ x_expand: true });
    item.add(spacer);

    // Player
    const playerCount = status.players.toString() + "/" + status.maxPlayers.toString();
    const playerLabel = new St.Label({ text: playerCount });
    item.add(playerLabel, { y_fill: false, y_align: St.Align.MIDDLE });

    // Signal
    const signalIndicator = this._getSignalIndicator(scaleSize, status.ping);
    item.add(signalIndicator, { y_fill: false, y_align: St.Align.MIDDLE });

    return item;
  }

  _getSignalIndicator(scaleSize, ping) {
    const signalBox = new St.BoxLayout();
    signalBox.set_style(`spacing: ${scaleSize * 0.15}em; padding-left: ${scaleSize * 0.5}em;`);

    let activeBars = 5;
    let activeColor = "#00ff21";

    if (ping >= 1000) {
      activeBars = 1;
      activeColor = "#ff0000";
    } else if (ping >= 500) {
      activeBars = 2;
      activeColor = "#ff0000";
    } else if (ping >= 250) {
      activeBars = 3;
      activeColor = "#ffff00";
    } else if (ping >= 150) {
      activeBars = 4;
    }

    for (let i = 0; i < 5; i++) {
      const bar = new St.Bin();
      const height = scaleSize * (0.3 + i * 0.2);
      const color = i < activeBars ? activeColor : "rgba(134, 134, 134, 0.5)";
      bar.set_style(`height: ${height}em; width: ${scaleSize * 0.2}em; background-color: ${color};`);
      signalBox.add(bar, { y_fill: false, y_align: St.Align.END });
    }

    const container = new St.Bin({ child: signalBox });

    return container;
  }
};
