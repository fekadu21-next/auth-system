import express from "express";

import {

  shareDocument,

  updatePermission,

  removeSharedUser,

  getSharedUsers,

  checkPermission


}
  from "../controllers/documentShare.controller.js";


import { isAuthenticated as authMiddleware } from "../middleware/authMiddleware.js";


import {

  shareDocumentValidator,

  updatePermissionValidator

}
  from "../validators/documentShare.validator.js";



const router =
  express.Router();





/*
 Share document

 POST
 /api/documents/:documentId/share
*/

router.post(

  "/:documentId/share",

  authMiddleware,

  authMiddleware,

  shareDocument

);








/*
 Update permission

 PATCH
 /api/documents/:documentId/share/:userId

*/

router.patch(

  "/:documentId/share/:userId",

  authMiddleware,

  authMiddleware,

  updatePermission

);










/*
 Remove shared user

 DELETE
*/

router.delete(

  "/:documentId/share/:userId",

  authMiddleware,

  removeSharedUser

);









/*
 Get shared users

 GET

*/

router.get(

  "/:documentId/shared-users",

  authMiddleware,

  getSharedUsers

);








/*
 Check permission

 GET

*/

router.get(

  "/:documentId/permission",

  authMiddleware,

  checkPermission

);



export default router;