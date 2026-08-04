import Joi from "joi";

/**
 * Share a document
 */
export const shareDocumentValidator = Joi.object({
  userId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.empty": "User ID is required",
      "string.length": "Invalid User ID",
      "string.hex": "Invalid User ID",
      "any.required": "User ID is required",
    }),

  permission: Joi.string()
    .valid("viewer", "commenter", "editor")
    .default("viewer")
    .messages({
      "any.only":
        "Permission must be viewer, commenter, or editor",
    }),
});

/**
 * Update permission
 */
export const updatePermissionValidator = Joi.object({
  permission: Joi.string()
    .valid("viewer", "commenter", "editor")
    .required()
    .messages({
      "any.required": "Permission is required",
      "any.only":
        "Permission must be viewer, commenter, or editor",
    }),
});

/**
 * Validate MongoDB document ID
 */
export const documentIdValidator = Joi.object({
  documentId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.empty": "Document ID is required",
      "string.length": "Invalid Document ID",
      "string.hex": "Invalid Document ID",
      "any.required": "Document ID is required",
    }),
});

/**
 * Validate shared user ID
 */
export const sharedUserValidator = Joi.object({
  userId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.empty": "User ID is required",
      "string.length": "Invalid User ID",
      "string.hex": "Invalid User ID",
      "any.required": "User ID is required",
    }),
});