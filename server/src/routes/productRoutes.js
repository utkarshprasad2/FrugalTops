"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
router.get('/search', productController_1.productController.search);
router.get('/filters', productController_1.productController.getFilters);
exports.default = router;
