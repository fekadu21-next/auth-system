import Joi from "joi";


export const createDocumentValidator =
  Joi.object({

    title: Joi.string()
      .min(3)
      .max(200)
      .required()

  });


export const renameDocumentValidator =
  Joi.object({

    title: Joi.string()
      .min(3)
      .max(200)
      .required()

  });


export const updateContentValidator =
  Joi.object({

    content: Joi.object()
      .required()

  });


export const updatePageSettingsValidator =
  Joi.object({

    pageNumberSettings: Joi.object({

      showPageNumbers: Joi.boolean()
        .default(true),

      sections: Joi.array()
        .items(
          Joi.object({

            startPage: Joi.number()
              .integer()
              .min(1)
              .required(),

            type: Joi.string()
              .valid("none", "roman", "decimal")
              .required(),

            startFrom: Joi.number()
              .integer()
              .min(1)
              .default(1),

          })
        )
        .min(1)
        .required(),

    }).required(),

  });