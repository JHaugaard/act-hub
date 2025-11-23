/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "fv7yoxuyattxjzq",
    "created": "2025-11-03 03:29:55.289Z",
    "updated": "2025-11-03 03:29:55.289Z",
    "name": "file_attachments",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "wlb2qh2t",
        "name": "file_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "llfd5dt27j40xfz",
          "cascadeDelete": true,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "hktwalgw",
        "name": "filename",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "seyhztwc",
        "name": "file_path",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "vrbubqo0",
        "name": "file_size",
        "type": "number",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("fv7yoxuyattxjzq");

  return dao.deleteCollection(collection);
})
