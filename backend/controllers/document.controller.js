import documentService from "../services/document.service.js";
class DocumentController {
  async create(req, res) {
    try {
      const document =
        await documentService
          .createDocument(
            req.user.id,
            req.body
          );


      res.status(201)
        .json({
          success: true,
          data: document
        });


    }
    catch (error) {

      res.status(400)
        .json({
          message: error.message
        });
    }
  }







  async get(req, res) {

    try {


      const document =
        await documentService
          .getDocument(
            req.params.id,
            req.user.id
          );



      res.json({

        success: true,

        data: document

      });


    }
    catch (error) {

      res.status(404)
        .json({
          message: error.message
        });

    }


  }








  async getMine(req, res) {
    try {
      const documents = await documentService.getMyDocuments(req.user.id);
      res.json({ success: true, data: documents });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getShared(req, res) {
    try {
      const documents = await documentService.getSharedWithMe(req.user.id);
      res.json({ success: true, data: documents });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getRecent(req, res) {
    try {
      const documents = await documentService.getRecentDocuments(req.user.id);
      res.json({ success: true, data: documents });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }








  async rename(req, res) {

    try {


      const document =
        await documentService
          .renameDocument(

            req.params.id,

            req.user.id,

            req.body.title

          );


      // Emit socket event for real-time update
      req.app.get('io').emit('document-renamed', {
        documentId: req.params.id,
        title: req.body.title,
        userId: req.user.id
      });

      res.json({

        success: true,

        data: document

      });


    }
    catch (error) {

      res.status(400)
        .json({
          message: error.message
        });

    }

  }









  async remove(req, res) {

    try {

      console.log("DELETE request - Params:", req.params, "User:", req.user.id);
      await documentService
        .deleteDocument(

          req.params.id,

          req.user.id

        );



      res.json({

        message:
          "Document deleted"

      });


    }
    catch (error) {

      console.log("DELETE error:", error.message);
      res.status(400)
        .json({
          message: error.message
        });

    }

  }








  async duplicate(req, res) {

    try {


      const document =
        await documentService
          .duplicateDocument(

            req.params.id,

            req.user.id

          );



      res.status(201)
        .json({

          success: true,

          data: document

        });


    }
    catch (error) {

      res.status(400)
        .json({
          message: error.message
        });

    }

  }








  async updateContent(req, res) {

    try {


      const document =
        await documentService
          .updateContent(

            req.params.id,

            req.user.id,

            req.body.content

          );



      res.json({

        success: true,

        data: document

      });


    }
    catch (error) {

      res.status(400)
        .json({
          message: error.message
        });

    }

  }

  async cleanupShares(req, res) {
    try {
      const deletedCount = await documentService.cleanupOrphanedShares();
      res.json({
        success: true,
        message: `Cleaned up ${deletedCount} orphaned shares`,
        deletedCount
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updatePageSettings(req, res) {

    try {

      const document =
        await documentService
          .updatePageSettings(

            req.params.id,

            req.user.id,

            req.body.pageNumberSettings

          );

      res.json({

        success: true,

        data: document

      });

    }
    catch (error) {

      res.status(400)
        .json({
          message: error.message
        });

    }

  }



}



export default new DocumentController();