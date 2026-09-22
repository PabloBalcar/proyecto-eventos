import { Router } from "express";

import * as categoryService from "../services/category.service.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const categories = await categoryService.getCategories();

    return res.status(200).json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body.name);

    return res.status(201).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
