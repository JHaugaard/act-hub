/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pgssf7ryoplvii9");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "pgssf7ryoplvii9",
    "created": "2025-11-03 03:26:05.618Z",
    "updated": "2025-11-03 03:26:05.618Z",
    "name": "files_test",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "2cyhq80o",
        "name": "db_no",
        "type": "text",
        "required": false,
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
        "id": "7jqvstf2",
        "name": "pi_id",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "nj3csjj010ojxp0",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
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
})
