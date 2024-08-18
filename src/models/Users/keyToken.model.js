module.exports = (sequelize, Sequelize) => {
  const KeyToken = sequelize.define("Key Token", {
    publicKey: {
      type: Sequelize.STRING,
    },
    privateKey: {
      type: Sequelize.STRING,
    },
    refreshTokenUsed: {
      type: Sequelize.JSON,
    },
    refreshToken: {
      type: Sequelize.STRING,
    },
  });
  return KeyToken;
};
