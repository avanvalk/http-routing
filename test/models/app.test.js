const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const request = require('supertest');
const app = require('../../lib/app');

const createPerson = (name) => {
  return request(app)
    .post('/people')
    .send({
      name: name,
      age: 100,
      favoriteColor: 'red',
      favoriteCharacterId: 1
    })
    .then(res => res.body);
};

describe('app tests', () => {
  beforeEach(done => {
    rimraf('./data/people', err => {
      done(err);
    });
  });

  beforeEach(done => {
    mkdirp('./data/people', err => {
      done(err);
    });
  });

  it('creates a person', () => {
    return request(app)
      .post('/people')
      .send({
        name: 'Uncle bob',
        age: 100,
        favoriteColor: 'red',
        favoriteCharacterId: 1
      })
      .then(res => {
        expect(res.body).toEqual({
          name: 'Uncle bob',
          age: 100,
          favoriteColor: 'red',
          favoriteCharacter: expect.any(Object),
          _id: expect.any(String)
        });
      });
  });
  it('gets a list of people from our db', () => {
    const namesToCreate = ['ryan', 'brett', 'grant', 'harry'];
    return Promise.all(namesToCreate.map(createPerson))
      .then(() => {
        return request(app)
          .get('/people');
      })
      .then(({ body }) => {
        expect(body).toHaveLength(4);
      });
  });
  it('gets a person by id', () => {
    return createPerson('ryan')
      .then(({ _id }) => {
        return Promise.all([
          Promise.resolve(_id),
          request(app).get(`/people/${_id}`)
        ]);
      })
      .then(([_id, { body }]) => {
        expect(body).toEqual({
          name: 'ryan',
          age: 100,
          favoriteCharacter: expect.any(Object),
          favoriteColor: 'red',
          _id
        });
      });
  });
  it('updates a person by id', () => {
    return createPerson('ryan')
      .then(createdPerson => {
        return request(app)
          .put(`/people/${createdPerson._id}`)
          .send({ name:'ryan1' });
      })
      .then(res => {
        expect(res.body.name).toEqual('ryan1');
      });
  });
  it('deletes a person by id', () => {
    return createPerson('ryan')
      .then(({ _id }) => {
        return request(app)
          .delete(`/people/${_id}`);
      })
      .then(({ body }) => {
        expect(body).toEqual({ deleted: 1 });
      });
  });
});
