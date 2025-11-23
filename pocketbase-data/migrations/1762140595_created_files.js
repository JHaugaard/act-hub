/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "llfd5dt27j40xfz",
    "created": "2025-11-03 03:29:55.285Z",
    "updated": "2025-11-03 03:29:55.285Z",
    "name": "files",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "neopdncu",
        "name": "db_no",
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
        "id": "l8cjpnzg",
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "In",
            "Pending",
            "Pending Signature",
            "Process",
            "Done",
            "On Hold",
            "Withdrawn"
          ]
        }
      },
      {
        "system": false,
        "id": "7ecwspt7",
        "name": "date_received",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "wdpe8uty",
        "name": "date_status_change",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "upqooxwf",
        "name": "notes",
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
        "id": "zffvnyau",
        "name": "external_link",
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
        "id": "kltvs2ym",
        "name": "cayuse",
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
        "id": "x94qg2uc",
        "name": "to_set_up",
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
        "id": "qr1lac3f",
        "name": "pi_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "tiye4jdvdsuixiz",
          "cascadeDelete": false,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "vwk1q1zo",
        "name": "sponsor_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "g2z46ra5odijvp4",
          "cascadeDelete": false,
          "minSelect": 1,
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
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("llfd5dt27j40xfz");

  return dao.deleteCollection(collection);
})
