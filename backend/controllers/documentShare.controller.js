import * as service
  from "../services/documentShare.service.js";





/**
 * Share document
 */
export const shareDocument =
  async (req, res, next) => {

    try {


      const {
        userId,
        permission
      } = req.body;



      const share =
        await service.shareDocument(

          req.params.documentId,

          userId,

          permission,

          req.user.id,

          req.app.get("io")

        );



      res.status(201).json({

        success: true,

        message:
          "Document shared successfully",

        data: share

      });


    }
    catch (error) {

      next(error);

    }

  };








/**
 * Update permission
 */
export const updatePermission =
  async (req, res, next) => {

    try {


      const share =
        await service.updatePermission(

          req.params.documentId,

          req.params.userId,

          req.body.permission,

          req.user.id,

          req.app.get("io")

        );



      res.json({

        success: true,

        message:
          "Permission updated",

        data: share

      });


    }
    catch (error) {

      next(error);

    }

  };







/**
 * Remove shared user
 */
export const removeSharedUser =
  async (req, res, next) => {

    try {


      await service.removeSharedUser(

        req.params.documentId,

        req.params.userId

      );



      res.json({

        success: true,

        message:
          "User removed successfully"

      });


    }
    catch (error) {

      next(error);

    }

  };








/**
 * Get shared users
 */
export const getSharedUsers =
  async (req, res, next) => {

    try {


      const users =
        await service.getSharedUsers(

          req.params.documentId

        );



      res.json({

        success: true,

        data: users

      });


    }
    catch (error) {

      next(error);

    }

  };









/**
 * Check permission
 */
export const checkPermission =
  async (req, res, next) => {

    try {


      const permission =
        await service.checkPermission(

          req.params.documentId,

          req.user.id

        );



      res.json({

        success: true,

        permission

      });


    }
    catch (error) {

      next(error);

    }

  };