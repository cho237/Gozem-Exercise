import {Router} from 'express';
import {body} from "express-validator";
import {allPackages, createPackage, deletePackage, detailsPackage, updatePackage} from "./controller";

const router: Router = Router();
const packageValidation = [
    body('weight')
        .isNumeric(),
    body('width')
        .isNumeric(),
    body('height')
        .isNumeric(),
    body('depth')
        .isNumeric(),
    body('from_name')
        .isLength({min: 3})
        .isString()
        .trim(),
    body('from_address')
        .isLength({min: 3})
        .isString()
        .trim(),
    body('to_name')
        .isLength({min: 3})
        .isString()
        .trim(),
    body('to_address')
        .isLength({min: 3})
        .isString()
        .trim(),
]

//all package list with search
router.get("/", allPackages)
//details single package
router.get("/:id", detailsPackage)
//create package
router.post("/",packageValidation, createPackage)
//update package
router.put("/:id", packageValidation, updatePackage)
//delete package
router.delete("/:id",deletePackage)
export default router;
