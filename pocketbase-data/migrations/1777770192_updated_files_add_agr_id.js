/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("llfd5dt27j40xfz")

  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "agr_id_field",
    "name": "agr_id",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("llfd5dt27j40xfz")

  collection.schema.removeField("agr_id_field")

  return dao.saveCollection(collection)
})
