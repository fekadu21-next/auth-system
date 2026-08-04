import Document from "../Models/Documents.js";
class DocumentRepository {
  async create(data) {

    return await Document.create(data);

  }



  async findById(id) {

    console.log("Repository findById called with ID:", id);
    const doc = await Document
      .findOne({
        _id: id,
        isDeleted: false
      })
      .populate("owner", "name email avatar");
    console.log("Repository findById result:", doc ? "Found" : "Not found");
    if (doc) {
      console.log("Document owner type:", typeof doc.owner);
      console.log("Document owner value:", doc.owner);
    }
    return doc;

  }

  async findAll() {
    return await Document.find({ isDeleted: false })
      .populate("owner", "name email avatar")
      .sort({ updatedAt: -1 });
  }



  async findByOwner(ownerId) {

    return await Document
      .find({
        owner: ownerId,
        isDeleted: false
      })
      .sort({
        updatedAt: -1
      });

  }



  async update(id, data) {

    return await Document.findByIdAndUpdate(
      id,
      data,
      {
        new: true
      }
    );

  }



  async softDelete(id) {

    return await Document.findByIdAndUpdate(
      id,
      {
        isDeleted: true
      },
      {
        new: true
      }
    );

  }



  async duplicate(document) {

    return await Document.create({

      title:
        document.title + " Copy",

      content:
        document.content,

      pageNumberSettings:
        document.pageNumberSettings,

      owner:
        document.newOwner || document.owner,

      lastEditedBy:
        document.newOwner || document.owner,

      isDeleted: false,

      currentVersion: 0

    });

  }



}



export default new DocumentRepository();