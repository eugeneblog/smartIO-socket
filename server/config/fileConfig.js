const path = require("path");
const getConfigFile = name => {
  let FILE_CONFIG;
  switch (name) {
    case "channel":
      FILE_CONFIG = CHANNEL_CONFIG;
      break;
    case "facillty":
      FILE_CONFIG = FACILLTY_CONFIG;
      break;
    default:
      FILE_CONFIG = {
        dir: undefined
      };
      break;
  }
  return FILE_CONFIG;
};

const CHANNEL_CONFIG = {
  dir: path.join(__dirname, "../xmlResources/channel.xml"),
  rw: "rw"
};

const FACILLTY_CONFIG = {
  dir: "../../facillty.xml",
  rw: "r"
};

module.exports = {
  getConfigFile
};
