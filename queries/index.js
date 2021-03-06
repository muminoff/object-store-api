var promise = require('bluebird');
var mime = require('mime-types');

var options = {
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5432/objects';
var db = pgp(connectionString);

function getStorageInfo(req, res, next) {
  const query = `
  select json_build_object(
    'main', main,
    'trash', trash)
  as data
  from user_storages
  where user_id=1
  `;
  db.one(query)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'ok',
          data: data.data
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAllObjects(req, res, next) {
  const root_query = `
  select array_to_json(array_agg(json_build_object(
      'id', id,
      'name', name,
      'is_dir', is_dir,
      'size', size,
      'content_type', content_type,
      'etag', etag,
      'last_modified', floor(extract(epoch from last_modified)),
      'parent', parent))) as data
    from storage_objects
    where storage = $1 and parent is null
  `;
  const parent_query = `
  select array_to_json(array_agg(json_build_object(
      'id', id,
      'name', name,
      'is_dir', is_dir,
      'size', size,
      'content_type', content_type,
      'etag', etag,
      'last_modified', floor(extract(epoch from last_modified)),
      'parent', parent))) as data
    from storage_objects
    where storage = $1 and parent = $2
  `;
  if (req.params.id === undefined) {
    db.query(root_query, req.params.storage)
      .then(function (data) {
        res.status(200)
          .json({
            status: 'ok',
            data: data[0].data
          });
      })
      .catch(function (err) {
        return next(err);
      });
  } else {
    db.query(parent_query, [req.params.storage, req.params.id])
      .then(function (data) {
        res.status(200)
          .json({
            status: 'ok',
            data: data[0].data || []
          });
      })
      .catch(function (err) {
        return next(err);
      });
  }
}

function getSingleObject(req, res, next) {
  var objectId = req.params.id || false;
  if(!objectId) {
      res.status(504).json({status:'not implemented yet'});
  }
  const query = `
  with recursive nodes_cte(id, name, is_dir, size, content_type, etag, last_modified, parent, depth, path) as (
    select tn.id,
    tn.name,
    tn.is_dir,
    tn.size,
    tn.content_type,
    tn.etag,
    tn.last_modified,
    tn.parent,
    1 as depth,
    ('/'::text || (tn.name)::text) as path
    from storage_objects tn
    where (tn.parent is null)
    union all
    select c.id,
    c.name,
    c.is_dir,
    c.size,
    c.content_type,
    c.etag,
    c.last_modified,
    c.parent,
    (p.depth + 1) as depth,
    ((p.path || '/'::text) || (c.name)::text)
    from nodes_cte p,
    storage_objects c
    where (c.parent = p.id)
  )
  select json_build_object(
    'id', n.id,
    'name', n.name,
    'is_dir', n.is_dir,
    'size', n.size,
    'content_type', n.content_type,
    'etag', n.etag,
    'last_modified', floor(extract(epoch from n.last_modified)),
    'parent', n.parent,
    'path', n.path) as data
   from nodes_cte n
  where (n.id = $1)
  order by n.depth
 limit 1;
  `;
  db.one(query, objectId)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'ok',
          data: data.data,
          message: 'Retrieved one object'
        });
    })
    .catch(function (err) {
      console.log(err);
      return next(err);
    });
}

function createDirectoryObject(req, res, next) {
  console.log(req.body);
  query = `
  insert into storage_objects (name, is_dir, parent, storage)
  values ($1, true, $2, $3);
  `;
  db.none(query, [
    req.body.name,
    req.body.parent || null,
    req.params.storage
  ])
    .then(function () {
      res.status(200)
        .json({
          status: 'ok',
          message: 'Created directory object'
        });
    })
    .catch(function (err) {
      console.error(err);
      return next(err);
    });
}

function createFileObject(req, res, next) {
  console.log(req.body);
  query = `
  insert into storage_objects (name, is_dir, size, content_type, etag, parent, storage)
  values ($1, false, $2, $3, $4, $5, $6);
  `;
  let content_type = null;
  if (mime.lookup(req.body.name)) {
    content_type = mime.lookup(req.body.name);
  }
  db.none(query, [
    req.body.name,
    req.body.size,
    content_type,
    req.body.etag,
    req.body.parent || null,
    req.params.storage
  ])
    .then(function () {
      res.status(200)
        .json({
          status: 'ok',
          message: 'Created file object'
        });
    })
    .catch(function (err) {
      console.error(err);
      return next(err);
    });
}

function updateObject(req, res, next) {
  db.none('update storage_objects set name=$1, parent=$2 where id=$3 and storage=$4',
    [
      req.body.name,
      req.body.parent,
      req.params.id,
      req.params.storage
    ])
    .then(function () {
      res.status(200)
        .json({
          status: 'ok',
          message: 'Updated object'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeObject(req, res, next) {
  db.result('delete from storage_objects where id=$1 and storage=$2', [req.params.id, req.params.storage])
    .then(function (result) {
      res.status(200)
        .json({
          status: 'ok',
          message: `Removed ${result.rowCount} object`
        });
    })
    .catch(function (err) {
      console.log(err);
      return next(err);
    });
}

module.exports = {
  getStorageInfo: getStorageInfo,
  getAllObjects: getAllObjects,
  getSingleObject: getSingleObject,
  createDirectoryObject: createDirectoryObject,
  createFileObject: createFileObject,
  updateObject: updateObject,
  removeObject: removeObject
};
