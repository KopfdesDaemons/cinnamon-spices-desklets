const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext;
const Gio = imports.gi.Gio;
const Settings = imports.ui.settings;

const UUID = "music-control@KopfdesDaemons";

Gettext.bindtextdomain(UUID, GLib.get_user_data_dir() + "/locale");

function _(str) {
  return Gettext.dgettext(UUID, str);
}

class MyDesklet extends Desklet.Desklet {
  constructor(metadata, deskletId) {
    super(metadata, deskletId);
    this.setHeader(_("Music Control"));

    this._imagePath = metadata.path + "/images/rapido.jpg";

    // Default settings
    this.scaleSize = 1;

    // Bind settings
    this.settings = new Settings.DeskletSettings(this, metadata["uuid"], deskletId);
    this.settings.bindProperty(Settings.BindingDirection.IN, "scale-size", "scaleSize", this._onScaleChanged);
  }

  _onScaleChanged() {
    this._setupLayout();
  }

  on_desklet_added_to_desktop() {
    this._setupLayout();
  }

  _setupLayout() {
    const container = this._getContainer();
    this.setContent(container);
  }

  _getContainer() {
    const widget = new St.BoxLayout({
      vertical: true,
      style: `background-image: url("file://${this._imagePath}"); background-size: cover; background-position: center; width: ${20 * this.scaleSize}em; height: ${20 * this.scaleSize}em; border-radius: ${3 * this.scaleSize}em; border: ${0.1 * this.scaleSize}em solid rgba(255, 255, 255, 1);`,
    });

    // Spacer to push content into the lower half
    const spacer = new St.Widget({ style: `height: ${10 * this.scaleSize}em;` });
    widget.add_child(spacer);

    // Title
    const titleRow = new St.Bin({ style: `width: ${20 * this.scaleSize}em; background-color: rgba(0, 0, 0, 0.7);` });
    const title = new St.Label({
      text: "Schnell, Schneller, Rapido",
      style: `text-align: center; font-size: ${1.5 * this.scaleSize}em; border-radius: ${1 * this.scaleSize}em; max-width: ${11 * this.scaleSize}em; padding: ${0.2 * this.scaleSize}em ${0.8 * this.scaleSize}em;`,
    });
    titleRow.set_child(title);
    widget.add_child(titleRow);

    // Artist
    const artistRow = new St.Bin({ style: `width: ${20 * this.scaleSize}em; background-color: rgba(0, 0, 0, 0.7);` });
    const artist = new St.Label({
      text: "Rapido",
      style: `text-align: center; font-size: ${1 * this.scaleSize}em; border-radius: ${1 * this.scaleSize}em; max-width: ${11 * this.scaleSize}em; padding: ${0.2 * this.scaleSize}em ${0.8 * this.scaleSize}em;`,
    });
    artistRow.set_child(artist);
    widget.add_child(artistRow);

    // Controls
    const controlsRow = new St.Bin({ x_align: St.Align.MIDDLE, style: `width: ${20 * this.scaleSize}em;` });
    const controlsRowContent = new St.BoxLayout({
      style: `margin-top: ${1 * this.scaleSize}em; background-color: rgba(0, 0, 0, 0.7); padding: ${0.2 * this.scaleSize}em ${0.5 * this.scaleSize}em; border-radius: ${1 * this.scaleSize}em;`,
    });

    const controlButtonStyle = `height: ${3 * this.scaleSize}em; width: ${3 * this.scaleSize}em; pdding: ${0.2 * this.scaleSize}em; border-radius: ${0.2 * this.scaleSize}em;`;

    const createButton = iconName => {
      return new St.Button({
        child: new St.Icon({ icon_name: iconName, icon_type: St.IconType.SYMBOLIC, style: controlButtonStyle }),
        style_class: "music-control-button",
        style: controlButtonStyle,
      });
    };

    controlsRowContent.add_child(createButton("media-seek-backward"));
    controlsRowContent.add_child(createButton("media-playback-start"));
    controlsRowContent.add_child(createButton("media-playback-pause"));
    controlsRowContent.add_child(createButton("media-seek-forward"));

    controlsRow.set_child(controlsRowContent);
    widget.add_child(controlsRow);

    return widget;
  }
}

function main(metadata, deskletId) {
  return new MyDesklet(metadata, deskletId);
}
