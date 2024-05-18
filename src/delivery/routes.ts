import { Router } from 'express';
import {body} from "express-validator";
import {allDeliveries, createDelivery, deleteDelivery, detailsDelivery, updateDelivery} from "./controller";
const router:Router = Router();


//all deliveries with search and pagination
router.get("/", allDeliveries)
//details delivery
router.get("/:Id", detailsDelivery)
//create delivery with packageID
router.post("/:packageId", createDelivery)
//update delivery
router.put("/:Id", updateDelivery)
//delete delivery
router.delete("/:Id", deleteDelivery)
export default router;
