const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext;
const Settings = imports.ui.settings;

const UUID = "devtest-minecraft-server-status@KopfdesDaemons";

let MinecraftServerStatusHelper, UiHelper;
if (typeof require !== "undefined") {
  MinecraftServerStatusHelper = require("./helpers/minecraft-server-status").MinecraftServerStatusHelper;
  UiHelper = require("./helpers/ui").UiHelper;
} else {
  const DESKLET_DIR = imports.ui.deskletManager.desklets[UUID];
  MinecraftServerStatusHelper = DESKLET_DIR.helpers["minecraft-server-status"].MinecraftServerStatusHelper;
  UiHelper = DESKLET_DIR.helpers.ui.UiHelper;
}

Gettext.bindtextdomain(UUID, GLib.get_user_data_dir() + "/locale");

function _(str) {
  return Gettext.dgettext(UUID, str);
}

class MyDesklet extends Desklet.Desklet {
  constructor(metadata, deskletId) {
    super(metadata, deskletId);
    this.setHeader(_("Minecraft Server Status"));

    // Properties
    this._mainContainer = null;
    this._isReloading = false;

    // Helpers
    this.minecraftServerStatusHelper = new MinecraftServerStatusHelper();
    this.uiHelper = new UiHelper();

    // Default settings
    this.scaleSize = 1;
    this.serverAddresses = [];

    this.settings = new Settings.DeskletSettings(this, metadata["uuid"], deskletId);
    this.settings.bindProperty(Settings.BindingDirection.IN, "scale-size", "scaleSize", this._setupLayout);
    this.settings.bindProperty(Settings.BindingDirection.IN, "server-addresses", "serverAddresses", this._setupLayout);
  }

  on_desklet_added_to_desktop() {
    this._setupLayout();
  }

  on_desklet_removed() {
    if (this.settings && !this._isReloading) {
      this.settings.finalize();
    }
  }

  on_desklet_reloaded() {
    this._isReloading = true;
  }

  async _setupLayout() {
    // Setup main container
    this._mainContainer = new St.BoxLayout({ vertical: true });
    this._mainContainer.set_style(
      `width: ${this.scaleSize * 20}em; background-color: rgba(134, 134, 134, 0.58); padding: ${this.scaleSize * 1}em; border-radius: ${this.scaleSize * 0.3}em;`,
    );

    // Header
    const header = this.uiHelper.getHeader({ scaleSize: this.scaleSize, reloadCallback: () => this._setupLayout() });
    this._mainContainer.add_child(header);

    // Loading label
    const loadingLabel = new St.Label({ text: _("Loading...") });
    this._mainContainer.add_child(loadingLabel);

    this.setContent(this._mainContainer);

    this._mainContainer.remove_child(loadingLabel);

    for (const address of this.serverAddresses) {
      const status = await this.minecraftServerStatusHelper.getServerStatus(address.address);
      const options = {
        name: address.name,
        status: status,
        scaleSize: this.scaleSize,
      };

      const serverItem = this.uiHelper.getServerListItem(options);
      this._mainContainer.add_child(serverItem);
    }
    this._mainContainer.add_child(serverItem);
  }
}

function main(metadata, deskletId) {
  return new MyDesklet(metadata, deskletId);
}
