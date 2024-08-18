const { Types } = require("mysql2");
const db = require("../../models/index.model");
const keyTokenModel = db.KeyToken;

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // const filter = { userId: userId },
      //   update = {
      //     publicKey,
      //     privateKey,
      //     refreshTokenUsed: [],
      //     refreshToken,
      //   },
      //   option = { upsert: true, new: true };
      // const tokens = await keyTokenModel.findOrCreate(
      //   filter,
      //   update,
      //   option
      // );
      const tokensRecord = await keyTokenModel.findOne({
        where: { userId: userId },
      });
      let tokens;
      if (tokensRecord) {
        tokens = await keyTokenModel.update(
          {
            privateKey: privateKey,
            publicKey: publicKey,
            refreshTokenUsed:{},
            refreshToken: refreshToken,
          },
          {
            where: { userId: userId },
          }
        );
      } else {
        tokens = await keyTokenModel.create({
          userId: userId,
          privateKey: privateKey,
          publicKey: publicKey,
          refreshToken: refreshToken || "",
        });
      }
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };
  static findByUserId = async (userId) => {
    return await keyTokenModel.findOne({
      where: {
        userId: userId,
      },
    });
  };

  static removeKeyById = async (userId) => {
    const uI = await keyTokenModel.findOne({ userId: userId });
    const deleteTokens = await keyTokenModel.destroy({
      where: { id: uI.id },
    });
    return deleteTokens > 0
      ? { success: true, meesage: "logout succsessfully" }
      : { success: false, meesage: "logout failed" };
  };
}
module.exports = KeyTokenService;
