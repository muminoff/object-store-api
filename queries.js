var promise = require('bluebird');

var options = {
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5433/objects';
var db = pgp(connectionString);

function getAllRootObjects(req, res, next) {
  const query = `
  select array_to_json(array_agg(json_build_object(
      'id', id,
      'name', name,
      'is_dir', is_dir,
      'size', size,
      'content_type', content_type,
      'etag', etag,
      'last_modified', floor(extract(epoch from last_modified) * 1000),
      'parent', parent))) as data
    from objects
    where parent is null
  `;
  db.query(query)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data[0].data,
          message: 'Retrieved all root objects'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAllChildrenObjects(req, res, next) {
  const query = `
  select array_to_json(array_agg(json_build_object(
    'id', id,
    'name', name,
    'is_dir', is_dir,
    'size', size,
    'content_type', content_type,
    'etag', etag,
    'last_modified', floor(extract(epoch from last_modified) * 1000),
    'parent', parent))) as data
  from objects
  where parent = $1
  `;
  db.query(query, req.params.id)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data[0].data,
          message: 'Retrieved all children objects'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getSingleObject(req, res, next) {
  var objectID = req.params.id;
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
    from objects tn
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
    objects c
    where (c.parent = p.id)
  )
  select json_build_object(
    'id', n.id,
    'name', n.name,
    'is_dir', n.is_dir,
    'size', n.size,
    'content_type', n.content_type,
    'etag', n.etag,
    'last_modified', floor(extract(epoch from n.last_modified) * 1000),
    'parent', n.parent,
    'path', n.path) as data
   from nodes_cte n
  where (n.id = $1)
  order by n.depth
 limit 1;
  `;
  db.one(query, objectID)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data.data,
          message: 'Retrieved one object'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function createObject(req, res, next) {
  query = `
  insert into objects (name, is_dir, size, parent)
  values ($1, $2, $3, $4);
  `;
  console.log(req.body);
  db.none(query, [
    req.body.name,
    req.body.is_dir || false,
    req.body.size || null,
    req.body.parent || null])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one object'
        });
    })
    .catch(function (err) {
      console.error(err);
      return next(err);
    });
}

function updateObject(req, res, next) {
  db.none('update objects set name=$1, parent=$2 where id=$3',
    [req.body.name, req.body.parent, req.params.id])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated object'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeObject(req, res, next) {
  db.result('delete from objects where id = $1', req.params.id)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} object`
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
  getAllRootObjects: getAllRootObjects,
  getAllChildrenObjects: getAllChildrenObjects,
  getSingleObject: getSingleObject,
  createObject: createObject,
  updateObject: updateObject,
  removeObject: removeObject
};
