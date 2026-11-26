import { INestApplication, Controller } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { ObjectLiteral, Repository } from 'typeorm';
import { CrudController } from './crud.controller.js';
import { CrudService } from './crud.service.js';

interface TestEntity extends ObjectLiteral {
  id: string;
}

class TestCrudService extends CrudService<TestEntity> {
  constructor() {
    super(Object.create(Repository.prototype) as Repository<TestEntity>);
  }
}

@Controller('records')
class TestCrudController extends CrudController<TestEntity> {
  constructor(service: TestCrudService) {
    super(service);
  }
}

describe('CrudController', () => {
  let app: INestApplication<App>;
  const service = {
    findAll: vi
      .fn()
      .mockResolvedValue({ items: [{ id: 'record-1' }], nextCursor: null }),
    findOne: vi.fn().mockResolvedValue({ id: 'record-1' }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestCrudController],
      providers: [{ provide: TestCrudService, useValue: service }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers inherited collection and item routes', async () => {
    await request(app.getHttpServer())
      .get('/records')
      .expect(200)
      .expect({ items: [{ id: 'record-1' }], nextCursor: null });
    await request(app.getHttpServer())
      .get('/records/record-1')
      .expect(200)
      .expect({ id: 'record-1' });

    expect(service.findAll).toHaveBeenCalledWith(100, undefined);
    expect(service.findOne).toHaveBeenCalledWith('record-1');
  });
});
