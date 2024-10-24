const db = require("../../models/index.model");
const Products = db.Product;
const Categories = db.Categories;
const Topping = db.Topping;

const {
  updateProductById,
  publishedProductByRestaurant,
  draftProductByRestaurant,
  findAllDraftsForShop,
  findAllProduct,
  findProduct,
  findProductByUser,
  findAllPublicForShop,
} = require("./repositories/product.repo");

class Product {
  constructor({
    name,
    image,
    descriptions,
    price,
    quantity,
    is_available,
    restaurant_id,
  }) {
    this.name = name;
    this.image = image;
    this.descriptions = descriptions;
    this.price = price;
    this.quantity = quantity;
    this.is_available = is_available;
    this.restaurant_id = restaurant_id;
  }

  async createProduct() {
    return await Products.create({ ...this });
  }

  async updateProduct(productId, bodyUpdate) {
    return await updateProductById({
      productId,
      bodyUpdate,
      model: Products,
    });
  }
}

class ProductService extends Product {
  static createProduct = async (categoriesId, toppingId, payload) => {
    if (!payload) {
      throw new Error("Payload is required to create a product");
    }
    
    const {
      name,
      image,
      descriptions,
      price,
      quantity,
      is_available,
    } = payload;
    console.log(payload)
    const newProductInstance = new Product({
      name,
      image,
      descriptions,
      price,
      quantity,
      is_available,
      restaurant_id:payload.user_id,
    });

    const newProduct = await newProductInstance.createProduct();

    if (categoriesId && categoriesId.length > 0) {
      const categories = await Categories.findAll({
        where: { id: categoriesId },
      });
      await newProduct.addCategories(categories);
    }

    if (toppingId && toppingId.length > 0) {
      const toppings = await Topping.findAll({
        where: { id: toppingId },
      });
      await newProduct.addToppings(toppings);
    }

    return newProduct;
  };

  static updateProduct = async (product_id, payload) => {
    const { name, image, descriptions, price, quantity, is_available } =
      payload;
    const updateProductInstance = new Product({
      name,
      image,
      descriptions,
      price,
      quantity,
      is_available,
    });
    return await updateProductInstance.updateProduct(product_id);
  };

  static async publishedProductByRestaurant({
    product_id,
    product_restaurant,
  }) {
    return publishedProductByRestaurant({ product_id, product_restaurant });
  }
  static async draftProductByRestaurant({ product_id, product_restaurant }) {
    return draftProductByRestaurant({ product_id, product_restaurant });
  }

  static async findAllDraftsForRestaurant({
    product_restaurant,
    limit = 60,
    skip = 0
  }) {
    const query = {
      restaurant_id: product_restaurant,
      is_draft: true,
    };
    return await findAllDraftsForShop({query, limit, skip});
  }

  static async findAllPublicForRestaurant({
    product_restaurant,
    limit = 60,
    skip = 0
  }) {
    const query = {
      restaurant_id: product_restaurant,
      is_public: true,
    };
    return await findAllPublicForShop({query, limit, skip});
  }
  static async getListSearchProduct(keySearch) {
    return await findProductByUser(keySearch);
  }
  static async findAllProduct({
    limit = 30,
    sort = "ctime",
    page = 1,
    filter = { is_public:true },
  }) {
    return await findAllProduct({
      limit,
      sort,
      page,
      filter,
      select: ["name", "image", "price", "restaurant_id"],
    });
  }
  static async findProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ["__v"] });
  }
}

module.exports = ProductService;
