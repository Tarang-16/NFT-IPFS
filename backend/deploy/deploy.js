module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const METADATA_URL = process.env.METADATA_URL;

  const lw3punks = await deploy("LW3Punks", {
    from: deployer,
    log: true,
    args: [METADATA_URL],
  });

  log("-----------------------------");
};

module.exports.tags = ["all", "lw3punks"];
