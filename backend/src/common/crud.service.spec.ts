import { BadRequestException } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { CrudService } from './crud.service.js';

interface TestEntity extends ObjectLiteral {
  id: string;
  name: string;
}

class TestCrudService extends CrudService<TestEntity> {
  constructor(repository: Repository<TestEntity>) {
    super(repository);
  }
}

describe('CrudService', () => {
  const createService = () => {
    const save = vi.fn(async (value: TestEntity) => value);
    const update = vi.fn();
    const repository = {
      metadata: {
        primaryColumns: [{ propertyName: 'id', type: 'uuid' }],
        columns: [
          {
            propertyName: 'id',
            isGenerated: true,
            isCreateDate: false,
            isUpdateDate: false,
            isVersion: false,
            isPrimary: true,
          },
          {
            propertyName: 'name',
            isGenerated: false,
            isCreateDate: false,
            isUpdateDate: false,
            isVersion: false,
            isPrimary: false,
          },
        ],
      },
      create: vi.fn((value: Partial<TestEntity>) => value as TestEntity),
      save,
      update,
    } as unknown as Repository<TestEntity>;

    return { repository, save, update, service: new TestCrudService(repository) };
  };

  it('rejects fields that do not belong to the entity', async () => {
    const { save, service } = createService();

    await expect(
      service.create({ name: 'Producto', isAdmin: true }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(save).not.toHaveBeenCalled();
  });

  it('does not allow primary keys to be changed', async () => {
    const { update, service } = createService();

    await expect(
      service.update('f8991a26-7b6e-4e16-8fc0-66f0459e3e1a', {
        id: '39a55d3c-6cb2-4763-9bc5-58f43a7cf9f8',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });
});
