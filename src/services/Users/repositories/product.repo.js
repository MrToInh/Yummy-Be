const db = require("../../../models/index.model");
const Product = db.Product;
const Restaurant = db.Restaurant;

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return queryProduct({ query, limit, skip });
};
const findAllPublicForShop = async ({ query, limit, skip }) => {
  return queryProduct({ query, limit, skip });
};

const findProductByUser = async (keySearch) => {
  const query = `
    SELECT * 
    FROM products 
    WHERE is_public = 1 
    AND name LIKE ?
    ORDER BY createdAt DESC;
  `;

  return await db.sequelize.query(query, {
    replacements: [`${keySearch}%`],
    type: db.Sequelize.QueryTypes.SELECT,
  });
};

//chuyển trạng thái sản phẩm
const publishedProductByRestaurant = async ({
  product_id,
  product_restaurant,
}) => {
  const foundRestaurant = await Product.findOne({
    where: {
      id: product_id,
      restaurant_id: product_restaurant,
    },
  });
  if (!foundRestaurant) return null;
  foundRestaurant.is_public = true;
  foundRestaurant.is_draft = false;
  const result = foundRestaurant.save();
  return result ? 1 : 0;
};
const draftProductByRestaurant = async ({ product_id, product_restaurant }) => {
  const foundRestaurant = await Product.findOne({
    where: {
      id: product_id,
      restaurant_id: product_restaurant,
    },
  });
  if (!foundRestaurant) return null;
  foundRestaurant.is_public = false;
  foundRestaurant.is_draft = true;
  const result = foundRestaurant.save();
  return result ? 1 : 0;
};
const updateProductById = async ({
  productId,
  bodyUpdate,
  model,
  isNew = true,
}) => {
  await model.update(bodyUpdate, {
    where: { id: productId },
  });
  if (isNew) {
    return await model.findOne({ where: { id: productId } });
  }
  return { message: "Product updated successfully" };
};

const findAllProduct = async ({ limit, sort, page, filter, select }) => {
  const offset = (page - 1) * limit;
  const orderBy =
    sort === "ctime" ? [["createdAt", "DESC"]] : [["createdAt", "ASC"]];

  const products = await Product.findAll({
    where: filter, //loc theo điều kiện nào
    limit: limit, // số phần tử trong 1 trang
    offset: offset, // bỏ qua số lượng sản phẩm đã được lấy
    attributes: select ? select : undefined, // chọn các trường cần thiết
    order: orderBy, // sắp sếp sản phẩm
  });

  return products.map((product) => product.get({ plain: true }));
};
// tìm kiếm sản phẩm đối với theo id loại bỏ 1 số trường không cần thiêt
const findProduct = async ({ product_id, unSelect }) => {
  const products = await Product.findOne({
    where: { id: product_id },
    attributes: { exclude: unSelect },
  });
  return products ? products.get({ plain: true }) : null;
};
// câu query hỗ trợ phân trang
const queryProduct = async ({query, limit, skip}) => {
  return await Product.findAll({
    where: query,
    include: [
      {
        model: Restaurant,
        attributes: ["name"],
      },
    ],
    order: [["updatedAt", "DESC"]],
    limit: limit,
    offset: skip,
  });
};
// tìm kiếm sản phẩm và trả về 1 obj thuần với plain: true thay về trả về tất cả các attributes và phương thức
const getProductById = async (productId) => {
  const products = Product.findOne({
    where: { id: productId },
  });
  return products ? products.get({ plain: true }) : null;
};
module.exports = {
  updateProductById,
  getProductById,
  findProduct,
  findAllProduct,
  draftProductByRestaurant,
  publishedProductByRestaurant,
  findAllDraftsForShop,
  findAllPublicForShop,
  findProductByUser,
};
