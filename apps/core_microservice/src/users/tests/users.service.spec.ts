import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UsersRepository } from '../users.repository';
import { UsersCredentialRepository } from '../users-credencial.repository';
import { VISIBILITY_READER } from '../ports/tokens';
import { ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: jest.Mocked<UsersRepository>;
  let credsRepo: jest.Mocked<UsersCredentialRepository>;
  let visibilityReader: { canViewProfile: jest.Mock };

  beforeEach(async () => {
    usersRepo = {
      findOneByEmail: jest.fn(),
      findOneByUserName: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
    } as any;

    credsRepo = {
      createForUser: jest.fn(),
      updatePassword: jest.fn(),
      updateRefreshToken: jest.fn(),
      getPasswordByUserId: jest.fn(),
    } as any;

    visibilityReader = { canViewProfile: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: usersRepo },
        { provide: UsersCredentialRepository, useValue: credsRepo },
        { provide: VISIBILITY_READER, useValue: visibilityReader },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('create throws ConflictException when email exists', async () => {
    usersRepo.findOneByEmail.mockResolvedValue({ id: 1 } as any);
    await expect(
      service.create({ firstName: 'A', lastName: 'B', email: 'e', username: 'u', passwordHash: 'p' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('create throws InternalServerErrorException when repository create fails', async () => {
    usersRepo.findOneByEmail.mockResolvedValue(null);
    usersRepo.create.mockResolvedValue(null);
    await expect(
      service.create({ firstName: 'A', lastName: 'B', email: 'e', username: 'u', passwordHash: 'p' } as any),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('create returns response and creates credentials', async () => {
    usersRepo.findOneByEmail.mockResolvedValue(null);
    usersRepo.create.mockResolvedValue({ id: 10, firstName: 'A', lastName: 'B', email: 'e', username: 'u' } as any);
    credsRepo.createForUser.mockResolvedValue({} as any);

    const res = await service.create({ firstName: 'A', lastName: 'B', email: 'e', username: 'u', passwordHash: 'p' } as any);
    expect(res).toMatchObject({ id: 10, firstName: 'A', lastName: 'B', email: 'e', username: 'u' });
    expect(credsRepo.createForUser).toHaveBeenCalledWith(10, 'p');
  });

  it('findOneVisible throws NotFound when user missing', async () => {
    usersRepo.findById.mockResolvedValue(null);
    await expect(service.findOneVisible(1, 2)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findOneVisible returns hidden dto when cannot view', async () => {
    usersRepo.findById.mockResolvedValue({ id: 2, firstName: 'A', lastName: 'B', email: 'e', phone: 'p', isPrivate: true } as any);
    visibilityReader.canViewProfile.mockResolvedValue(false);
    const res = await service.findOneVisible(1, 2);
    expect(res).toEqual({ id: 2, firstName: 'A', lastName: 'B' });
  });

  it('findOneVisible returns full dto when can view', async () => {
    usersRepo.findById.mockResolvedValue({ id: 2, firstName: 'A', lastName: 'B', email: 'e', phone: 'p', isPrivate: false } as any);
    visibilityReader.canViewProfile.mockResolvedValue(true);
    const res = await service.findOneVisible(1, 2);
    expect(res).toMatchObject({ id: 2, email: 'e', phone: 'p', isPrivate: false });
  });

  it('update returns mapped dto', async () => {
    usersRepo.update.mockResolvedValue({ id: 3, firstName: 'X', lastName: 'Y', username: 'u', email: 'e', phone: null, isPrivate: false } as any);
    const res = await service.update(3, { firstName: 'X' } as any);
    expect(res).toMatchObject({ id: 3, firstName: 'X' });
  });

  it('update throws NotFound when missing', async () => {
    usersRepo.update.mockResolvedValue(null);
    await expect(service.update(3, { firstName: 'X' } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove returns deleted true', async () => {
    usersRepo.delete.mockResolvedValue(true);
    const res = await service.remove(5);
    expect(res).toEqual({ deleted: true });
  });

  it('remove throws NotFound when not deleted', async () => {
    usersRepo.delete.mockResolvedValue(false);
    await expect(service.remove(5)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findByEmailForAuth returns data', async () => {
    usersRepo.findOneByEmail.mockResolvedValue({ id: 7, email: 'e' } as any);
    credsRepo.getPasswordByUserId.mockResolvedValue('hash');
    const res = await service.findByEmailForAuth('e');
    expect(res).toEqual({ id: 7, email: 'e', passwordHash: 'hash' });
  });

  it('findByEmailForAuth throws when user missing', async () => {
    usersRepo.findOneByEmail.mockResolvedValue(null);
    await expect(service.findByEmailForAuth('e')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findByEmailForAuth throws when password missing', async () => {
    usersRepo.findOneByEmail.mockResolvedValue({ id: 7, email: 'e' } as any);
    credsRepo.getPasswordByUserId.mockResolvedValue(null);
    await expect(service.findByEmailForAuth('e')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateCredentials updates password and refresh', async () => {
    credsRepo.updateRefreshToken.mockResolvedValue();
    credsRepo.updatePassword.mockResolvedValue();
    const res = await service.updateCredentials(1, { refreshTokenHash: 'r', passwordHash: 'p' });
    expect(res).toEqual({ updated: true });
    expect(credsRepo.updateRefreshToken).toHaveBeenCalledWith(1, 'r');
    expect(credsRepo.updatePassword).toHaveBeenCalledWith(1, 'p');
  });

  it('findAll maps users', async () => {
    usersRepo.findMany.mockResolvedValue([
      { id: 1, firstName: 'A', lastName: 'B', username: 'u', email: 'e', phone: null, isPrivate: false } as any,
    ]);
    const res = await service.findAll();
    expect(res[0]).toMatchObject({ id: 1, email: 'e' });
  });

  it('find by email invokes findByEmail', async () => {
    usersRepo.findOneByEmail.mockResolvedValue({ id: 1, email: 'e' } as any);
    const res = await service.find('e');
    expect(res).toMatchObject({ id: 1, email: 'e' });
  });
});

