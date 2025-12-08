import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: { [k: string]: jest.Mock };

  beforeEach(async () => {
    service = {
      updateCredentials: jest.fn(),
      find: jest.fn(),
      findByEmailForAuth: jest.fn(),
      findOneVisible: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();

    controller = module.get(UsersController);
  });

  it('create proxies to service', async () => {
    service.create.mockResolvedValue({ id: 1 } as any);
    const res = await controller.create({ firstName: 'A', lastName: 'B', email: 'e', username: 'u', passwordHash: 'p' } as any);
    expect(res).toEqual({ id: 1 });
    expect(service.create).toHaveBeenCalled();
  });

  it('find calls service.find', async () => {
    service.find.mockResolvedValue([{ id: 1 }]);
    const res = await controller.find('e');
    expect(res).toEqual([{ id: 1 }]);
  });

  it('findForAuth calls service.findByEmailForAuth', async () => {
    service.findByEmailForAuth.mockResolvedValue({ id: 1 });
    const res = await controller.findForAuth('e');
    expect(res).toEqual({ id: 1 });
  });

  it('findOneVisible calls service.findOneVisible', async () => {
    service.findOneVisible.mockResolvedValue({ id: 1 });
    const res = await controller.findOneVisible(1 as any, 2 as any);
    expect(res).toEqual({ id: 1 });
  });

  it('update calls service.update', async () => {
    service.update.mockResolvedValue({ id: 1 });
    const res = await controller.update(1 as any, { firstName: 'X' } as any);
    expect(res).toEqual({ id: 1 });
  });

  it('updateCredentials calls service.updateCredentials', async () => {
    service.updateCredentials.mockResolvedValue({ updated: true });
    const res = await controller.updateCredentials(1 as any, { passwordHash: 'p' } as any);
    expect(res).toEqual({ updated: true });
  });

  it('remove calls service.remove', async () => {
    service.remove.mockResolvedValue({ deleted: true });
    const res = await controller.remove(1 as any);
    expect(res).toEqual({ deleted: true });
  });
});

